"""FedEx REST API client (US)."""

from __future__ import annotations

import time
from typing import Any

import requests

from config import (
    FEDEX_ACCOUNT_NUMBER,
    FEDEX_CLIENT_ID,
    FEDEX_CLIENT_SECRET,
    FEDEX_SANDBOX,
)
from services.shipping.us_address import USAddress, USContact, resolve_postal_code

SANDBOX_URL = "https://apis-sandbox.fedex.com"
PRODUCTION_URL = "https://apis.fedex.com"

DEFAULT_LABEL_SPEC = {
    "imageType": "PDF",
    "labelStockType": "PAPER_4X6",
}


class FedExAPI:
    def __init__(
        self,
        client_id: str,
        client_secret: str,
        account_number: str,
        sandbox: bool = True,
    ):
        self.client_id = client_id
        self.client_secret = client_secret
        self.account_number = account_number
        self.base_url = SANDBOX_URL if sandbox else PRODUCTION_URL
        self.access_token: str | None = None
        self.token_expiry = 0.0

    def authenticate(self) -> str:
        if self.access_token and time.time() < self.token_expiry:
            return self.access_token

        response = requests.post(
            f"{self.base_url}/oauth/token",
            data={
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        self.access_token = data["access_token"]
        self.token_expiry = time.time() + data.get("expires_in", 3600) - 60
        return self.access_token

    def get_headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.authenticate()}",
            "Content-Type": "application/json",
        }

    def post(
        self,
        endpoint: str,
        payload: dict[str, Any],
        *,
        extra_headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        headers = self.get_headers()
        if extra_headers:
            headers.update(extra_headers)
        response = requests.post(
            f"{self.base_url}{endpoint}",
            headers=headers,
            json=payload,
            timeout=60,
        )
        response.raise_for_status()
        return response.json()

    def put(self, endpoint: str, payload: dict[str, Any]) -> dict[str, Any]:
        response = requests.put(
            f"{self.base_url}{endpoint}",
            headers=self.get_headers(),
            json=payload,
            timeout=60,
        )
        response.raise_for_status()
        return response.json()

    @staticmethod
    def _account_number(value: str | None = None) -> dict[str, str]:
        return {"value": value or ""}

    @staticmethod
    def _package_line_items(weight_lb: float) -> list[dict[str, Any]]:
        return [{"weight": {"units": "LB", "value": weight_lb}}]

    def _shipment_core(
        self,
        shipper: USContact,
        recipient: USContact,
        weight_lb: float,
        *,
        service_type: str = "FEDEX_GROUND",
        packaging_type: str = "YOUR_PACKAGING",
        pickup_type: str = "DROPOFF_AT_FEDEX_LOCATION",
        payment_type: str = "SENDER",
        include_label_spec: bool = False,
    ) -> dict[str, Any]:
        shipment: dict[str, Any] = {
            "pickupType": pickup_type,
            "shipper": shipper.to_fedex_party(),
            "recipients": [recipient.to_fedex_party()],
            "requestedPackageLineItems": self._package_line_items(weight_lb),
        }
        if service_type:
            shipment["serviceType"] = service_type
        if packaging_type:
            shipment["packagingType"] = packaging_type
        if include_label_spec:
            shipment["shippingChargesPayment"] = {"paymentType": payment_type}
            shipment["labelSpecification"] = DEFAULT_LABEL_SPEC
        return shipment

    def lookup_postal_code(self, city: str, state: str, street: str = "") -> dict[str, str]:
        zip_code = resolve_postal_code(city=city, state=state, street=street)
        return {
            "city": city.strip(),
            "state": state.strip().upper(),
            "postalCode": zip_code,
            "countryCode": "US",
        }

    @staticmethod
    def build_track_payload(
        tracking_number: str,
        *,
        include_detailed_scans: bool = True,
    ) -> dict[str, Any]:
        return {
            "includeDetailedScans": include_detailed_scans,
            "trackingInfo": [
                {"trackingNumberInfo": {"trackingNumber": str(tracking_number)}}
            ],
        }

    @staticmethod
    def parse_track_summary(result: dict[str, Any]) -> dict[str, Any]:
        complete = result.get("output", {}).get("completeTrackResults", [])
        if not complete:
            return {"error": "No completeTrackResults in response"}

        entry = complete[0]
        tracking_number = entry.get("trackingNumber", "—")
        track_results = entry.get("trackResults", [])
        if not track_results:
            return {"trackingNumber": tracking_number, "error": "No trackResults"}

        track = track_results[0]
        if track.get("error"):
            return {
                "trackingNumber": tracking_number,
                "error": track["error"].get("message", track["error"]),
                "errorCode": track["error"].get("code"),
            }

        status = track.get("latestStatusDetail", {})
        scans = track.get("scanEvents", [])
        service = track.get("serviceDetail", {})
        shipper = track.get("shipperInformation", {}).get("address", {})
        recipient = track.get("recipientInformation", {}).get("address", {})

        return {
            "trackingNumber": tracking_number,
            "carrierCode": track.get("trackingNumberInfo", {}).get("carrierCode"),
            "status": status.get("description"),
            "statusCode": status.get("code"),
            "service": service.get("description") or service.get("type"),
            "shipper": (
                f"{shipper.get('city', '')}, {shipper.get('stateOrProvinceCode', '')}"
            ).strip(", "),
            "recipient": (
                f"{recipient.get('city', '')}, {recipient.get('stateOrProvinceCode', '')}"
            ).strip(", "),
            "scanEventCount": len(scans),
            "latestScan": scans[0] if scans else None,
            "transactionId": result.get("transactionId"),
        }

    @staticmethod
    def parse_shipment_tracking(result: dict[str, Any]) -> str:
        shipment = result.get("output", {}).get("transactionShipments", [{}])[0]
        tracking = shipment.get("masterTrackingNumber")
        if not tracking:
            raise ValueError("No masterTrackingNumber in FedEx shipment response")
        return str(tracking)

    def track_shipment(
        self,
        tracking_number: str,
        *,
        include_detailed_scans: bool = True,
    ) -> dict[str, Any]:
        return self.post(
            "/track/v1/trackingnumbers",
            self.build_track_payload(
                tracking_number,
                include_detailed_scans=include_detailed_scans,
            ),
            extra_headers={"X-locale": "en_US"},
        )

    def get_rates(
        self,
        shipper: USAddress | USContact,
        recipient: USAddress | USContact,
        weight_lb: float,
    ) -> dict[str, Any]:
        shipper_addr = shipper.address if isinstance(shipper, USContact) else shipper
        recipient_addr = recipient.address if isinstance(recipient, USContact) else recipient
        shipper_zip = shipper_addr.ensure_postal_code().postal_code
        recipient_zip = recipient_addr.ensure_postal_code().postal_code

        return self.post(
            "/rate/v1/rates/quotes",
            {
                "accountNumber": self._account_number(self.account_number),
                "requestedShipment": {
                    "pickupType": "DROPOFF_AT_FEDEX_LOCATION",
                    "rateRequestType": ["ACCOUNT", "LIST"],
                    "shipper": {"address": {"postalCode": shipper_zip, "countryCode": "US"}},
                    "recipient": {
                        "address": {"postalCode": recipient_zip, "countryCode": "US"}
                    },
                    "requestedPackageLineItems": self._package_line_items(weight_lb),
                },
            },
        )

    def create_shipment(
        self,
        shipper: USContact,
        recipient: USContact,
        weight_lb: float,
        *,
        service_type: str = "FEDEX_GROUND",
    ) -> dict[str, Any]:
        return self.post(
            "/ship/v1/shipments",
            {
                "labelResponseOptions": "LABEL",
                "accountNumber": self._account_number(self.account_number),
                "requestedShipment": self._shipment_core(
                    shipper,
                    recipient,
                    weight_lb,
                    service_type=service_type,
                    include_label_spec=True,
                ),
            },
        )

    def cancel_shipment(self, tracking_number: str) -> dict[str, Any]:
        return self.put(
            "/ship/v1/shipments/cancel",
            {
                "accountNumber": self._account_number(self.account_number),
                "trackingNumber": str(tracking_number),
            },
        )


def create_fedex_client() -> FedExAPI:
    if not FEDEX_CLIENT_ID or not FEDEX_CLIENT_SECRET or not FEDEX_ACCOUNT_NUMBER:
        raise RuntimeError("FedEx credentials are not configured in commerce-service .env")
    return FedExAPI(
        client_id=FEDEX_CLIENT_ID,
        client_secret=FEDEX_CLIENT_SECRET,
        account_number=FEDEX_ACCOUNT_NUMBER,
        sandbox=FEDEX_SANDBOX,
    )
