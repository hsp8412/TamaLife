#!/bin/bash

# Install Node.js dependencies
npm install

# Setup backend
cd backend
npm install

# Setup ML environment
cd ml
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ../..

echo "Setup complete!"
