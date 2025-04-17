from dataclasses import dataclass
from datetime import datetime


@dataclass
class Expense:
    date: datetime
    amount: float
    quantity: int
    marketplace: str | None
    seller: str
    product: str
    item_type: str
    series: str
