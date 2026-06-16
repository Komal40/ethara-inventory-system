from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import Customer
from app.schemas.customer import CustomerCreate, CustomerResponse
from app.schemas.response_wrapper import CustomResponse  # Import the generic wrapper

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.post("/", response_model=CustomResponse[CustomerResponse], status_code=status.HTTP_201_CREATED)
def create_customer(customer_in: CustomerCreate, db: Session = Depends(get_db)):
    # Business Rule Validation: Email unique check
    existing = db.query(Customer).filter(Customer.email == customer_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Customer email must be unique")
        
    db_customer = Customer(**customer_in.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    
    # Returning data inside the standardized custom envelope
    return CustomResponse(
        status_code=201, 
        data=db_customer, 
        message="Customer registration successful"
    )

@router.get("/", response_model=CustomResponse[List[CustomerResponse]])
def read_customers(db: Session = Depends(get_db)):
    customers_list = db.query(Customer).all()
    
    # Returning a list collection encapsulated inside the envelope data field
    return CustomResponse(
        data=customers_list, 
        message="Customers records retrieved successfully"
    )

@router.get("/{id}", response_model=CustomResponse[CustomerResponse])
def read_customer(id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    return CustomResponse(
        data=customer, 
        message="Customer record found"
    )

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    db.delete(customer)
    db.commit()
    
    # Note: HTTP 204 No Content strictly forbids returning a response body.
    # Therefore, no envelope wrapper is required here.
    return