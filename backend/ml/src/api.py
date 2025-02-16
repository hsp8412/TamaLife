import sys
import json
import tensorflow as tf
import numpy as np
from PIL import Image

# Define categories
CATEGORIES = ["non_food", "food", "junk_food"]


def load_model():
    # Load the model from the relative path
    model_path = "../model/model_latest.h5"
    try:
        return tf.keras.models.load_model(model_path)
    except Exception as e:
        print(json.dumps({"error": f"Failed to load model: {str(e)}"}))
        sys.exit(1)


def preprocess_image(image_path):
    try:
        # Open and preprocess the image
        image = Image.open(image_path)
        image = image.resize((224, 224))
        image = np.array(image) / 255.0
        image = np.expand_dims(image, axis=0)
        return image
    except Exception as e:
        print(json.dumps({"error": f"Failed to process image: {str(e)}"}))
        sys.exit(1)


def main():
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Image path not provided"}))
        sys.exit(1)

    image_path = sys.argv[1]

    # Load model
    model = load_model()

    # Process image
    processed_image = preprocess_image(image_path)

    try:
        # Make prediction
        predictions = model.predict(processed_image)[0]
        predicted_class = np.argmax(predictions)
        confidence = float(predictions[predicted_class])

        # Prepare response
        result = {
            "category": CATEGORIES[predicted_class],
            "confidence": confidence,
            "all_probabilities": {
                cat: float(prob) for cat, prob in zip(CATEGORIES, predictions)
            },
        }

        # Print result as JSON string
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": f"Prediction failed: {str(e)}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
