#!/usr/bin/env python3
"""
Update HITAS indices from Helsinki city's PDF file.
Downloads the latest PDF, parses the index tables, and updates index.html.
"""

import sys
import json
from pathlib import Path
import urllib.request
import ssl
import io

try:
    import pdfplumber
except ImportError:
    print("Error: pdfplumber not installed. Install with: pip install pdfplumber")
    sys.exit(1)

# Import the old market index importer and rajaneliöhinta importer
from import_old_market_index import get_old_market_index
from import_rajaneliohinta import get_rajaneliohinta
from import_rajaneliohinta_tilasto import get_rajaneliohinta_tilasto

PDF_URL = "https://www.hel.fi/static/kv/asunto-osasto/hitas-indeksit-2005-100.pdf"
HTML_PATH = Path(__file__).parent.parent / "index.html"


def download_pdf():
    """Download the latest PDF from Helsinki city website to memory."""
    print(f"Downloading PDF from {PDF_URL}...")

    try:
        # Create SSL context that doesn't verify certificates (for compatibility)
        ssl_context = ssl._create_unverified_context()

        with urllib.request.urlopen(PDF_URL, context=ssl_context) as response:
            pdf_data = response.read()
        print(f"PDF downloaded successfully ({len(pdf_data)} bytes)")
        return io.BytesIO(pdf_data)
    except Exception as e:
        print(f"Error downloading PDF: {e}")
        return None


def parse_index_table(text, index_name):
    """Parse index table from text content."""
    indices = {}

    # Find the table section
    lines = text.split("\n")
    in_table = False

    for line in lines:
        # Skip empty lines
        if not line.strip():
            continue

        # Check if we're at the start of a table (year/month header)
        if "Vuosi/kk" in line:
            in_table = True
            continue

        # Check if we've reached the end (source line)
        if "Lähde:" in line or "Helsinki" in line:
            in_table = False
            continue

        if in_table:
            # Try to parse year and monthly values
            parts = line.split()
            if len(parts) >= 2:
                try:
                    year = int(parts[0])
                    if 2005 <= year <= 2100:  # Reasonable year range
                        indices[year] = {}

                        # Parse monthly values (skip the year)
                        month = 1
                        for value_str in parts[1:]:
                            if value_str.startswith("(") and value_str.endswith(")"):
                                # Provisional value in parentheses
                                value_str = value_str[1:-1]

                            try:
                                value = float(value_str)
                                indices[year][month] = value
                                month += 1
                            except ValueError:
                                # Not a valid number, skip
                                pass
                except ValueError:
                    # Not a valid year line
                    pass

    return indices


def extract_indices_from_pdf(pdf_data):
    """Extract both index tables from PDF."""
    rakennuskustannus = {}
    markkinahinta = {}

    print("Parsing PDF...")

    with pdfplumber.open(pdf_data) as pdf:
        full_text = ""
        for page in pdf.pages:
            full_text += page.extract_text() + "\n"

        # Split into sections
        sections = full_text.split("Rakennuskustannusindeksi")
        if len(sections) > 1:
            # First section after "Rakennuskustannusindeksi" contains the table
            rakennuskustannus_section = sections[1].split("Markkinahintaindeksi")[0]
            rakennuskustannus = parse_index_table(
                rakennuskustannus_section, "Rakennuskustannus"
            )
            print(f"Parsed Rakennuskustannusindeksi: {len(rakennuskustannus)} years")

        sections = full_text.split("Markkinahintaindeksi")
        if len(sections) > 1:
            # Section after "Markkinahintaindeksi"
            markkinahinta_section = sections[1]
            markkinahinta = parse_index_table(markkinahinta_section, "Markkinahinta")
            print(f"Parsed Markkinahintaindeksi: {len(markkinahinta)} years")

    return rakennuskustannus, markkinahinta


def create_json_file(
    rakennuskustannus,
    markkinahinta,
    old_market_index,
    rajaneliohinta,
    rajaneliohinta_tilasto,
):
    """Create JSON file with current date in filename."""
    from datetime import datetime

    today = datetime.now().strftime("%Y-%m-%d")
    json_filename = f"indices-{today}.json"
    json_path = Path(__file__).parent.parent / "public" / "data" / json_filename

    print(f"Creating {json_path}...")

    # Convert all keys to strings for JSON compatibility
    data = {
        "updated": today,
        "rakennuskustannusindeksi": {
            str(year): {str(month): value for month, value in months.items()}
            for year, months in rakennuskustannus.items()
        },
        "markkinahintaindeksi": {
            str(year): {str(month): value for month, value in months.items()}
            for year, months in markkinahinta.items()
        },
        "vanhat_markkinahintaindeksi": {
            str(year): {str(month): value for month, value in months.items()}
            for year, months in old_market_index.items()
        },
    }

    # Add rajaneliöhinta if available
    if rajaneliohinta:
        data["rajaneliohinta"] = rajaneliohinta

    # Add rajaneliöhinta tilasto (historical data) if available
    if rajaneliohinta_tilasto:
        data["rajaneliohinta_tilasto"] = {
            str(year): {str(month): value for month, value in months.items()}
            for year, months in rajaneliohinta_tilasto.items()
        }

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"JSON file created: {json_filename}")
    return json_filename


