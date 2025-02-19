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

### Datasets 📊

The project utilizes two major datasets for training the food classification model:

#### Food-101
- 101 food categories
- 1000 images per class
- Used for training food/junk food classification
- High-quality, real-world food images
- Source: [Food-101](https://data.vision.ee.ethz.ch/cvl/datasets_extra/food-101/)

#### Food-5K
- Binary classification dataset (food/non-food)
- 2500 food images
- 2500 non-food images
- Training, validation, and evaluation splits
- Source: [Food-5K](https://mmspg.epfl.ch/downloads/food-image-datasets/)

The datasets were combined and reorganized into three categories:
- Non-food (from Food-5K)
- Healthy food (selected from Food-101)
- Junk food (selected from Food-101)

Data split:
- Training: 70%
- Validation: 15%
- Testing: 15%


## Hardware Setup 🔧
Ensure proper serial port configuration in backend settings

## Future Improvements 🔮

Multiplayer pet interaction
More sophisticated pet behavior patterns
Extended food classification categories
Enhanced hardware display capabilities
Voice command integration
