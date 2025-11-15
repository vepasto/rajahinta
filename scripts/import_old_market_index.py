#!/usr/bin/env python3
"""
Import old market price index (vanhojen osakeasuntojen hintaindeksi) for apartments completed before 2011.
Source: https://www.hel.fi/static/kv/asunto-osasto/hitas-markkinahintaindeksi.pdf
"""

import re
import io
import urllib.request
import ssl

try:
    import pdfplumber
except ImportError:
    print("Error: pdfplumber not installed. Install with: pip install pdfplumber")
    raise


OLD_INDEX_PDF_URL = "https://www.hel.fi/static/kv/asunto-osasto/hitas-markkinahintaindeksi.pdf"


def download_old_index_pdf():
    """Download the old market price index PDF from Helsinki city website."""
    print(f"Downloading old market index PDF from {OLD_INDEX_PDF_URL}...")
    
    try:
        # Create SSL context that doesn't verify certificates (for compatibility)
        ssl_context = ssl._create_unverified_context()
        
        with urllib.request.urlopen(OLD_INDEX_PDF_URL, context=ssl_context) as response:
            pdf_data = response.read()
        print(f"Old market index PDF downloaded successfully ({len(pdf_data)} bytes)")
        return io.BytesIO(pdf_data)
    except Exception as e:
        print(f"Error downloading old market index PDF: {e}")
        return None


def parse_old_market_index_table(pdf_data):
    """
    Parse the old market price index table from PDF.
    The table structure is:
    V/KK | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    2025 | 501.6 | 504.3 | ...
    
    Returns a dictionary: {year: {month: value}}
    """
    indices = {}
    
    print("Parsing old market index PDF...")
    
    with pdfplumber.open(pdf_data) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            # Extract tables from the page
            tables = page.extract_tables()
            
            for table in tables:
                # Skip empty tables
                if not table:
                    continue
                
                # Process each row
                for row in table:
                    if not row or len(row) < 2:
                        continue
                    
                    # Try to find the year in the first few columns
                    year = None
                    year_col_idx = None
                    
                    for i in range(min(3, len(row))):
                        if row[i]:
                            cell_str = str(row[i]).strip()
                            if cell_str.isdigit() and len(cell_str) == 4:
                                try:
                                    potential_year = int(cell_str)
                                    if 1978 <= potential_year <= 2100:
                                        year = potential_year
                                        year_col_idx = i
                                        break
                                except ValueError:
                                    pass
                    
                    # Skip if no valid year found
                    if year is None:
                        continue
                    
                    # Initialize year in indices
                    if year not in indices:
                        indices[year] = {}
                    
                    # Extract monthly values from remaining columns
                    # We expect 12 months of data after the year column
                    values = []
                    for i in range(year_col_idx + 1, len(row)):
                        if row[i] is not None:
                            value_str = str(row[i]).strip()
                            if value_str and value_str != "" and value_str != "None":
                                try:
                                    value = float(value_str)
                                    values.append(value)
                                except ValueError:
                                    pass
                    
                    # Assign values to months
                    # The pattern seems to be: each value might be repeated (e.g., 504.3, 504.3, 504.3)
                    # So we need to extract unique consecutive values or take every nth value
                    # Based on the data structure, values appear to be in groups
                    
                    # For simplicity, let's just take the first 12 non-None numeric values
                    month = 1
                    for value in values:
                        if month <= 12:
                            # Only set if not already set (avoid overwriting with repeated values)
                            if month not in indices[year]:
                                indices[year][month] = value
                                month += 1
                            elif indices[year][month] == value:
                                # Skip duplicate values
                                month += 1
    
    # Remove years with no data
    indices = {year: months for year, months in indices.items() if months}
    
    print(f"Parsed old market index: {len(indices)} years")
    if indices:
        min_year = min(indices.keys())
        max_year = max(indices.keys())
        print(f"  Year range: {min_year} - {max_year}")
        
        # Show latest value
        if max_year in indices and indices[max_year]:
            latest_month = max(indices[max_year].keys())
            latest_value = indices[max_year][latest_month]
            print(f"  Latest: {latest_month}/{max_year} = {latest_value}")
    
    return indices


def get_old_market_index():
    """
    Download and parse the old market price index.
    Returns a dictionary: {year: {month: value}}
    """
    pdf_data = download_old_index_pdf()
    if not pdf_data:
        return {}
    
    return parse_old_market_index_table(pdf_data)


if __name__ == "__main__":
    # Test the importer
    print("Testing old market index importer...")
    print("=" * 50)
    
    indices = get_old_market_index()
    
    if indices:
        print("\n" + "=" * 50)
        print("SUCCESS")
        print("=" * 50)
        print(f"Total years: {len(indices)}")
        
        # Show a few sample values
        print("\nSample values:")
        sample_years = sorted(indices.keys(), reverse=True)[:3]
        for year in sample_years:
            print(f"\n{year}:")
            for month in sorted(indices[year].keys()):
                print(f"  Month {month}: {indices[year][month]}")
    else:
        print("\n❌ Failed to import old market index")

