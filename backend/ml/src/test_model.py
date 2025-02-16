# test_model.py
import tensorflow as tf
import numpy as np
from PIL import Image
import os
import random


def load_and_preprocess_image(image_path):
    # Load image
    img = Image.open(image_path)
    # Resize to match model's expected input
    img = img.resize((224, 224))
    # Convert to array and normalize
    img_array = np.array(img) / 255.0
    # Add batch dimension
    img_array = np.expand_dims(img_array, 0)
    return img_array


def test_model():
    # Load the trained model
    print("Loading model...")
    model = tf.keras.models.load_model("../model_final.h5")

    # Print model summary
    print("\nModel Summary:")
    model.summary()

    # Paths for evaluation set
    eval_dir = "../data/hybrid_dataset/evaluation"
    healthy_food_dir = os.path.join(eval_dir, "healthy_food")
    non_food_dir = os.path.join(eval_dir, "non_food")
    unhealthy_food_dir = os.path.join(eval_dir, "unhealthy_food")

    # Get 5 random images from each category
    healthy_food_images = random.sample(
        [f for f in os.listdir(healthy_food_dir) if f.endswith(".jpg")], 5
    )
    non_food_images = random.sample(
        [f for f in os.listdir(non_food_dir) if f.endswith(".jpg")], 5
    )
    unhealthy_food_images = random.sample(
        [f for f in os.listdir(unhealthy_food_dir) if f.endswith(".jpg")], 5
    )

    categories = ["Non-Food", "Healthy Food", "Unhealthy Food"]

    def test_category(images, directory, category_name):
        print(f"\nTesting {category_name} Images:")
        print("=" * 50)
        for img_name in images:
            img_path = os.path.join(directory, img_name)
            img_array = load_and_preprocess_image(img_path)
            predictions = model.predict(img_array, verbose=0)[0]

            predicted_class = np.argmax(predictions)
            confidence = predictions[predicted_class]

            print(f"\nImage: {img_name}")
            print(f"Prediction: {categories[predicted_class]}")
            print(f"Confidence: {confidence:.4f}")
            print("All probabilities:")
            for cat, prob in zip(categories, predictions):
                print(f"  {cat}: {prob:.4f}")
            print("-" * 50)

    # Test all categories
    test_category(healthy_food_images, healthy_food_dir, "Healthy Food")
    test_category(non_food_images, non_food_dir, "Non-Food")
    test_category(unhealthy_food_images, unhealthy_food_dir, "Unhealthy Food")


if __name__ == "__main__":
    print("Testing model on all three categories...")
    test_model()
