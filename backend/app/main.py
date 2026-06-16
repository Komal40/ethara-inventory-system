from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.models import Product, Customer, Order, OrderItem
from app.api.endpoints import products, customers, orders, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)
@app.get("/")
def root():
    return {"status": "healthy", "message": "Inventory API Core Running"}