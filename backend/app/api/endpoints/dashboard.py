from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Product, Customer, Order
from app.schemas.response_wrapper import CustomResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/", response_model=CustomResponse[dict])
def get_dashboard_summary(db: Session = Depends(get_db)):
    metrics = {
        "total_products": db.query(Product).count(),
        "total_customers": db.query(Customer).count(),
        "total_orders": db.query(Order).count(),
        "low_stock_products": db.query(Product).filter(Product.quantity < 5).count()
    }
    
    return CustomResponse(
        data=metrics, 
        message="Dashboard analytics metrics loaded successfully"
    )