import cv2
import numpy as np
import time
import screen_brightness_control as sbc

# MediaPipe 0.10+ imports
from mediapipe.tasks.python import vision
from mediapipe.tasks.python.vision import HandLandmarker, HandLandmarkerOptions, HandLandmarkerResult


options = HandLandmarkerOptions(
    model_path=HandLandmarkerOptions.DEFAULT_MODEL_PATH,
    num_hands=1
)
hand_landmarker = HandLandmarker.create_from_options(options)

cap = cv2.VideoCapture(0)
prev_brightness = sbc.get_brightness()  # current brightness
smoothness = 5  # higher = smoother

def get_landmark_coords(landmark, img_w, img_h):
    """Convert normalized landmark to pixel coordinates."""
    return int(landmark.x * img_w), int(landmark.y * img_h)

while True:
    success, img = cap.read()
    if not success:
        continue

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # Detect hands
    result: HandLandmarkerResult = hand_landmarker.detect(img_rgb)

    if result.hand_landmarks:
        handLms = result.hand_landmarks[0]  # first hand
        h, w, _ = img.shape

        # Thumb tip = 4, Index tip = 8
        x1, y1 = get_landmark_coords(handLms[4], w, h)
        x2, y2 = get_landmark_coords(handLms[8], w, h)

        # Distance between fingers
        dist = np.hypot(x2 - x1, y2 - y1)

        # Map distance to brightness
        brightness = np.interp(dist, [20, 200], [0, 100])

        # Smooth brightness to avoid jumps
        brightness = prev_brightness + (brightness - prev_brightness) / smoothness
        sbc.set_brightness(int(brightness))
        prev_brightness = brightness

        # Draw brightness bar
        cv2.rectangle(img, (50, 150), (85, 400), (0,255,0), 2)
        cv2.rectangle(img, (50, int(400 - (brightness*2.5))), (85, 400), (0,255,0), -1)
        cv2.putText(img, f'{int(brightness)}%', (40, 430),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)

        # Draw line & circles between thumb and index
        cv2.line(img, (x1,y1), (x2,y2), (255,0,0), 3)
        cv2.circle(img, (x1,y1), 8, (0,0,255), cv2.FILLED)
        cv2.circle(img, (x2,y2), 8, (0,0,255), cv2.FILLED)

    cv2.imshow("Brightness Control", img)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

