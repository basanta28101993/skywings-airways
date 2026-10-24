from langchain_core.tools import tool

# Mock Database for demo purposes (In production, query PostgreSQL)
MOCK_BOOKINGS = {
    "PNR123": {"status": "CONFIRMED", "route": "DEL-BOM", "date": "2026-11-20"},
    "PNR456": {"status": "CONFIRMED", "route": "BOM-DEL", "date": "2026-11-25"}
}

@tool
def get_booking_details(pnr: str) -> str:
    """Use this to get the details of a booking using the PNR number."""
    pnr = pnr.upper()
    if pnr in MOCK_BOOKINGS:
        details = MOCK_BOOKINGS[pnr]
        return f"Booking {pnr} found: Route {details['route']}, Date {details['date']}, Status {details['status']}."
    return f"Error: Booking with PNR {pnr} not found."

@tool
def cancel_booking(pnr: str) -> str:
    """Use this to cancel a booking. Requires the PNR number."""
    pnr = pnr.upper()
    if pnr in MOCK_BOOKINGS:
        if MOCK_BOOKINGS[pnr]["status"] == "CANCELLED":
            return f"Booking {pnr} is already cancelled."
        MOCK_BOOKINGS[pnr]["status"] = "CANCELLED"
        return f"Success: Booking {pnr} has been successfully cancelled. Refund will be processed in 5-7 days."
    return f"Error: Cannot cancel. Booking {pnr} not found."
