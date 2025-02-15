import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables

class Config:
    MONGO_URI = os.getenv("MONGO_URI")
