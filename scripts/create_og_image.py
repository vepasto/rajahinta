#!/usr/bin/env python3
"""
Create Open Graph image from SVG
"""

import cairosvg
from pathlib import Path

# Paths
svg_path = Path(__file__).parent.parent / "og-image.svg"
png_path = Path(__file__).parent.parent / "og-image.png"

# Convert SVG to PNG (1200x630 for Open Graph)
cairosvg.svg2png(
    url=str(svg_path), write_to=str(png_path), output_width=1200, output_height=630
)

print(f"Created {png_path}")
