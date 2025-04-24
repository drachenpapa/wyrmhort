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
