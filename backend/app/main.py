from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem

print("Initializing Database Schemas...")
Base.metadata.create_all(bind=engine)
print("Database Tables Synced Successfully!")

app = FastAPI(title="Inventory System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "healthy", "message": "Inventory API Core Running"}