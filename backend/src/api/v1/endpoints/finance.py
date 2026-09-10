"""Validated personal finance settings with optimistic concurrency protection."""
from typing import Annotated
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, ConfigDict, model_validator
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from src.core.database import get_db
from src.models.finance import FinanceState

Money = Annotated[float, Field(ge=0, allow_inf_nan=False)]
PositiveMoney = Annotated[float, Field(gt=0, allow_inf_nan=False)]
Name = Annotated[str, Field(min_length=1, max_length=200)]

class Validated(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

class Pot(Validated):
    id: str | int
    name: Name
    targetAmount: PositiveMoney
    currentSaved: Money = 0
    monthlyPledge: Money = 0

    @model_validator(mode="after")
    def check_balance(self):
        if self.currentSaved > self.targetAmount:
            raise ValueError("Saved amount cannot exceed the target")
        return self

class Goal(Validated):
    id: str | int
    name: Name
    cost: PositiveMoney

class RentConfig(Validated):
    baseRent: Money = 0
    electricityRate: Money = 0
    waterWasteFee: Money = 0

class RentPayment(Validated):
    id: str | int
    month: Name
    baseRent: Money
    prevReading: Money
    currReading: Money
    units: Money
    electricityBill: Money
    waterWasteFee: Money
    totalAmount: Money
    paidDate: date

    @model_validator(mode="after")
    def check_totals(self):
        if self.currReading < self.prevReading:
            raise ValueError("Current reading cannot be below previous reading")
        if abs(self.units - (self.currReading - self.prevReading)) > 0.01:
            raise ValueError("Meter units do not match readings")
        if abs(self.totalAmount - self.baseRent - self.electricityBill - self.waterWasteFee) > 0.01:
            raise ValueError("Rent total does not match bill components")
        return self

class FinanceData(Validated):
    monthlySalary: Money = 0
    allocationPercent: Annotated[float, Field(ge=0, le=100, allow_inf_nan=False)] = 25
    wishlistPots: list[Pot] = Field(default_factory=list, max_length=1000)
    longTermGoals: list[Goal] = Field(default_factory=list, max_length=1000)
    rentConfig: RentConfig = Field(default_factory=RentConfig)
    rentHistory: list[RentPayment] = Field(default_factory=list, max_length=10000)

    @model_validator(mode="after")
    def unique_records(self):
        for records in [self.wishlistPots, self.longTermGoals, self.rentHistory]:
            if len({str(r.id) for r in records}) != len(records):
                raise ValueError("Record IDs must be unique")
        if len({r.month for r in self.rentHistory}) != len(self.rentHistory):
            raise ValueError("A payment for this month already exists")
        return self

class StateUpdate(Validated):
    revision: int = Field(ge=0)
    data: FinanceData

router = APIRouter(prefix="/finance", tags=["finance"])

@router.get("/", response_model=StateUpdate)
def read_state(db: Session = Depends(get_db)):
    state = db.get(FinanceState, 1)
    return {"revision": state.revision, "data": state.data} if state else {"revision": 0, "data": FinanceData()}

@router.put("/", response_model=StateUpdate)
def save_state(payload: StateUpdate, db: Session = Depends(get_db)):
    data = payload.data.model_dump(mode="json")
    state = db.get(FinanceState, 1)
    if state is None:
        if payload.revision != 0:
            raise HTTPException(409, "Settings changed. Reload and try again.")
        db.add(FinanceState(id=1, revision=1, data=data))
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(409, "Settings changed. Reload and try again.")
    else:
        count = db.query(FinanceState).filter_by(id=1, revision=payload.revision).update(
            {"data": data, "revision": payload.revision + 1}, synchronize_session=False)
        if not count:
            db.rollback()
            raise HTTPException(409, "Settings changed in another tab. Reload before saving.")
        db.commit()
    return {"revision": payload.revision + 1, "data": data}
