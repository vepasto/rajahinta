#!/usr/bin/env python3
"""
Import historical rajaneliöhinta data from tilasto PDF.
Source: https://www.hel.fi/static/kv/asunto-osasto/hitas-rajahintatilasto.pdf

This module accumulates historical data by:
1. Loading existing data from JSON files
2. Adding new values when they become available
3. Using hardcoded initial data as fallback
"""

import json
from pathlib import Path


def get_rajaneliohinta_tilasto_data():
    """
    Get historical rajaneliöhinta values.
    Data from: https://www.hel.fi/static/kv/asunto-osasto/hitas-rajahintatilasto.pdf

    Returns a dictionary: {year: {month: price_per_sqm}}
    Quarterly data (Feb, May, Aug, Nov) from 2010 to 2025
    """
    # Data from the official PDF chart
    # Format: (year, month, price)
    data_points = [
        (2010, 1, 2737),
        (2010, 2, 2860),
        (2010, 5, 2942),
        (2010, 8, 3023),
        (2010, 11, 3013),
        (2011, 2, 3051),
        (2011, 5, 3109),
        (2011, 8, 3151),
        (2011, 11, 3137),
        (2012, 2, 3107),
        (2012, 5, 3176),
        (2012, 8, 3140),
        (2012, 11, 3205),
        (2013, 2, 3229),
        (2013, 5, 3276),
        (2013, 8, 3281),
        (2013, 11, 3354),
        (2014, 2, 3322),
        (2014, 5, 3306),
        (2014, 8, 3411),
        (2014, 11, 3342),
        (2015, 2, 3336),
        (2015, 5, 3353),
        (2015, 8, 3367),
        (2015, 11, 3384),
        (2016, 2, 3417),
        (2016, 5, 3462),
        (2016, 8, 3492),
        (2016, 11, 3534),
        (2017, 2, 3555),
        (2017, 5, 3559),
        (2017, 8, 3665),
        (2017, 11, 3678),
        (2018, 2, 3704),
        (2018, 5, 3728),
        (2018, 8, 3839),
        (2018, 11, 3867),
        (2019, 2, 3927),
        (2019, 5, 3946),
        (2019, 8, 4094),
        (2019, 11, 4095),
        (2020, 2, 4134),
        (2020, 5, 4267),
        (2020, 8, 4383),
        (2020, 11, 4450),
        (2021, 2, 4547),
        (2021, 5, 4653),
        (2021, 8, 4802),
        (2021, 11, 4805),
        (2022, 2, 4863),
        (2022, 5, 4869),
        (2022, 8, 4872),
        (2022, 11, 4733),
        (2023, 2, 4621),
        (2023, 5, 4545),
        (2023, 8, 4461),
        (2023, 11, 4385),
        (2024, 2, 4295),
        (2024, 5, 4223),
        (2024, 8, 4256),
        (2024, 11, 4210),
        (2025, 2, 4237),
        (2025, 5, 4174),
        (2025, 8, 4242),
        (2025, 11, 4159),
    ]

    rajaneliohinta_data = {}

    for year, month, price in data_points:
        if year not in rajaneliohinta_data:
            rajaneliohinta_data[year] = {}
        rajaneliohinta_data[year][month] = price

    print(f"Loaded {len(data_points)} rajaneliöhinta values")
    print(
        f"Years: {min(rajaneliohinta_data.keys())} - {max(rajaneliohinta_data.keys())}"
    )

    return rajaneliohinta_data


def load_existing_tilasto_from_json():
    """
    Load existing rajaneliöhinta tilasto from the latest JSON file.
    Returns a dictionary: {year: {month: price}} or None if not found
    """
    data_dir = Path(__file__).parent.parent / "docs" / "data"

    if not data_dir.exists():
        return None

    # Find the latest indices JSON file
    json_files = sorted(data_dir.glob("indices-*.json"), reverse=True)

    for json_file in json_files:
        try:
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            if "rajaneliohinta_tilasto" in data:
                # Convert string keys back to integers
                tilasto = {}
                for year_str, months in data["rajaneliohinta_tilasto"].items():
                    year = int(year_str)
                    tilasto[year] = {int(m): p for m, p in months.items()}

                print(f"Loaded existing tilasto from {json_file.name}")
                return tilasto
        except Exception as e:
            print(f"Warning: Could not load tilasto from {json_file.name}: {e}")
            continue

    return None


