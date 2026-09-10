from sqlalchemy import Column, Integer, JSON
from src.core.database import Base


class FinanceState(Base):
    __tablename__ = "finance_state"
    id = Column(Integer, primary_key=True)
    revision = Column(Integer, nullable=False, default=0)
    data = Column(JSON, nullable=False)
