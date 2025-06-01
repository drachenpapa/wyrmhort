from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Expense:
    id: str
    date: datetime
    amount: float
    product: str
    item_type: str
    series: str
    quantity: int
    seller: str
    marketplace: Optional[str]

    @classmethod
    def from_firestore(cls, data: dict, doc_id: str) -> "Expense":
        return cls(
            id=doc_id,
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
