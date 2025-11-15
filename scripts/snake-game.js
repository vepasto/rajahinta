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
    let pixelsPerFrame = 0.1; // Speed of smooth movement
    let stretchEffect = 0; // Stretch animation effect
    let snakeTrail = []; // Trail of positions for collision detection
    let inputQueue = []; // Queue for direction changes

    highScoreElement.textContent = highScore;

    function drawStretchyHouse(trail, headPixelPos, progress, length, stretchAnim = 0) {
        if (trail.length === 0) return;
        
        // Draw body with flat tail at the beginning and no cap at the end
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = gridSize * 0.85;
        ctx.lineCap = 'butt'; // Flat tail
        ctx.lineJoin = 'round';
        
        // Calculate smooth tail position
        // The tail should be 'length' grid units behind the head
        const totalLength = length;
        const headProgress = trail.length - 1 + progress;
        const tailProgress = Math.max(0, headProgress - totalLength);
        
        // Find tail position
        const tailIndex = Math.floor(tailProgress);
        const tailOffset = tailProgress - tailIndex;
        
        let tailX, tailY;
        if (tailIndex >= trail.length - 1) {
            // Tail is at or beyond current head
            tailX = headPixelPos.x;
            tailY = headPixelPos.y;
        } else if (tailIndex < 0) {
            // Tail is before first trail point
            tailX = trail[0].x;
            tailY = trail[0].y;
        } else if (tailIndex >= trail.length - 2) {
            // Interpolate between last trail point and head
            const prev = trail[trail.length - 1];
            tailX = prev.x + (headPixelPos.x - prev.x) * tailOffset;
            tailY = prev.y + (headPixelPos.y - prev.y) * tailOffset;
        } else {
            // Interpolate between two trail points
            const curr = trail[tailIndex];
            const next = trail[tailIndex + 1];
            tailX = curr.x + (next.x - curr.x) * tailOffset;
            tailY = curr.y + (next.y - curr.y) * tailOffset;
        }
        
        // Draw the body as a thick line from smooth tail to head
        // Use butt line cap for flat tail
        ctx.lineCap = 'butt';
        ctx.beginPath();
        ctx.moveTo(tailX * gridSize + gridSize / 2, tailY * gridSize + gridSize / 2);
        
        // Draw visible trail segments
        const startIdx = Math.max(0, Math.ceil(tailProgress));
        for (let i = startIdx; i < trail.length; i++) {
            const pos = trail[i];
            ctx.lineTo(pos.x * gridSize + gridSize / 2, pos.y * gridSize + gridSize / 2);
        }
        
        // End at head position
        ctx.lineTo(headPixelPos.x * gridSize + gridSize / 2, headPixelPos.y * gridSize + gridSize / 2);
        ctx.stroke();
        
        // Draw round head on top
        ctx.fillStyle = '#667eea';
        ctx.beginPath();
        ctx.arc(
            headPixelPos.x * gridSize + gridSize / 2,
            headPixelPos.y * gridSize + gridSize / 2,
            ctx.lineWidth / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
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
        pixelsPerFrame = 0.1;
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
            
            if (visualGridX === food.x && visualGridY === food.y) {
                // Eat food immediately when visual head reaches it
                score += 10;
                scoreElement.textContent = score;
                snakeLength += 1;
                generateFood();
                stretchEffect = 1.0;
                
                // Remove food to prevent double eating
                food = { x: -1, y: -1 };
                
                if (pixelsPerFrame < 0.25) {
                    pixelsPerFrame += 0.005;
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

    // Make restartGame available globally for the onclick handler
    window.restartGame = restartGame;
})();

