import cv2
import numpy as np
import os

selected = [
    {'name': 'UP', 'frame': 22, 'angle': 1.4},
    {'name': 'NNE', 'frame': 43, 'angle': 24.3},
    {'name': 'UP-RIGHT', 'frame': 46, 'angle': 45.0},
    {'name': 'ENE', 'frame': 62, 'angle': 67.7},
    {'name': 'RIGHT', 'frame': 65, 'angle': 94.4},
    {'name': 'ESE', 'frame': 67, 'angle': 116.6},
    {'name': 'DOWN-RIGHT', 'frame': 72, 'angle': 135.0},
    {'name': 'SSE', 'frame': 103, 'angle': 156.6},
    {'name': 'DOWN', 'frame': 107, 'angle': 182.3},
    {'name': 'SSW', 'frame': 110, 'angle': 205.8},
    {'name': 'DOWN-LEFT', 'frame': 111, 'angle': 213.2},
    {'name': 'LEFT', 'frame': 204, 'angle': 270.0},
    {'name': 'WNW', 'frame': 207, 'angle': 282.1},
    {'name': 'UP-LEFT-1', 'frame': 208, 'angle': 298.3},
    {'name': 'UP-LEFT-2', 'frame': 209, 'angle': 309.8},
    {'name': 'UP-LEFT-3', 'frame': 210, 'angle': 324.5},
    {'name': 'NNW', 'frame': 211, 'angle': 348.3},
    {'name': 'NNW-UP', 'frame': 213, 'angle': 356.9},
]

cap = cv2.VideoCapture('assets/character.mp4.mp4')
thumbs = []
tile_w, tile_h = 240, 175

for p in selected:
    cap.set(cv2.CAP_PROP_POS_FRAMES, p['frame'])
    ret, frame = cap.read()
    crop = frame[:, 147:1132]
    # Resize
    t = cv2.resize(crop, (tile_w, tile_h))
    # Add label
    cv2.rectangle(t, (0, tile_h - 26), (tile_w, tile_h), (0, 0, 0), -1)
    label = f"{p['name']} (F{p['frame']}, {p['angle']:.0f}deg)"
    cv2.putText(t, label, (6, tile_h - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 255), 1)
    thumbs.append(t)

# Also center frame
cap.set(cv2.CAP_PROP_POS_FRAMES, 183)
ret, center_frame = cap.read()
center_crop = center_frame[:, 147:1132]
t_center = cv2.resize(center_crop, (tile_w, tile_h))
cv2.rectangle(t_center, (0, tile_h - 26), (tile_w, tile_h), (0, 0, 0), -1)
cv2.putText(t_center, "CENTER (F183, 0deg deadzone)", (6, tile_h - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 0), 1)
thumbs.append(t_center)

cap.release()

# Grid 4 rows x 5 cols = 20 tiles
grid = np.zeros((4 * tile_h, 5 * tile_w, 3), dtype=np.uint8)
for i, t in enumerate(thumbs):
    r = i // 5
    c = i % 5
    grid[r*tile_h:(r+1)*tile_h, c*tile_w:(c+1)*tile_w] = t

os.makedirs('tools', exist_ok=True)
cv2.imwrite('tools/selected_poses_montage.jpg', grid)
print("Saved tools/selected_poses_montage.jpg with 19 poses (18 angles + center)")
