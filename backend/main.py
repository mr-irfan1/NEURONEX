from fastapi import FastAPI, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
import uvicorn

# Initialize FastAPI app
app = FastAPI(title="NeuroNex API", version="1.0.0")

# --- Pydantic Models ---
class SubscriptionRequest(BaseModel):
    email: EmailStr

class SubscriptionResponse(BaseModel):
    message: str
    email: str

# --- Database Simulation ---
# In a real production environment, use SQLAlchemy or asyncpg with PostgreSQL.
# Example: database = await asyncpg.connect(user='user', password='password', database='neuronex', host='127.0.0.1')
fake_subscriber_db = {"test@example.com", "alex.carter@example.com"}

# --- Route Handlers ---

@app.post(
    "/api/newsletter/subscribe", 
    response_model=SubscriptionResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Newsletter"]
)
async def subscribe_newsletter(subscription: SubscriptionRequest):
    """
    Subscribes a user to the newsletter.
    - Validates email format using Pydantic.
    - Normalizes email (lowercase, strip whitespace).
    - Checks for duplicates in the database.
    - Returns 400 if already exists.
    """
    # Normalize the email input
    email_entry = subscription.email.lower().strip()
    
    # Check if email already exists in the database
    if email_entry in fake_subscriber_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already subscribed."
        )
    
    # Save to database (Simulated)
    # await database.execute("INSERT INTO subscribers (email) VALUES ($1)", email_entry)
    fake_subscriber_db.add(email_entry)
    
    return {
        "message": "Successfully subscribed to NeuroNex updates!", 
        "email": email_entry
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)