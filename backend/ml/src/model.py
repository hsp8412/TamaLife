import tensorflow as tf
from tensorflow.keras import layers, models


def create_model(input_shape=(224, 224, 3)):
    # Base model (MobileNetV2)
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=input_shape, include_top=False, weights="imagenet"
    )

    # Freeze the base model
    base_model.trainable = False

    # Create new model with 3 output classes
    model = models.Sequential(
        [
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.Dense(128, activation="relu"),
            layers.Dropout(0.2),
            layers.Dense(3, activation="softmax"),  # Changed to 3 outputs with softmax
        ]
    )

    # Compile the model
    model.compile(
        optimizer="adam",
        loss="categorical_crossentropy",  # Use categorical_crossentropy for multi-class
        metrics=["accuracy"],
    )

    return model


def create_model_with_fine_tuning(input_shape=(224, 224, 3), fine_tune_layers=30):
    # Base model (MobileNetV2)
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=input_shape, include_top=False, weights="imagenet"
    )

    # Freeze early layers
    base_model.trainable = True
    for layer in base_model.layers[:-fine_tune_layers]:
        layer.trainable = False

    # Create new model with 3 output classes
    model = models.Sequential(
        [
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.Dense(256, activation="relu"),
            layers.Dropout(0.3),
            layers.Dense(128, activation="relu"),
            layers.Dropout(0.2),
            layers.Dense(3, activation="softmax"),  # Three categories
        ]
    )

    # Compile with a lower learning rate for fine-tuning
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    return model


def get_model_summary(model):
    """Get model architecture summary"""
    trainable_params = tf.keras.backend.count_params(
        tf.concat([tf.reshape(w, [-1]) for w in model.trainable_weights], axis=0)
    )
    non_trainable_params = tf.keras.backend.count_params(
        tf.concat([tf.reshape(w, [-1]) for w in model.non_trainable_weights], axis=0)
    )

    print("\nModel Summary:")
    print(f"Total parameters: {trainable_params + non_trainable_params:,}")
    print(f"Trainable parameters: {trainable_params:,}")
    print(f"Non-trainable parameters: {non_trainable_params:,}")

    return {
        "total_params": trainable_params + non_trainable_params,
        "trainable_params": trainable_params,
        "non_trainable_params": non_trainable_params,
    }
