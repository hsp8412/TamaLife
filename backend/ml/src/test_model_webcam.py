import tensorflow as tf
import cv2
import numpy as np
import os
import sys


def load_and_preprocess_frame(frame):
    resized = cv2.resize(frame, (224, 224))
    rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
    normalized = rgb / 255.0
    batched = np.expand_dims(normalized, 0)
    return batched


def main():
    # Load the trained model
    print("Loading model...")
    model_path = "../model_latest.h5"
    if not os.path.exists(model_path):
        print(f"Error: Model not found at {model_path}")
        sys.exit(1)

    model = tf.keras.models.load_model(model_path)

    # Category labels and colors
    CATEGORIES = ["NOT FOOD", "HEALTHY FOOD", "UNHEALTHY FOOD"]
    COLORS = [
        (0, 0, 255),  # Red for NOT FOOD
        (0, 255, 0),  # Green for HEALTHY FOOD
        (0, 165, 255),  # Orange for UNHEALTHY FOOD (BGR format)
    ]

    print("Starting webcam...")
    cap = cv2.VideoCapture(0)

    # Check if camera opened successfully
    if not cap.isOpened():
        print("\nError: Could not open camera")
        print(
            "Please check your camera permissions in System Settings > Privacy & Security > Camera"
        )
        print("Make sure Terminal/Python has permission to access the camera")
        sys.exit(1)

    print("Camera accessed successfully!")
    print("Press 'q' to quit")

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to grab frame")
                break

            processed_frame = load_and_preprocess_frame(frame)
            predictions = model.predict(processed_frame, verbose=0)[0]
            predicted_class = np.argmax(predictions)
            confidence = predictions[predicted_class]

            # Get all probabilities
            probabilities = {cat: prob for cat, prob in zip(CATEGORIES, predictions)}

            # Prepare text display
            text = CATEGORIES[predicted_class]
            confidence_text = f"Confidence: {confidence:.2f}"

            # Additional probabilities text
            prob_texts = [f"{cat}: {prob:.2f}" for cat, prob in probabilities.items()]

            # Background rectangle for text (make it larger for all probabilities)
            cv2.rectangle(frame, (10, 10), (300, 110), (0, 0, 0), -1)

            # Add main prediction and confidence
            cv2.putText(
                frame,
                text,
                (20, 35),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                COLORS[predicted_class],
                2,
            )
            cv2.putText(
                frame,
                confidence_text,
                (20, 60),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2,
            )

            # Add all probabilities
            y_offset = 85
            cv2.putText(
                frame,
                f"All: {' | '.join(prob_texts)}",
                (20, y_offset),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.4,
                (255, 255, 255),
                1,
            )

            cv2.imshow("Food Detector", frame)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                print("\nQuitting...")
                break

    except KeyboardInterrupt:
        print("\nInterrupted by user")
    except Exception as e:
        print(f"\nAn error occurred: {str(e)}")
    finally:
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
