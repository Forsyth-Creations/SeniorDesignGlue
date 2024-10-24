# Write a router for fastapi that lets you interact with a SQL database

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database_hooks.my_sql_db import get_db
from pydantic import BaseModel
from typing import Optional
import time


router = APIRouter()


class Query(BaseModel):
    query: str
    remember: Optional[bool] = False


@router.post("/sql")
async def sql(query: Query, db: Session = Depends(get_db)):
    try:
        # Use SQLAlchemy to execute the query
        result = db.execute(text(query.query)).fetchall()

        # If remember is set to True, save the query to the database under "common_queries" table
        if query.remember:
            # Ensure the table exists, if not create it
            db.execute(
                text(
                    "CREATE TABLE IF NOT EXISTS common_queries (query TEXT, execution_time TEXT)"
                )
            )

            # Check to make sure this query is not already in the database
            query_exists = db.execute(
                text("SELECT query FROM common_queries WHERE query = :query"),
                {"query": query.query},
            ).fetchone()
            if not query_exists:
                execution_time = str(time.time())
                db.execute(
                    text(
                        "INSERT INTO common_queries (query, execution_time) VALUES (:query, :execution_time)"
                    ),
                    {"query": query.query, "execution_time": execution_time},
                )
                db.commit()

        # Check if the result is empty
        if not result:
            return {"results": []}  # Return an empty list if no results

        # Convert result to a list of dictionaries for JSON serialization
        result_list = [
            dict(row._mapping) for row in result
        ]  # Use _mapping for Row objects

        return {"results": result_list}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# Delete a query from the common_queries table
@router.delete("/sql/{query}")
async def delete_query(query: str, db: Session = Depends(get_db)):
    try:
        db.execute(
            text("DELETE FROM common_queries WHERE query = :query"), {"query": query}
        )
        db.commit()
        return {"message": "Query deleted"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
