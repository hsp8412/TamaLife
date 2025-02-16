# organize_dataset.py
import os
import shutil
from pathlib import Path

# Define healthy and unhealthy categories from Food-101 Data Set
HEALTHY_FOODS = [
    "beef_carpaccio",
    "beef_tartare",
    "beet_salad",
    "bibimbap",
    "caesar_salad",
    "caprese_salad",
    "ceviche",
    "chicken_curry",
    "edamame",
    "eggs_benedict",
    "falafel",
    "fried_rice",
    "gnocchi",
    "greek_salad",
    "grilled_salmon",
    "gyoza",
    "huevos_rancheros",
    "lasagna",
    "miso_soup",
    "mussels",
    "omelette",
    "pad_thai",
    "paella",
    "pancakes",
    "pho",
    "ramen",
    "risotto",
    "sashimi",
    "scallops",
    "seaweed_salad",
    "shrimp_and_grits",
    "spring_rolls",
    "steak",
    "sushi",
    "tuna_tartare",
    "waffles",
]

UNHEALTHY_FOODS = [
    "apple_pie",
    "baby_back_ribs",
    "baklava",
    "beignets",
    "bread_pudding",
    "breakfast_burrito",
    "cannoli",
    "carrot_cake",
    "cheesecake",
    "chicken_wings",
    "chocolate_cake",
    "chocolate_mousse",
    "churros",
    "croque_madame",
    "cup_cakes",
    "donuts",
    "french_fries",
    "fried_calamari",
    "hamburger",
    "hot_dog",
    "ice_cream",
    "macaroni_and_cheese",
    "macarons",
    "nachos",
    "onion_rings",
    "pizza",
    "poutine",
    "red_velvet_cake",
]


def create_hybrid_dataset():
    # Define paths and output to our hybrid_dataset (combination of the two)
    food101_path = "../data/food-101/images"
    food5k_path = "../data/Food-5k"
    output_path = "../data/hybrid_dataset"

    # Create directory structure
    for split in ["training", "validation", "evaluation"]:
        os.makedirs(os.path.join(output_path, split, "healthy_food"), exist_ok=True)
        os.makedirs(os.path.join(output_path, split, "non_food"), exist_ok=True)
        os.makedirs(os.path.join(output_path, split, "unhealthy_food"), exist_ok=True)

    # Copy non-food images from Food-5K
    for split in ["training", "validation", "evaluation"]:
        src_dir = os.path.join(food5k_path, split, "non_food")
        dst_dir = os.path.join(output_path, split, "non_food")

        print(f"Copying non-food images from {split} set...")
        for img in os.listdir(src_dir):
            if img.endswith(".jpg"):
                shutil.copy2(os.path.join(src_dir, img), os.path.join(dst_dir, img))

    # Copy and categorize food images from Food-101
    total_images_per_category = 1000  # Adjust this number as needed

    print("\nCopying healthy food images from Food-101...")
    for category in HEALTHY_FOODS:
        category_path = os.path.join(food101_path, category)
        if not os.path.exists(category_path):
            print(f"Warning: Category {category} not found")
            continue

        images = [f for f in os.listdir(category_path) if f.endswith(".jpg")]
        images = images[:total_images_per_category]

        # Calculate split sizes
        num_images = len(images)
        train_size = int(num_images * 0.7)
        val_size = int(num_images * 0.15)

        # Split images
        train_images = images[:train_size]
        val_images = images[train_size : train_size + val_size]
        test_images = images[train_size + val_size :]

        # Copy to respective splits in healthy_food directory
        for split_info in [
            ("training", train_images),
            ("validation", val_images),
            ("evaluation", test_images),
        ]:
            split_name, split_images = split_info
            for img in split_images:
                shutil.copy2(
                    os.path.join(category_path, img),
                    os.path.join(
                        output_path, split_name, "healthy_food", f"{category}_{img}"
                    ),
                )

    print("\nCopying unhealthy food images from Food-101...")
    for category in UNHEALTHY_FOODS:
        # Same process for unhealthy foods
        category_path = os.path.join(food101_path, category)
        if not os.path.exists(category_path):
            print(f"Warning: Category {category} not found")
            continue

        images = [f for f in os.listdir(category_path) if f.endswith(".jpg")]
        images = images[:total_images_per_category]

        num_images = len(images)
        train_size = int(num_images * 0.7)
        val_size = int(num_images * 0.15)

        train_images = images[:train_size]
        val_images = images[train_size : train_size + val_size]
        test_images = images[train_size + val_size :]

        # Copy to respective splits in unhealthy_food directory
        for split_info in [
            ("training", train_images),
            ("validation", val_images),
            ("evaluation", test_images),
        ]:
            split_name, split_images = split_info
            for img in split_images:
                shutil.copy2(
                    os.path.join(category_path, img),
                    os.path.join(
                        output_path, split_name, "unhealthy_food", f"{category}_{img}"
                    ),
                )

    # Print final dataset statistics
    print("\nFinal Dataset Statistics:")
    for split in ["training", "validation", "evaluation"]:
        healthy_count = len(
            os.listdir(os.path.join(output_path, split, "healthy_food"))
        )
        non_food_count = len(os.listdir(os.path.join(output_path, split, "non_food")))
        unhealthy_count = len(
            os.listdir(os.path.join(output_path, split, "unhealthy_food"))
        )
        print(f"\n{split.capitalize()} set:")
        print(f"Healthy food images: {healthy_count}")
        print(f"Non-food images: {non_food_count}")
        print(f"Unhealthy food images: {unhealthy_count}")
        print(f"Total: {healthy_count + non_food_count + unhealthy_count}")


if __name__ == "__main__":
    print("Creating hybrid dataset...")
    create_hybrid_dataset()
    print("\nDone!")
