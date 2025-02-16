# dataset.py
import tensorflow as tf
import os
import numpy as np
from typing import Tuple, Dict


class FoodDataset:
    def __init__(
        self,
        data_dir: str,
        img_size: Tuple[int, int] = (224, 224),
        batch_size: int = 32,
    ):
        """
        Initialize FoodDataset with enhanced preprocessing and validation

        Args:
            data_dir: Root directory of the dataset
            img_size: Target size for images (height, width)
            batch_size: Batch size for training
        """
        self.data_dir = data_dir
        self.img_size = img_size
        self.batch_size = batch_size
        self.categories = ["non_food", "healthy_food", "unhealthy_food"]

    def _parse_image(
        self, filename: tf.Tensor, label: tf.Tensor
    ) -> Tuple[tf.Tensor, tf.Tensor]:
        """
        Enhanced image parsing with robust augmentation and preprocessing
        """
        # Convert filename to string
        filename = tf.cast(filename, tf.string)
        label = tf.cast(label, tf.int32)

        # Read and decode image
        image = tf.io.read_file(filename)
        image = tf.image.decode_jpeg(image, channels=3)

        # Enhanced data augmentation pipeline
        image = tf.cast(image, tf.float32)

        # Random augmentations for training diversity
        image = tf.image.random_brightness(image, 0.2)
        image = tf.image.random_contrast(image, 0.8, 1.2)
        image = tf.image.random_saturation(image, 0.8, 1.2)
        image = tf.image.random_hue(image, 0.1)
        image = tf.image.random_flip_left_right(image)

        # 50% chance of additional augmentations
        if tf.random.uniform([]) > 0.5:
            image = tf.image.transpose(image)
            image = tf.image.random_flip_up_down(image)

        # Center crop before resize for consistent aspect ratio
        shape = tf.shape(image)
        min_dim = tf.minimum(shape[0], shape[1])
        image = tf.image.resize_with_crop_or_pad(image, min_dim, min_dim)

        # Resize to target size
        image = tf.image.resize(image, self.img_size)

        # Normalize pixel values
        image = tf.clip_by_value(image, 0.0, 255.0)
        image = image / 255.0

        # Convert label to one-hot encoding
        label = tf.one_hot(label, 3)

        return image, label

    def create_dataset(self, split: str = "training") -> tf.data.Dataset:
        """
        Create dataset with enhanced error handling and logging
        """
        split_dir = os.path.join(self.data_dir, split)

        # Initialize containers
        image_files = []
        labels = []
        category_counts = {category: 0 for category in self.categories}

        # Process each category
        for label, category in enumerate(self.categories):
            category_dir = os.path.join(split_dir, category)

            if not os.path.exists(category_dir):
                print(f"Warning: Directory not found: {category_dir}")
                continue

            # Get all valid image files
            valid_files = [
                os.path.join(category_dir, f)
                for f in os.listdir(category_dir)
                if f.lower().endswith((".jpg", ".jpeg", ".png"))
            ]

            category_counts[category] = len(valid_files)
            image_files.extend(valid_files)
            labels.extend([label] * len(valid_files))

        # Print dataset statistics
        print(f"\nDataset statistics for {split}:")
        print("-" * 50)
        for category, count in category_counts.items():
            print(f"{category}: {count} images")
        print(f"Total: {sum(category_counts.values())} images")

        # Verify dataset is not empty
        if not image_files:
            raise ValueError(f"No images found in {split_dir}")

        # Create TensorFlow dataset
        dataset = tf.data.Dataset.from_tensor_slices(
            (tf.constant(image_files), tf.constant(labels, dtype=tf.int32))
        )

        # Configure dataset for performance
        dataset = dataset.map(self._parse_image, num_parallel_calls=tf.data.AUTOTUNE)

        if split == "training":
            # Shuffle training data with larger buffer
            dataset = dataset.shuffle(
                buffer_size=min(50000, len(image_files)), reshuffle_each_iteration=True
            )

        # Optimize performance
        dataset = dataset.batch(self.batch_size).prefetch(tf.data.AUTOTUNE).cache()

        return dataset

    def get_class_weights(self, split: str = "training") -> Dict[int, float]:
        """
        Calculate balanced class weights with improved handling of edge cases
        """
        split_dir = os.path.join(self.data_dir, split)

        # Count images in each class
        counts = {}
        for i, category in enumerate(self.categories):
            category_dir = os.path.join(split_dir, category)
            if os.path.exists(category_dir):
                counts[i] = len(
                    [
                        f
                        for f in os.listdir(category_dir)
                        if f.lower().endswith((".jpg", ".jpeg", ".png"))
                    ]
                )
            else:
                counts[i] = 0
                print(f"Warning: Directory not found: {category_dir}")

        # Calculate total samples
        total_samples = sum(counts.values())
        if total_samples == 0:
            raise ValueError(f"No images found in {split_dir}")

        # Calculate balanced weights
        n_classes = len(self.categories)
        weights = {}
        for class_idx, count in counts.items():
            if count == 0:
                weights[class_idx] = 1.0
            else:
                weights[class_idx] = total_samples / (n_classes * count)

        # Print weight distribution
        print(f"\nClass weights for {split}:")
        for i, category in enumerate(self.categories):
            print(f"{category}: {weights[i]:.4f}")

        return weights

    def validate_dataset(self) -> None:
        """
        Validate dataset integrity and balance
        """
        for split in ["training", "validation", "evaluation"]:
            split_dir = os.path.join(self.data_dir, split)
            if not os.path.exists(split_dir):
                print(f"Warning: Split directory not found: {split_dir}")
                continue

            total_images = 0
            corrupted_images = 0

            for category in self.categories:
                category_dir = os.path.join(split_dir, category)
                if not os.path.exists(category_dir):
                    print(f"Warning: Category directory not found: {category_dir}")
                    continue

                # Check each image
                for img_name in os.listdir(category_dir):
                    if not img_name.lower().endswith((".jpg", ".jpeg", ".png")):
                        continue

                    total_images += 1
                    img_path = os.path.join(category_dir, img_name)

                    try:
                        with tf.io.gfile.GFile(img_path, "rb") as fid:
                            image_data = fid.read()
                            _ = tf.image.decode_jpeg(image_data, channels=3)
                    except tf.errors.InvalidArgumentError:
                        print(f"Corrupted image found: {img_path}")
                        corrupted_images += 1

            print(f"\nDataset validation results for {split}:")
            print(f"Total images: {total_images}")
            print(f"Corrupted images: {corrupted_images}")
