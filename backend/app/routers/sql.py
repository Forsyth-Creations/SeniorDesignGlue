# Write a router for fastapi that lets you interact with a SQL database

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database_hooks.my_sql_db import get_db
from pydantic import BaseModel
from typing import Optional
import time
from colorama import Fore
from app.common import verify_token
from sql_metadata import Parser

router = APIRouter()


class Query(BaseModel):
    query: str
    remember: Optional[bool] = False


@router.post("/sql", dependencies=[Depends(verify_token)])
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
@router.delete("/sql/{query}", dependencies=[Depends(verify_token)])
async def delete_query(query: str, db: Session = Depends(get_db)):
    try:
        print(f"{Fore.RED}Deleting query: {query}")
        # See if the query exists
        query_exists = db.execute(
            text("SELECT query FROM common_queries WHERE query = :query"),
            {"query": query},
        ).fetchone()
        if not query_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Query not found"
            )
        db.execute(
            text("DELETE FROM common_queries WHERE query = :query"), {"query": query}
        )
        db.commit()
        return {"message": "Query deleted"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


allowed_public_tables = ["projects", "teams"]
forbidden_columns = ["password", "student_number", "nine_oh"]


# Create a new SQL endpoint that is accessible without a token
@router.post("/sql/public")
async def sql_public(query: Query, db: Session = Depends(get_db)):
    try:
        # Check the query for public tables
        queryText = query.query
        print(f"{Fore.CYAN}Query: {queryText}{Fore.RESET}")
        parsed_query = Parser(queryText)
        tables = parsed_query.tables

        # Check if the query uses any tables that are not public
        for table in tables:
            if table not in allowed_public_tables:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Table {table} is not public",
                )

        # Check if the query uses any forbidden columns
        if any(column in queryText for column in forbidden_columns):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Query uses forbidden columns. You may not access {forbidden_columns}",
            )

        results = db.execute(text(queryText)).fetchall()

        if not results:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No results found",
            )

        result_list = [dict(row._mapping) for row in results]

        return {"results": result_list}

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
