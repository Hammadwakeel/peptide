"""US address helpers — resolve ZIP from city/state when postal code is omitted."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import requests

COUNTRY_US = "US"
ZIP_LOOKUP_URL = "https://api.zippopotam.us/us/{state}/{city}"
CENSUS_GEOCODER_URL = (
    "https://geocoding.geo.census.gov/geocoder/locations/address"
)


@dataclass
class USAddress:
    city: str
    state: str
    street: str = ""
    postal_code: str = ""
    country: str = COUNTRY_US

    def with_postal_code(self, postal_code: str) -> USAddress:
        return USAddress(
            city=self.city,
            state=self.state,
            street=self.street,
            postal_code=postal_code,
            country=self.country,
        )

    def ensure_postal_code(self) -> USAddress:
        if self.postal_code:
            return self
        zip_code = resolve_postal_code(
            city=self.city,
            state=self.state,
            street=self.street,
        )
        return self.with_postal_code(zip_code)

    def to_fedex_address(self) -> dict[str, Any]:
        resolved = self.ensure_postal_code()
        address: dict[str, Any] = {
            "city": resolved.city,
            "stateOrProvinceCode": resolved.state.upper(),
            "postalCode": resolved.postal_code,
            "countryCode": resolved.country,
        }
        if resolved.street:
            address["streetLines"] = [resolved.street]
        return address


@dataclass
class USContact:
    name: str
    phone: str
    address: USAddress

    def to_fedex_party(self) -> dict[str, Any]:
        return {
            "contact": {
                "personName": self.name,
                "phoneNumber": self.phone,
            },
            "address": self.address.to_fedex_address(),
        }


def resolve_postal_code(city: str, state: str, street: str = "") -> str:
    city = city.strip()
    state = state.strip().upper()

    if street:
        zip_from_street = _zip_from_census(street, city, state)
        if zip_from_street:
            return zip_from_street

    zip_from_city = _zip_from_zippopotam(city, state)
    if zip_from_city:
        return zip_from_city

    raise ValueError(
        f"Could not resolve ZIP for {city}, {state}"
        + (f" ({street})" if street else "")
    )


def _zip_from_census(street: str, city: str, state: str) -> str:
    try:
        response = requests.get(
            CENSUS_GEOCODER_URL,
            params={
                "street": street,
                "city": city,
                "state": state,
                "benchmark": "Public_AR_Current",
                "format": "json",
            },
            timeout=15,
        )
        response.raise_for_status()
        matches = response.json().get("result", {}).get("addressMatches", [])
        if matches:
            return matches[0]["addressComponents"]["zip"]
    except requests.RequestException:
        pass
    return ""


def _zip_from_zippopotam(city: str, state: str) -> str:
    try:
        response = requests.get(
            ZIP_LOOKUP_URL.format(
                state=state,
                city=requests.utils.quote(city),
            ),
            timeout=15,
        )
        response.raise_for_status()
        places = response.json().get("places", [])
        if places:
            return places[0]["post code"]
    except requests.RequestException:
        pass
    return ""
