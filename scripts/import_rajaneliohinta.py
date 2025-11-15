#!/usr/bin/env python3
"""
Import rajaneliöhinta (HITAS apartment price floor per square meter).
Source: https://www.hel.fi/static/kv/asunto-osasto/hitas-rajahinta.pdf
"""

import re
import io
import urllib.request
import ssl
from datetime import datetime

try:
    import pdfplumber
except ImportError:
    print("Error: pdfplumber not installed. Install with: pip install pdfplumber")
    raise


RAJAHINTA_PDF_URL = "https://www.hel.fi/static/kv/asunto-osasto/hitas-rajahinta.pdf"


def download_rajahinta_pdf():
    """Download the rajaneliöhinta PDF from Helsinki city website."""
    print(f"Downloading rajaneliöhinta PDF from {RAJAHINTA_PDF_URL}...")

    try:
        # Create SSL context that doesn't verify certificates (for compatibility)
        ssl_context = ssl._create_unverified_context()

        with urllib.request.urlopen(RAJAHINTA_PDF_URL, context=ssl_context) as response:
            pdf_data = response.read()
        print(f"Rajaneliöhinta PDF downloaded successfully ({len(pdf_data)} bytes)")
        return io.BytesIO(pdf_data)
    except Exception as e:
        print(f"Error downloading rajaneliöhinta PDF: {e}")
        return None


def parse_rajaneliohinta_from_pdf(pdf_data):
    """
    Parse the rajaneliöhinta (price per sqm) and validity period from PDF.

    Returns a dictionary with:
    - price_per_sqm: float
    - valid_from: str (YYYY-MM-DD)
    - valid_until: str (YYYY-MM-DD)
    """
    result = None

    print("Parsing rajaneliöhinta PDF...")

    with pdfplumber.open(pdf_data) as pdf:
        for page in pdf.pages:
            text = page.extract_text()

            if not text:
                continue

            # Look for the price pattern: "rajaneliöhinta on XXXX euroa/m²"
            price_match = re.search(
                r"rajaneliöhinta on\s+(\d+(?:\s+\d+)*)\s+euroa?/m", text, re.IGNORECASE
            )

            if price_match:
                # Extract price and remove spaces
                price_str = price_match.group(1).replace(" ", "")
                price = float(price_str)

                # Look for validity period: "voimassa X.Y.ZZZZ asti" or "voimassa DD.MM.YYYY - DD.MM.YYYY"
                validity_match = re.search(
                    r"voimassa\s+(\d{1,2})\.(\d{1,2})\.(\d{4})\s+asti",
                    text,
                    re.IGNORECASE,
                )

                if validity_match:
                    day = int(validity_match.group(1))
                    month = int(validity_match.group(2))
                    year = int(validity_match.group(3))
                    valid_until = f"{year:04d}-{month:02d}-{day:02d}"

                    # Calculate valid_from (3 months before valid_until)
                    # Rajaneliöhinta is updated quarterly: Feb, May, Aug, Nov
                    # Valid for 3 months each time
                    # If valid until 31.1.2026, it started 1.11.2025
                    if month <= 1:  # Valid until Jan -> started in Nov of previous year
                        from_month = 11
                        from_year = year - 1
                    elif month <= 4:  # Valid until Feb-Apr -> started in Nov
                        from_month = 11
                        from_year = year - 1
                    elif month <= 7:  # Valid until May-Jul -> started in Feb
                        from_month = 2
                        from_year = year
                    elif month <= 10:  # Valid until Aug-Oct -> started in May
                        from_month = 5
                        from_year = year
                    else:  # Valid until Nov-Dec -> started in Aug
                        from_month = 8
                        from_year = year

                    valid_from = f"{from_year:04d}-{from_month:02d}-01"

                    result = {
                        "price_per_sqm": price,
                        "valid_from": valid_from,
                        "valid_until": valid_until,
                        "description": "Kaikkien Hitas-yhtiöiden keskimääräisten neliöhintojen perusteella laskettu rajaneliöhinta. Päivitetään neljännesvuosittain.",
                        "source": RAJAHINTA_PDF_URL,
                    }

                    print(
                        f"Parsed rajaneliöhinta: {price} €/m² (valid {valid_from} - {valid_until})"
                    )
                    break

    if not result:
        print("Warning: Could not parse rajaneliöhinta from PDF")

    return result


def get_rajaneliohinta():
    """
    Download and parse the rajaneliöhinta.
    Returns a dictionary with price and validity information.
    """
    pdf_data = download_rajahinta_pdf()
    if not pdf_data:
        return None

    return parse_rajaneliohinta_from_pdf(pdf_data)


if __name__ == "__main__":
    # Test the importer
    print("Testing rajaneliöhinta importer...")
    print("=" * 50)

    rajahinta = get_rajaneliohinta()

    if rajahinta:
        print("\n" + "=" * 50)
        print("SUCCESS")
        print("=" * 50)
        print(f"Rajaneliöhinta: {rajahinta['price_per_sqm']} €/m²")
        print(f"Valid from: {rajahinta['valid_from']}")
        print(f"Valid until: {rajahinta['valid_until']}")
        print(f"Description: {rajahinta['description']}")
    else:
        print("\n❌ Failed to import rajaneliöhinta")
