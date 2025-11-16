#!/usr/bin/env python3
"""
Create Open Graph images from SVG
"""

import cairosvg
from pathlib import Path

# Paths
svg_path = Path(__file__).parent.parent / "og-image.svg"
png_path = Path(__file__).parent.parent / "og-image.png"

svg_square_path = Path(__file__).parent.parent / "og-image-square.svg"
png_square_path = Path(__file__).parent.parent / "og-image-square.png"

# Convert SVG to PNG (1200x630 for Open Graph - Facebook/Twitter)
cairosvg.svg2png(
    url=str(svg_path), write_to=str(png_path), output_width=1200, output_height=630
)

# Convert square SVG to PNG (1200x1200 for WhatsApp)
cairosvg.svg2png(
    url=str(svg_square_path),
    write_to=str(png_square_path),
    output_width=1200,
    output_height=1200,
)

print(f"Created {png_path}")
print(f"Created {png_square_path}")
