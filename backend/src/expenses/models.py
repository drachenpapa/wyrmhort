from dataclasses import dataclass
from datetime import datetime


@dataclass
class Expense:
    date: datetime
    amount: float
    product: str
    item_type: str
    series: str | None
    quantity: int
    seller: str
    marketplace: str | None

    @classmethod
    def from_firestore(cls, data: dict) -> "Expense":
        return cls(
            date=datetime.fromisoformat(data["date"]),
            amount=data["amount"],
            quantity=data["quantity"],
            product=data["product"],
            item_type=data["item_type"],
            series=data["series"],
            seller=data["seller"],
            marketplace=data.get("marketplace")
        )

    def to_firestore(self) -> dict:
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
