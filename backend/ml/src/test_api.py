# test_api.py
import tensorflow as tf
import numpy as np
from PIL import Image
import os


def load_and_preprocess_image(image_path):
    """Load and preprocess a single image"""
    img = Image.open(image_path)
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, 0)
    return img_array


def test_images():
    """Test model predictions on test images"""
    # Categories
    CATEGORIES = ["non_food", "food", "junk_food"]

    # Load model
    print("Loading model...")
    model_path = "../model/model_latest.h5"
    try:
        model = tf.keras.models.load_model(model_path)
    except Exception as e:
        print(f"Error loading model: {e}")
        return

    # Test directory
    test_dir = "../test_images"
    test_images = sorted(
        [f for f in os.listdir(test_dir) if f.endswith((".jpg", ".jpeg"))]
    )

    print("\nTesting images...")
    print("=" * 50)

    results = []
    for image_name in test_images:
        image_path = os.path.join(test_dir, image_name)
        try:
            # Process image
            img_array = load_and_preprocess_image(image_path)

            # Get predictions
            predictions = model.predict(img_array, verbose=0)[0]
            predicted_class = np.argmax(predictions)
            confidence = predictions[predicted_class]

            # Store results
            result = {
                "image": image_name,
                "predicted": CATEGORIES[predicted_class],
                "confidence": confidence,
                "probabilities": {
                    cat: float(prob) for cat, prob in zip(CATEGORIES, predictions)
                },
            }
            results.append(result)

            # Print results
            print(f"\nImage: {image_name}")
            print(f"Predicted: {result['predicted']}")
            print(f"Confidence: {confidence:.4f}")
            print("Probabilities:")
            for cat, prob in result["probabilities"].items():
                print(f"  {cat}: {prob:.4f}")
            print("-" * 50)

        except Exception as e:
            print(f"Error processing {image_name}: {e}")

    # Print summary
    print("\nSummary:")
    for category in CATEGORIES:
        count = sum(1 for r in results if r["predicted"] == category)
        print(f"{category}: {count} images")


if __name__ == "__main__":
    test_images()