def update_html_reference(json_filename):
    """
    Update HTML to reference the new JSON file.
    Note: This function is no longer needed as indices files are now loaded
    automatically by finding the latest file. Kept for backwards compatibility.
    """
    print("Note: HTML files now automatically find the latest indices file.")
    print("No manual update needed.")
    return True


def main():
    """Main function."""
    print("HITAS Index Updater")
    print("=" * 50)

    # Download PDF
    pdf_data = download_pdf()
    if not pdf_data:
        print("Error: Failed to download PDF")
        return 1

    # Extract indices
    rakennuskustannus, markkinahinta = extract_indices_from_pdf(pdf_data)

    if not rakennuskustannus or not markkinahinta:
        print("Error: Failed to extract indices from PDF")
        return 1

    # Get old market index (for apartments before 2011)
    print("\n" + "=" * 50)
    print("Fetching old market index (pre-2011)...")
    print("=" * 50)
    old_market_index = get_old_market_index()

    if not old_market_index:
        print("Warning: Failed to get old market index")
        print("Continuing without old market index data...")

    # Get rajaneliöhinta (price floor for all HITAS apartments)
    print("\n" + "=" * 50)
    print("Fetching rajaneliöhinta...")
    print("=" * 50)
    rajaneliohinta = get_rajaneliohinta()

    if not rajaneliohinta:
        print("Warning: Failed to get rajaneliöhinta")
        print("Continuing without rajaneliöhinta data...")

    # Get rajaneliöhinta tilasto (historical data)
    # Pass current rajaneliöhinta so it can be added to the historical data
    print("\n" + "=" * 50)
    print("Fetching rajaneliöhinta tilasto (historical data)...")
    print("=" * 50)
    rajaneliohinta_tilasto = get_rajaneliohinta_tilasto(
        current_rajaneliohinta=rajaneliohinta if rajaneliohinta else None
    )

    if not rajaneliohinta_tilasto:
        print("Warning: Failed to get rajaneliöhinta tilasto")
        print("Continuing without rajaneliöhinta tilasto data...")

    # Display summary
    print("\n" + "=" * 50)
    print("SUMMARY")
    print("=" * 50)
    print(f"Rakennuskustannusindeksi: {len(rakennuskustannus)} years")
    latest_rk_year = max(rakennuskustannus.keys())
    latest_rk_month = max(rakennuskustannus[latest_rk_year].keys())
    latest_rk_value = rakennuskustannus[latest_rk_year][latest_rk_month]
    print(f"  Latest: {latest_rk_month}/{latest_rk_year} = {latest_rk_value}")

    print(f"Markkinahintaindeksi: {len(markkinahinta)} years")
    latest_mh_year = max(markkinahinta.keys())
    latest_mh_month = max(markkinahinta[latest_mh_year].keys())
    latest_mh_value = markkinahinta[latest_mh_year][latest_mh_month]
    print(f"  Latest: {latest_mh_month}/{latest_mh_year} = {latest_mh_value}")

    if old_market_index:
        print(f"Vanhat markkinahintaindeksi: {len(old_market_index)} years")
        latest_old_year = max(old_market_index.keys())
        latest_old_month = max(old_market_index[latest_old_year].keys())
        latest_old_value = old_market_index[latest_old_year][latest_old_month]
        print(f"  Latest: {latest_old_month}/{latest_old_year} = {latest_old_value}")

    if rajaneliohinta:
        print(f"Rajaneliöhinta: {rajaneliohinta['price_per_sqm']} €/m²")
        print(
            f"  Valid: {rajaneliohinta['valid_from']} - {rajaneliohinta['valid_until']}"
        )

    if rajaneliohinta_tilasto:
        total_values = sum(len(months) for months in rajaneliohinta_tilasto.values())
        print(f"Rajaneliöhinta tilasto: {total_values} historical values")
        print(
            f"  Years: {min(rajaneliohinta_tilasto.keys())} - {max(rajaneliohinta_tilasto.keys())}"
        )

    print("=" * 50)

    # Create JSON file
    json_filename = create_json_file(
        rakennuskustannus,
        markkinahinta,
        old_market_index if old_market_index else {},
        rajaneliohinta if rajaneliohinta else None,
        rajaneliohinta_tilasto if rajaneliohinta_tilasto else None,
    )

    # Update HTML reference
    if update_html_reference(json_filename):
        print("\n✅ Update complete!")
        return 0
    else:
        print("\n❌ Update failed!")
        return 1


if __name__ == "__main__":
    sys.exit(main())
