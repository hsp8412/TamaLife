# train.py
import tensorflow as tf
from tensorflow.keras import layers, models
from dataset import FoodDataset
import os


def train():
    # Configuration
    DATA_DIR = "../data/hybrid_dataset"
    IMG_SIZE = (224, 224)
    BATCH_SIZE = 32
    EPOCHS = 15

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

    # Create checkpoints directory
    os.makedirs("checkpoints", exist_ok=True)

    # Callbacks with .h5 format
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

    # Save final model in .h5 format
    print("\nSaving final model...")
    model.save("checkpoints/model.h5", save_format="h5")

    return history, model


if __name__ == "__main__":
    print("Starting training process...")
    try:
        history, model = train()
    except Exception as e:
        print(f"Error during training: {str(e)}")
