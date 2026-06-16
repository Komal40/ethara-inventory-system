from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import Order, OrderItem, Product, Customer
from app.schemas.order import OrderCreate, OrderResponse
from app.schemas.response_wrapper import CustomResponse

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=CustomResponse[OrderResponse], status_code=status.HTTP_201_CREATED)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == order_in.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    db_order = Order(customer_id=order_in.customer_id, total_amount=0.0)
    db.add(db_order)
    db.flush()

    running_total = 0.0

    for item in order_in.items:
        product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
        if not product:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")

        if product.quantity < item.quantity:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient inventory for '{product.name}'."
            )

        product.quantity -= item.quantity
        item_total = product.price * item.quantity
        running_total += item_total

        db_item = OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=product.price
        )
        db.add(db_item)

    db_order.total_amount = running_total
    db.commit()
    db.refresh(db_order)
    
    return CustomResponse(status_code=201, data=db_order, message="Order completed successfully")

@router.get("/", response_model=CustomResponse[List[OrderResponse]])
def read_orders(db: Session = Depends(get_db)):
    orders_list = db.query(Order).order_by(Order.id.desc()).all()
    return CustomResponse(data=orders_list)