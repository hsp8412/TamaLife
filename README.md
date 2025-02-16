# TamaLife 🐱

TamaLife is a modern take on the classic Tamagotchi virtual pet, combining mobile app technology, machine learning, and IoT hardware to create an interactive pet care experience. Built during CalgaryHacks 2025.

## Features 🌟

- **Virtual Pet Care**: Feed and interact with your virtual pet through a mobile app
- **ML-Powered Food Detection**: Take photos of food to feed your pet, with real-time classification of food types
- **Hardware Integration**: Physical LCD display and LED indicators showing your pet's mood and health
- **Natural Language Interaction**: Talk to your pet using advanced language processing
- **Health & Mood System**: Dynamic pet state that responds to your interactions and care

## Technology Stack 💻

### Mobile App (Frontend)
- React Native with Expo
- TypeScript
- TensorFlow.js for ML model integration
- Custom animations and UI components

### Backend
- Node.js with Express
- MongoDB for data persistence
- JWT authentication
- WebSocket for real-time updates

### Machine Learning
- TensorFlow/Keras for food classification
- Custom trained model on food/non-food dataset
- Model conversion to TFLite for mobile deployment

### Hardware
- Arduino microcontroller
- LCD display
- RGB LED indicators
- Serial communication with backend

## Getting Started 🚀

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tamalife.git
```
2. Install dependencies:
```bash
# Root directory
npm install

# Backend setup
cd backend
npm install

# ML environment setup
cd ml
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

3. Set up environment variables:
```
# Create .env files in both root and backend directories
cp .env.example .env
```

4. Start the development servers:
```
# Backend
cd backend
npm run dev

# Mobile app
npm start
```

## Hardware Setup 🔧
Ensure proper serial port configuration in backend settings

## Future Improvements 🔮

Multiplayer pet interaction
More sophisticated pet behavior patterns
Extended food classification categories
Enhanced hardware display capabilities
Voice command integration
