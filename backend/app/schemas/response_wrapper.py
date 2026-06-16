from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

# Define a TypeVar that can accept any Pydantic model or list of models
T = TypeVar('T')

class CustomResponse(BaseModel, Generic[T]):
    status_code: int = 200
    status: bool = True
    message: str = "Success"
    data: Optional[T] = None

    class Config:
        from_attributes = True