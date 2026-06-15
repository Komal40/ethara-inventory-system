from pydantic import BaseModel, Field
from typing import List
from app.schemas.product import ProductResponse
from app.schemas.customer import CustomerResponse

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(..., min_items=1)

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product: ProductResponse

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    customer: CustomerResponse
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True