def add_new_value_to_tilasto(tilasto_data, new_price, valid_from_date):
    """
    Add a new rajaneliöhinta value to the tilasto.

    Args:
        tilasto_data: Existing tilasto dictionary {year: {month: price}}
        new_price: New price value (float)
        valid_from_date: Date string in format "YYYY-MM-DD"

    Returns:
        Updated tilasto dictionary
    """
    try:
        # Parse the date
        year, month, day = map(int, valid_from_date.split("-"))

        # Check if this value already exists
        if year in tilasto_data and month in tilasto_data[year]:
            existing_price = tilasto_data[year][month]
            if (
                abs(existing_price - new_price) < 0.01
            ):  # Already exists (within rounding)
                print(
                    f"Value {new_price} €/m² for {year}-{month:02d} already exists, skipping"
                )
                return tilasto_data

        # Add new value
        if year not in tilasto_data:
            tilasto_data[year] = {}

        tilasto_data[year][month] = new_price
        print(f"Added new value: {year}-{month:02d} = {new_price} €/m²")

    except Exception as e:
        print(f"Warning: Could not add new value: {e}")

    return tilasto_data


def get_rajaneliohinta_tilasto(current_rajaneliohinta=None):
    """
    Get the rajaneliöhinta tilasto data.
    Accumulates data by:
    1. Loading existing data from JSON files
    2. Adding new values from current_rajaneliohinta if provided
    3. Using hardcoded initial data as fallback

    Args:
        current_rajaneliohinta: Optional dict with current rajaneliöhinta info
            Should contain: {"price_per_sqm": float, "valid_from": "YYYY-MM-DD"}

    Returns a dictionary with historical prices: {year: {month: price}}
    """
    # Try to load existing data from JSON
    tilasto_data = load_existing_tilasto_from_json()

    # If no existing data, use hardcoded initial data
    if not tilasto_data:
        print("No existing tilasto found, using initial hardcoded data")
        tilasto_data = get_rajaneliohinta_tilasto_data()
    else:
        print(
            f"Loaded {sum(len(months) for months in tilasto_data.values())} existing values"
        )

    # Add new value from current rajaneliöhinta if provided
    if (
        current_rajaneliohinta
        and "price_per_sqm" in current_rajaneliohinta
        and "valid_from" in current_rajaneliohinta
    ):
        tilasto_data = add_new_value_to_tilasto(
            tilasto_data,
            current_rajaneliohinta["price_per_sqm"],
            current_rajaneliohinta["valid_from"],
        )

    return tilasto_data


if __name__ == "__main__":
    # Test the importer
    print("Testing rajaneliöhinta tilasto importer...")
    print("=" * 50)

    tilasto_data = get_rajaneliohinta_tilasto()

    if tilasto_data:
        print("\n" + "=" * 50)
        print("SUCCESS")
        print("=" * 50)

        # Convert to JSON format for easy inspection
        # Convert keys to strings for JSON compatibility
        json_data = {}
        for year, months in sorted(tilasto_data.items()):
            json_data[str(year)] = {str(m): p for m, p in sorted(months.items())}

        print("\nSample data (first 5 entries):")
        count = 0
        for year, months in sorted(tilasto_data.items()):
            for month, price in sorted(months.items()):
                if count < 5:
                    print(f"  {year}-{month:02d}: {price} €/m²")
                    count += 1
                else:
                    break
            if count >= 5:
                break

        # Save to JSON file for inspection
        output_file = "rajaneliohinta_tilasto.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False)
        print(f"\nData saved to {output_file}")
    else:
        print("\n❌ Failed to import rajaneliöhinta tilasto")
