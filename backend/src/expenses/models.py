from dataclasses import dataclass
from datetime import datetime


@dataclass
class Expense:
    """
    Domain model for an expense entry.

    Attributes:
        id: Unique identifier (Firestore document ID)
        date: Purchase date
        amount: Total amount paid
        product: Product name
        item_type: Type of item (e.g., Booster, Display)
        series: Product series or edition
        quantity: Number of items purchased
        seller: Seller or store name
        marketplace: Platform or marketplace (optional)
    """
    id: str
    date: datetime
    amount: float
    product: str
    item_type: str
    series: str
    quantity: int
    seller: str
    marketplace: str | None

    @classmethod
    def from_firestore(cls, data: dict, doc_id: str) -> "Expense":
        """Create an Expense instance from Firestore document data."""
        return cls(
            id=doc_id,
            date=datetime.fromisoformat(data["date"]),
            amount=data["amount"],
            quantity=data["quantity"],
            product=data["product"],
            item_type=data["item_type"],
            series=data["series"],
            seller=data["seller"],
            marketplace=data.get("marketplace"),
        )

    def to_firestore(self) -> dict:
        """Convert Expense to Firestore-compatible dictionary."""
        return {
            "date": self.date.isoformat(),
            "amount": self.amount,
            "quantity": self.quantity,
            "product": self.product,
            "item_type": self.item_type,
            "series": self.series,
            "seller": self.seller,
            "marketplace": self.marketplace,
        }
