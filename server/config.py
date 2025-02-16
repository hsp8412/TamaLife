import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables

class Config:
    MONGO_URI = os.getenv("MONGO_URI")
    SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your_secret_key")  
