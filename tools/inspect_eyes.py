import cv2
import numpy as np
import os

cap = cv2.VideoCapture('tools/source/character.mp4')
total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
print(f"Total frames: {total}")

# In cropped frame (985x720):
# Character face is around x: 440..540, y: 240..340
# Eyes are around y: 260..300, x: 450..530
os.makedirs('tools/eyes_check', exist_ok=True)

# Let's inspect frames 175..195 and 365..385 (center candidates)
candidates = list(range(175, 195)) + list(range(365, 385))

for f in candidates:
    cap.set(cv2.CAP_PROP_POS_FRAMES, f)
    ret, frame = cap.read()
    if ret:
        crop = frame[:, 147:1132]
        face = crop[220:380, 420:560]
        eyes = crop[260:310, 450:530]
        cv2.imwrite(f'tools/eyes_check/f{f:03d}_face.jpg', face)
        cv2.imwrite(f'tools/eyes_check/f{f:03d}_eyes.jpg', eyes)

cap.release()
print("Extracted face and eyes for frames 175-194 and 365-384")
