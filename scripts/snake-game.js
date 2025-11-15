// Snake Game - Easter Egg for HITAS Calculator
// A snake game where the snake is represented as a building with a roof

(function() {
    'use strict';

    // DOM Elements
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const snakeGameOverlay = document.getElementById('snakeGame');
    const houseButton = document.getElementById('houseButton');
    const closeGameButton = document.getElementById('closeGame');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const gameOverContainer = document.getElementById('gameOverContainer');

    const gridSize = 20;
    const tileCount = canvas.width / gridSize;

    let snakeHead = { x: 10, y: 10 };
    let snakeHeadPixel = { x: 10, y: 10 }; // Smooth pixel position
    let prevHeadPixel = { x: 10, y: 10 }; // Previous frame head position for rotation
    let snakeLength = 3; // Length in grid units
    let food = {};
    let dx = 0;
    let dy = 1; // Start moving down
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let animationLoop = null;
    let gameRunning = false;
    let moveProgress = 0; // 0 to 1, progress to next grid cell
    let pixelsPerFrame = 0.15; // Speed of smooth movement (higher = faster)
    let stretchEffect = 0; // Stretch animation effect
    let snakeTrail = []; // Trail of positions for collision detection
    let inputQueue = []; // Queue for direction changes

    highScoreElement.textContent = highScore;

    function drawStretchyHouse(trail, headPixelPos, progress, length, stretchAnim = 0) {
        if (trail.length === 0) return;
        
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = gridSize * 0.85;
        ctx.lineCap = 'butt'; // Flat tail
        ctx.lineJoin = 'round';
        
        // Calculate smooth tail position
        const totalLength = length;
        const headProgress = trail.length - 1 + progress;
        const tailProgress = Math.max(0, headProgress - totalLength);
        
        const tailIndex = Math.floor(tailProgress);
        const tailOffset = tailProgress - tailIndex;
        
        let tailX, tailY;
        if (tailIndex >= trail.length - 1) {
            tailX = headPixelPos.x;
            tailY = headPixelPos.y;
        } else if (tailIndex < 0) {
            tailX = trail[0].x;
            tailY = trail[0].y;
        } else if (tailIndex >= trail.length - 2) {
            const prev = trail[trail.length - 1];
            tailX = prev.x + (headPixelPos.x - prev.x) * tailOffset;
            tailY = prev.y + (headPixelPos.y - prev.y) * tailOffset;
        } else {
            const curr = trail[tailIndex];
            const next = trail[tailIndex + 1];
            tailX = curr.x + (next.x - curr.x) * tailOffset;
            tailY = curr.y + (next.y - curr.y) * tailOffset;
        }
        
        // Draw snake as a simple line from tail to head
        ctx.beginPath();
        ctx.moveTo(tailX * gridSize + gridSize / 2, tailY * gridSize + gridSize / 2);
        
        const startIdx = Math.max(0, Math.ceil(tailProgress));
        for (let i = startIdx; i < trail.length; i++) {
            const pos = trail[i];
            ctx.lineTo(pos.x * gridSize + gridSize / 2, pos.y * gridSize + gridSize / 2);
        }
        
        ctx.lineTo(headPixelPos.x * gridSize + gridSize / 2, headPixelPos.y * gridSize + gridSize / 2);
        ctx.stroke();
    }

    function drawFood(x, y) {
        const scale = gridSize / 100;
        ctx.save();
        ctx.translate(x * gridSize + gridSize / 2, y * gridSize + gridSize / 2);
        ctx.scale(scale, scale);
        
        // Simple house for food
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-20, 10);
        ctx.lineTo(20, 10);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillRect(-20, 10, 40, 30);
        
        ctx.restore();
    }

    function initGame() {
        snakeHead = { x: 10, y: 10 };
        snakeHeadPixel = { x: 10, y: 10 };
        prevHeadPixel = { x: 10, y: 10 };
        snakeLength = 3;
        // Initialize trail with starting length
        snakeTrail = [
            { x: 10, y: 10 },
            { x: 10, y: 9 },
            { x: 10, y: 8 }
        ];
        dx = 0;
        dy = 1; // Start moving down
        score = 0;
        moveProgress = 0;
        pixelsPerFrame = 0.15;
        stretchEffect = 0;
        inputQueue = []; // Clear input queue
        scoreElement.textContent = score;
        gameOverContainer.innerHTML = '';
        generateFood();
        gameRunning = true;
    }

    function generateFood() {
        let validPosition = false;
        while (!validPosition) {
            food = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
            
            // Check if food spawns on snake trail
            validPosition = true;
            for (let pos of snakeTrail) {
                if (pos.x === food.x && pos.y === food.y) {
                    validPosition = false;
                    break;
                }
            }
        }
    }

    function drawGame() {
        // Clear canvas
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = '#2a2a3e';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }

        // Update stretch effect (decay over time)
        if (stretchEffect > 0) {
            stretchEffect -= 0.05;
            if (stretchEffect < 0) stretchEffect = 0;
        }

        // Draw the winding skyscraper following the trail
        drawStretchyHouse(snakeTrail, snakeHeadPixel, moveProgress, snakeLength, stretchEffect);

        // Draw food
        drawFood(food.x, food.y);
    }

    function animate() {
        if (!gameRunning) return;
        
        // Store previous position for smooth rotation
        prevHeadPixel.x = snakeHeadPixel.x;
        prevHeadPixel.y = snakeHeadPixel.y;
        
        // Update smooth movement
        if (dx !== 0 || dy !== 0) {
            moveProgress += pixelsPerFrame;
            
            if (moveProgress >= 1.0) {
                moveProgress = 0;
                // Trigger actual grid move
                moveSnake();
            }
            
            // Update pixel position
            snakeHeadPixel.x = snakeHead.x + dx * moveProgress;
            snakeHeadPixel.y = snakeHead.y + dy * moveProgress;
            
            // Check for food collision based on visual head position
            const visualGridX = Math.round(snakeHeadPixel.x);
            const visualGridY = Math.round(snakeHeadPixel.y);
            
            if (visualGridX === food.x && visualGridY === food.y && food.x !== -1) {
                // Eat food immediately when visual head reaches it
                score += 10;
                scoreElement.textContent = score;
                snakeLength += 1;
                stretchEffect = 1.0;
                
                // Mark as eaten to prevent double eating
                food = { x: -1, y: -1 };
                
                // Generate new food after marking old one as eaten
                generateFood();
                
                if (pixelsPerFrame < 0.3) {
                    pixelsPerFrame += 0.01;
                }
            }
        }
        
        drawGame();
        animationLoop = requestAnimationFrame(animate);
    }

    function moveSnake() {
        if (!gameRunning) return;

        // Process next direction from input queue
        if (inputQueue.length > 0) {
            const nextDir = inputQueue.shift();
            dx = nextDir.dx;
            dy = nextDir.dy;
        }

        // Calculate new head position
        const newHead = { x: snakeHead.x + dx, y: snakeHead.y + dy };

        // Check wall collision
        if (newHead.x < 0 || newHead.x >= tileCount || newHead.y < 0 || newHead.y >= tileCount) {
            gameOver();
            return;
        }

        // Check self collision with trail (but not with positions we're about to leave)
        const tailCutoff = Math.max(0, snakeTrail.length - Math.floor(snakeLength));
        for (let i = 0; i < snakeTrail.length - tailCutoff; i++) {
            const pos = snakeTrail[i];
            if (pos.x === newHead.x && pos.y === newHead.y) {
                gameOver();
                return;
            }
        }

        // Move head
        snakeHead = newHead;
        snakeTrail.push({ x: newHead.x, y: newHead.y });

        // Keep trail at appropriate length (keep extra for smooth rendering)
        const maxTrailLength = Math.ceil(snakeLength) + 2;
        while (snakeTrail.length > maxTrailLength) {
            snakeTrail.shift();
        }
    }

    function gameOver() {
        gameRunning = false;
        if (animationLoop) {
            cancelAnimationFrame(animationLoop);
            animationLoop = null;
        }

        // Update high score
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
            
            gameOverContainer.innerHTML = `
                <div class="game-over-message">🎉 Uusi ennätys! 🎉</div>
                <div class="game-over-message">Peli päättyi! Pisteet: ${score}</div>
                <button class="restart-button" onclick="restartGame()">Pelaa uudelleen</button>
            `;
        } else {
            gameOverContainer.innerHTML = `
                <div class="game-over-message">Peli päättyi! Pisteet: ${score}</div>
                <button class="restart-button" onclick="restartGame()">Pelaa uudelleen</button>
            `;
        }
    }

    function restartGame() {
        initGame();
        if (animationLoop) cancelAnimationFrame(animationLoop);
        animate();
    }

    function changeDirection(event) {
        const key = event.key.toLowerCase();
        
        // Get current direction (either from queue or current direction)
        let currentDx = dx;
        let currentDy = dy;
        if (inputQueue.length > 0) {
            const lastInQueue = inputQueue[inputQueue.length - 1];
            currentDx = lastInQueue.dx;
            currentDy = lastInQueue.dy;
        }
        
        let newDx, newDy;
        
        // Determine new direction based on key
        if (key === 'arrowleft' || key === 'a') {
            newDx = -1;
            newDy = 0;
        } else if (key === 'arrowright' || key === 'd') {
            newDx = 1;
            newDy = 0;
        } else if (key === 'arrowup' || key === 'w') {
            newDx = 0;
            newDy = -1;
        } else if (key === 'arrowdown' || key === 's') {
            newDx = 0;
            newDy = 1;
        } else {
            return; // Invalid key
        }
        
        // Prevent reversing (going back on itself)
        if (newDx === -currentDx && newDy === -currentDy) {
            return;
        }
        
        // Prevent adding duplicate directions
        if (newDx === currentDx && newDy === currentDy) {
            return;
        }
        
        // Add to queue (max 2 inputs buffered)
        if (inputQueue.length < 2) {
            inputQueue.push({ dx: newDx, dy: newDy });
        }
    }

    // Open game
    houseButton.addEventListener('click', function() {
        snakeGameOverlay.classList.add('active');
        restartGame();
    });

    // Close game
    closeGameButton.addEventListener('click', function() {
        snakeGameOverlay.classList.remove('active');
        gameRunning = false;
        if (animationLoop) {
            cancelAnimationFrame(animationLoop);
            animationLoop = null;
        }
    });

    // Keyboard controls
    document.addEventListener('keydown', function(event) {
        if (snakeGameOverlay.classList.contains('active')) {
            changeDirection(event);
            event.preventDefault();
        }
    });

    // Close with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && snakeGameOverlay.classList.contains('active')) {
            closeGameButton.click();
        }
    });

    // Mobile controls - touch buttons
    const controlButtons = document.querySelectorAll('.control-btn[data-direction]');
    controlButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!snakeGameOverlay.classList.contains('active') || !gameRunning) return;
            
            const direction = this.getAttribute('data-direction');
            const fakeEvent = { key: direction === 'up' ? 'ArrowUp' : 
                                    direction === 'down' ? 'ArrowDown' :
                                    direction === 'left' ? 'ArrowLeft' : 'ArrowRight' };
            changeDirection(fakeEvent);
        });
    });

    // Swipe detection for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const minSwipeDistance = 30;

    canvas.addEventListener('touchstart', function(e) {
        if (!snakeGameOverlay.classList.contains('active') || !gameRunning) return;
        e.preventDefault();
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: false });

    canvas.addEventListener('touchend', function(e) {
        if (!snakeGameOverlay.classList.contains('active') || !gameRunning) return;
        e.preventDefault();
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: false });

    function handleSwipe() {
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        const absDiffX = Math.abs(diffX);
        const absDiffY = Math.abs(diffY);

        // Check if swipe is long enough
        if (absDiffX < minSwipeDistance && absDiffY < minSwipeDistance) {
            return;
        }

        // Determine swipe direction
        if (absDiffX > absDiffY) {
            // Horizontal swipe
            if (diffX > 0) {
                changeDirection({ key: 'ArrowRight' });
            } else {
                changeDirection({ key: 'ArrowLeft' });
            }
        } else {
            // Vertical swipe
            if (diffY > 0) {
                changeDirection({ key: 'ArrowDown' });
            } else {
                changeDirection({ key: 'ArrowUp' });
            }
        }
    }

    // Make restartGame available globally for the onclick handler
    window.restartGame = restartGame;
})();

