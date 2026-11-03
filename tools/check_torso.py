import cv2
import numpy as np

cap = cv2.VideoCapture('assets/character.mp4.mp4')
# Get center chest
cap.set(cv2.CAP_PROP_POS_FRAMES, 183)
ret, center_frame = cap.read()
center_crop = center_frame[:, 147:1132]
chest_ref = center_crop[520:680, 400:600]

selected_frames = [22, 43, 46, 62, 65, 67, 72, 103, 107, 110, 111, 204, 207, 208, 209, 210, 211, 213, 183]

for f in selected_frames:
    cap.set(cv2.CAP_PROP_POS_FRAMES, f)
    ret, frame = cap.read()
    crop = frame[:, 147:1132]
    chest = crop[520:680, 400:600]
    diff = np.mean(np.abs(chest.astype(float) - chest_ref.astype(float)))
    print(f"Frame {f:3d} chest diff vs ref: {diff:.2f}")
cap.release()
