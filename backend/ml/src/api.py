import sys
import json
import tensorflow as tf
import numpy as np
from PIL import Image
import os
import traceback

# Suppress TensorFlow progress bars
tf.get_logger().setLevel("ERROR")
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

# Define categories
CATEGORIES = ["non_food", "food", "junk_food"]


def load_model():
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, "../model/model_latest.h5")

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")

        model = tf.keras.models.load_model(model_path, compile=False)
        return model
    except Exception as e:
        error_msg = f"Failed to load model: {str(e)}"
        print(json.dumps({"error": error_msg}))
        sys.exit(1)


def preprocess_image(image_path):
    try:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found at {image_path}")

        image = Image.open(image_path)
        image = image.convert("RGB")
        image = image.resize((224, 224))
        image = np.array(image)
        image = image / 255.0
        image = np.expand_dims(image, axis=0)
        return image
    except Exception as e:
        error_msg = f"Failed to process image: {str(e)}"
        print(json.dumps({"error": error_msg}))
        sys.exit(1)


def main():
    try:
        if len(sys.argv) != 2:
            raise ValueError("Image path not provided")

        image_path = sys.argv[1]
        model = load_model()
        processed_image = preprocess_image(image_path)

        # Disable progress bar for prediction
        predictions = model.predict(processed_image, verbose=0)[0]
        predicted_class = np.argmax(predictions)
        confidence = float(predictions[predicted_class])

        result = {
            "category": CATEGORIES[predicted_class],
            "confidence": confidence,
            "all_probabilities": {
                cat: float(prob) for cat, prob in zip(CATEGORIES, predictions)
            },
        }

        print(json.dumps(result))

    except Exception as e:
        error_msg = f"Main execution failed: {str(e)}"
        print(json.dumps({"error": error_msg}))
        sys.exit(1)


if __name__ == "__main__":
    main()
