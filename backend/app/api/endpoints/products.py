from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.response_wrapper import CustomResponse  # Import wrapper

router = APIRouter(prefix="/products", tags=["Products"])

@router.post("/", response_model=CustomResponse[ProductResponse], status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(Product).filter(Product.sku == product_in.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product SKU code must be unique")
    
    db_product = Product(**product_in.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # Return wrapped structure
    return CustomResponse(status_code=201, data=db_product, message="Product created successfully")

@router.get("/", response_model=CustomResponse[List[ProductResponse]])
def read_products(db: Session = Depends(get_db)):
    products_list = db.query(Product).all()
    return CustomResponse(data=products_list, message="Products fetched successfully")

@router.get("/{id}", response_model=CustomResponse[ProductResponse])
def read_product(id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return CustomResponse(data=product)

@router.put("/{id}", response_model=CustomResponse[ProductResponse])
def update_product(id: int, product_in: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    sku_check = db.query(Product).filter(Product.sku == product_in.sku, Product.id != id).first()
    if sku_check:
        raise HTTPException(status_code=400, detail="SKU code already exists on another product")
    
    for key, value in product_in.model_dump().items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return CustomResponse(data=product, message="Product updated successfully")