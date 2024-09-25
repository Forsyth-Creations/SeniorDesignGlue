# Write a router for fastapi that lets you interact with a SQL database

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database_hooks.my_sql_db import get_db
from pydantic import BaseModel  

router = APIRouter()

class Query(BaseModel):
    query: str

@router.post("/sql")
async def sql(query: Query, db: Session = Depends(get_db)):
    try:
        # Use SQLAlchemy to execute the query
        result = db.execute(text(query.query)).fetchall()
        
        # Check if the result is empty
        if not result:
            return {"results": []}  # Return an empty list if no results

        # Convert result to a list of dictionaries for JSON serialization
        result_list = [dict(row._mapping) for row in result]  # Use _mapping for Row objects
        
        return {"results": result_list}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
