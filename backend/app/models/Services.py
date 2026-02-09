from pydantic import BaseModel, Field
from typing import Optional

class ServiceModel(BaseModel):
    state: str
    city: str
    category: str
    providerName: str
    providerAddress: str
    contactNumber: str
    discountToken: Optional[str] = None
    discountRate: Optional[float] = None

class UpdateServiceModel(BaseModel):
    state: Optional[str]
    city: Optional[str]
    category: Optional[str]
    providerName: Optional[str]
    providerAddress: Optional[str]
    contactNumber: Optional[str]
    discountToken: Optional[str]
    discountRate: Optional[float]
