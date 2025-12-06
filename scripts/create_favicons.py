#!/usr/bin/env python3
"""
Create favicon files from SVG
"""

try:
    import cairosvg
except ImportError:
    print("Error: cairosvg not installed. Install with: pip install cairosvg")
    exit(1)

from pathlib import Path

# Paths
svg_path = Path(__file__).parent.parent / "public" / "favicon.svg"
public_path = Path(__file__).parent.parent / "public"

# Create favicon PNGs
favicon_16 = public_path / "favicon-16x16.png"
favicon_32 = public_path / "favicon-32x32.png"
apple_touch = public_path / "apple-touch-icon.png"

# Convert SVG to PNG (16x16)
cairosvg.svg2png(
    url=str(svg_path), write_to=str(favicon_16), output_width=16, output_height=16
)

# Convert SVG to PNG (32x32)
cairosvg.svg2png(
    url=str(svg_path), write_to=str(favicon_32), output_width=32, output_height=32
)

# Convert SVG to PNG (180x180 for Apple touch icon)
cairosvg.svg2png(
    url=str(svg_path), write_to=str(apple_touch), output_width=180, output_height=180
)

print(f"Created {favicon_16}")
print(f"Created {favicon_32}")
print(f"Created {apple_touch}")

