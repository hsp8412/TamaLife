# train.py
import tensorflow as tf
from tensorflow.keras import layers, models
from dataset import FoodDataset
import os
import numpy as np
from sklearn.metrics import classification_report


def train():
    # Configuration
    DATA_DIR = "../data/hybrid_dataset"
    IMG_SIZE = (224, 224)
    BATCH_SIZE = 32
    EPOCHS = 30

    print(f"Loading data from: {os.path.abspath(DATA_DIR)}")

    # Create datasets
    dataset = FoodDataset(DATA_DIR, IMG_SIZE, BATCH_SIZE)
    train_ds = dataset.create_dataset("training")
    val_ds = dataset.create_dataset("validation")

    # Data augmentation layer
    data_augmentation = tf.keras.Sequential(
        [
            layers.RandomRotation(0.2),
            layers.RandomZoom(0.2),
            layers.RandomBrightness(0.2),
            layers.RandomContrast(0.2),
        ]
    )

    # Create enhanced model
    print("\nCreating model with improved architecture...")
    model = models.Sequential(
        [
            data_augmentation,
            tf.keras.applications.MobileNetV2(
                input_shape=(*IMG_SIZE, 3), include_top=False, weights="imagenet"
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

    # Compile with additional metrics
    optimizer = tf.keras.optimizers.Adam(learning_rate=0.00005)
    model.compile(
        optimizer=optimizer,
        loss="categorical_crossentropy",
        metrics=["accuracy", tf.keras.metrics.Precision(), tf.keras.metrics.Recall()],
    )

    # Enhanced class weights with emphasis on healthy food
    class_weights = {
        0: 1.0,  # non-food
        1: 1.5,  # healthy food (increased weight)
        2: 1.0,  # unhealthy food
    }

    # Enhanced callbacks
    checkpoint_path = "checkpoints/model.h5"
    os.makedirs("checkpoints", exist_ok=True)

    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(
            "best_model.h5", save_best_only=True, monitor="val_accuracy"
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_accuracy", patience=7, restore_best_weights=True
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss", factor=0.2, patience=5, min_lr=1e-7
        ),
        # Add TensorBoard callback for better monitoring
        tf.keras.callbacks.TensorBoard(
            log_dir="./logs", histogram_freq=1, update_freq="epoch"
        ),
    ]

    # Train model with improved parameters
    print("\nStarting training with enhanced configuration...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=callbacks,
        class_weight=class_weights,
        verbose=1,
    )

    # Save final model
    print("\nSaving final model...")
    model.save("model_final.h5")

    # Validate model on test set
    print("\nValidating model on test set...")
    test_ds = dataset.create_dataset("evaluation")
    validate_model(model, test_ds)

    return history, model


def validate_model(model, test_ds):
    """Validate model performance with detailed metrics"""
    # Evaluate model
    results = model.evaluate(test_ds, verbose=1)
    print(f"\nTest accuracy: {results[1]:.4f}")

    # Get predictions
    all_predictions = []
    all_labels = []

    for images, labels in test_ds:
        predictions = model.predict(images, verbose=0)
        all_predictions.extend(np.argmax(predictions, axis=1))
        all_labels.extend(np.argmax(labels, axis=1))

    # Generate classification report
    print("\nDetailed Classification Report:")
    print(
        classification_report(
            all_labels,
            all_predictions,
            target_names=["non_food", "healthy_food", "unhealthy_food"],
            digits=4,
        )
    )

    # Print confusion matrix
    from sklearn.metrics import confusion_matrix

    cm = confusion_matrix(all_labels, all_predictions)
    print("\nConfusion Matrix:")
    print(cm)


def test_specific_categories(model, data_dir, categories=["grilled_salmon", "sushi"]):
    """Test model performance on specific food categories"""
    eval_dir = os.path.join(data_dir, "evaluation/healthy_food")

    for category in categories:
        print(f"\nTesting {category} images:")
        print("=" * 50)

        # Get all images for this category
        category_images = [f for f in os.listdir(eval_dir) if category in f]

        for img_name in category_images:
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


if __name__ == "__main__":
    print("Starting enhanced training process...")
    history, model = train()

    # Test specific categories after training
    print("\nTesting specific food categories...")
    test_specific_categories(model, "../data/hybrid_dataset")
