# train.py
import tensorflow as tf
from tensorflow.keras import layers, models
from dataset import FoodDataset
import os
import shutil


def ensure_directories():
    """Create necessary directories for model saving"""
    # Create both src/checkpoints and checkpoints directories
    directories = ["checkpoints", "src/checkpoints"]
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"Created directory: {directory}")


def save_model_with_verification(model, base_path, filename):
    """Save model and verify it exists in both locations"""
    # Save to primary location
    primary_path = os.path.join(base_path, filename)
    model.save(primary_path)
    print(f"Model saved to: {primary_path}")

    # Copy to src/checkpoints for compatibility
    src_path = os.path.join("src/checkpoints", filename)
    shutil.copy2(primary_path, src_path)
    print(f"Model copied to: {src_path}")

    return primary_path, src_path


def train():
    # Configuration
    DATA_DIR = "../data/hybrid_dataset"
    IMG_SIZE = (224, 224)
    BATCH_SIZE = 32
    EPOCHS = 15

    # Ensure directories exist
    ensure_directories()

    print(f"Loading data from: {os.path.abspath(DATA_DIR)}")

    # Create datasets
    dataset = FoodDataset(DATA_DIR, IMG_SIZE, BATCH_SIZE)
    train_ds = dataset.create_dataset("training")
    val_ds = dataset.create_dataset("validation")

    # Get class weights
    class_weights = dataset.get_class_weights("training")
    print("\nClass weights:", class_weights)

    # Create model
    print("\nCreating model...")
    model = models.Sequential(
        [
            tf.keras.applications.MobileNetV2(
                input_shape=(*IMG_SIZE, 3), include_top=False, weights="imagenet"
            ),
            layers.GlobalAveragePooling2D(),
            layers.Dense(256, activation="relu"),
            layers.Dropout(0.4),
            layers.Dense(128, activation="relu"),
            layers.Dropout(0.3),
            layers.Dense(3, activation="softmax"),
        ]
    )

    # Compile model
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    # Callbacks
    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(
            filepath="checkpoints/best_model.h5",
            save_best_only=True,
            monitor="val_accuracy",
            mode="max",
            verbose=1,
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_accuracy", patience=5, restore_best_weights=True
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss", factor=0.2, patience=3, min_lr=1e-6
        ),
    ]

    # Train model
    print("\nStarting training...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=callbacks,
        class_weight=class_weights,
        verbose=1,
    )

    # Save final model with verification
    print("\nSaving final model...")
    try:
        primary_path, src_path = save_model_with_verification(
            model, "checkpoints", "model.h5"
        )
        print(f"Model successfully saved and verified at:")
        print(f"1. {primary_path}")
        print(f"2. {src_path}")
    except Exception as e:
        print(f"Error saving model: {str(e)}")

    return history, model


if __name__ == "__main__":
    print("Starting training process...")
    try:
        history, model = train()

        # Verify saved model exists
        expected_paths = ["checkpoints/model.h5", "src/checkpoints/model.h5"]
        for path in expected_paths:
            if os.path.exists(path):
                print(f"Verified: Model exists at {path}")
            else:
                print(f"Warning: Model not found at {path}")

    except Exception as e:
        print(f"Error during training: {str(e)}")
