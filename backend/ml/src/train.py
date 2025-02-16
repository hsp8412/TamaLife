# train.py
import tensorflow as tf
from tensorflow.keras import layers, models
from dataset import FoodDataset
import os
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
import json
import traceback


def test_specific_categories(model, data_dir, categories=["grilled_salmon", "sushi"]):
    """
    Test model performance on specific food categories

    Args:
        model: Trained tensorflow model
        data_dir: Directory containing the dataset
        categories: List of food categories to test
    """
    eval_dir = os.path.join(data_dir, "evaluation/healthy_food")

    if not os.path.exists(eval_dir):
        print(f"Error: Directory not found: {eval_dir}")
        return

    for category in categories:
        print(f"\nTesting {category} images:")
        print("=" * 50)

        # Get all images for this category
        category_images = [f for f in os.listdir(eval_dir) if category in f]

        if not category_images:
            print(f"No images found for category: {category}")
            continue

        for img_name in category_images:
            try:
                img_path = os.path.join(eval_dir, img_name)
                img = tf.keras.preprocessing.image.load_img(
                    img_path, target_size=(224, 224)
                )
                img_array = tf.keras.preprocessing.image.img_to_array(img)
                img_array = np.expand_dims(img_array, 0) / 255.0

                predictions = model.predict(img_array, verbose=0)[0]

                print(f"\nImage: {img_name}")
                print("Predictions:")
                categories = ["non_food", "healthy_food", "unhealthy_food"]
                for cat, pred in zip(categories, predictions):
                    print(f"{cat}: {pred:.4f}")

            except Exception as e:
                print(f"Error processing image {img_name}: {str(e)}")


def create_model(img_size):
    """Create and return the model architecture"""
    data_augmentation = tf.keras.Sequential(
        [
            layers.RandomRotation(0.2),
            layers.RandomZoom(0.2),
            layers.RandomBrightness(0.2),
            layers.RandomContrast(0.2),
        ]
    )

    model = models.Sequential(
        [
            data_augmentation,
            tf.keras.applications.MobileNetV2(
                input_shape=(*img_size, 3), include_top=False, weights="imagenet"
            ),
            layers.GlobalAveragePooling2D(),
            layers.Dense(512, activation="relu"),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            layers.Dense(256, activation="relu"),
            layers.BatchNormalization(),
            layers.Dropout(0.4),
            layers.Dense(3, activation="softmax"),
        ]
    )

    return model


def train():
    """Main training function with improved checkpoint and save handling"""
    # Configuration
    DATA_DIR = "../data/hybrid_dataset"
    IMG_SIZE = (224, 224)
    BATCH_SIZE = 32
    EPOCHS = 30

    # Create directories for model artifacts
    CHECKPOINT_DIR = os.path.join("checkpoints")
    LOG_DIR = os.path.join("logs")

    os.makedirs(CHECKPOINT_DIR, exist_ok=True)
    os.makedirs(LOG_DIR, exist_ok=True)

    try:
        # Create datasets
        dataset = FoodDataset(DATA_DIR, IMG_SIZE, BATCH_SIZE)
        train_ds = dataset.create_dataset("training")
        val_ds = dataset.create_dataset("validation")

        # Create model
        print("\nCreating model with improved architecture...")
        model = create_model(IMG_SIZE)

        # Compile model
        optimizer = tf.keras.optimizers.Adam(learning_rate=0.00005)
        model.compile(
            optimizer=optimizer,
            loss="categorical_crossentropy",
            metrics=[
                "accuracy",
                tf.keras.metrics.Precision(),
                tf.keras.metrics.Recall(),
            ],
        )

        # Enhanced callbacks with proper file paths
        callbacks = [
            # Model checkpoint for weights
            tf.keras.callbacks.ModelCheckpoint(
                filepath=os.path.join(
                    CHECKPOINT_DIR, "weights.{epoch:02d}-{val_accuracy:.4f}.weights.h5"
                ),
                save_weights_only=True,
                monitor="val_accuracy",
                mode="max",
                save_best_only=True,
                verbose=1,
            ),
            # Model checkpoint for full model
            tf.keras.callbacks.ModelCheckpoint(
                filepath=os.path.join(
                    CHECKPOINT_DIR, "model.{epoch:02d}-{val_accuracy:.4f}.h5"
                ),
                save_weights_only=False,
                monitor="val_accuracy",
                mode="max",
                save_best_only=True,
                verbose=1,
            ),
            # Early stopping
            tf.keras.callbacks.EarlyStopping(
                monitor="val_accuracy", patience=7, restore_best_weights=True, verbose=1
            ),
            # Learning rate reduction
            tf.keras.callbacks.ReduceLROnPlateau(
                monitor="val_loss", factor=0.2, patience=5, min_lr=1e-7, verbose=1
            ),
            # Training logs
            tf.keras.callbacks.CSVLogger(
                os.path.join(LOG_DIR, "training_history.csv"),
                separator=",",
                append=False,
            ),
            # TensorBoard logging
            tf.keras.callbacks.TensorBoard(
                log_dir=os.path.join(LOG_DIR, "tensorboard"),
                histogram_freq=1,
                write_graph=True,
                update_freq="epoch",
            ),
        ]

        # Class weights for imbalanced dataset
        class_weights = {
            0: 1.0,  # non-food
            1: 1.5,  # healthy food
            2: 1.0,  # unhealthy food
        }

        # Train model
        print("\nStarting training with enhanced configuration...")
        history = model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=EPOCHS,
            callbacks=callbacks,
            class_weight=class_weights,
            verbose=1,
        )

        # Save final model artifacts
        final_model_path = os.path.join(CHECKPOINT_DIR, "final_model.h5")
        final_weights_path = os.path.join(CHECKPOINT_DIR, "final_weights.weights.h5")
        architecture_path = os.path.join(CHECKPOINT_DIR, "model_architecture.json")

        print("\nSaving final model artifacts...")

        # Save complete model
        model.save(final_model_path)
        print(f"Complete model saved to: {final_model_path}")

        # Save weights
        model.save_weights(final_weights_path)
        print(f"Model weights saved to: {final_weights_path}")

        # Save architecture
        with open(architecture_path, "w") as f:
            f.write(model.to_json())
        print(f"Model architecture saved to: {architecture_path}")

        # Save training history
        history_path = os.path.join(LOG_DIR, "training_history.json")
        with open(history_path, "w") as f:
            json.dump(history.history, f)
        print(f"Training history saved to: {history_path}")

        return history, model

    except Exception as e:
        print(f"Error during training: {str(e)}")
        traceback.print_exc()
        return None, None


if __name__ == "__main__":
    print("Starting enhanced training process...")
    try:
        history, model = train()

        if model is not None:
            print("\nTesting specific food categories...")
            test_specific_categories(model, "../data/hybrid_dataset")
    except Exception as e:
        print(f"Error in main execution: {str(e)}")
