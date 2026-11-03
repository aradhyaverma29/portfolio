import cv2
import numpy as np
import json
import os

cap = cv2.VideoCapture('tools/source/character.mp4')

# Based on analysis:
# Frames 182..191 have the highest edge scores (both eyes fully open) for center gaze
# F192, F193, F194 and F384 jump to Edge L=1.4 — these are winks/half-closed (left eye shuts)
# Best center frame: 183 is fine based on the edge analysis. 
# But let's compare 182, 183, 184 — all have similar high values.
# Winner: frame 183 (already chosen) — but the original center.webp IS frame 183.
# The wink they saw might be from frame 192-194 being in the pose set.

# Current pose set:
# pose_16 = F211 (348.3 deg) - check eyes
# pose_17 = F213 (356.9 deg) - check eyes  
# Frames 192, 193, 194 are NOT in the pose set, but let's double check all poses.

with open('assets/frames/poses.json') as f:
    data = json.load(f)

# Build eye quality report for all frames in pose set
def eye_score(crop):
    """Returns (edge_L, edge_R) for the two eye patches."""
    eye_l = crop[265:298, 458:488]
    eye_r = crop[265:298, 492:522]
    gray_l = cv2.cvtColor(eye_l, cv2.COLOR_BGR2GRAY)
    gray_r = cv2.cvtColor(eye_r, cv2.COLOR_BGR2GRAY)
    el = np.sum(cv2.Sobel(gray_l, cv2.CV_64F, 1, 1)**2) / 1e5
    er = np.sum(cv2.Sobel(gray_r, cv2.CV_64F, 1, 1)**2) / 1e5
    return el, er

print("=== EYE CHECK FOR ALL POSES ===")
blink_frames = []
for p in data['poses']:
    f_num = p['sourceFrame']
    cap.set(cv2.CAP_PROP_POS_FRAMES, f_num)
    ret, frame = cap.read()
    crop = frame[:, 147:1132]
    
    # When head turns, offset the eye search region by the tracked dx, dy from F183
    el, er = eye_score(crop)
    status = "OK"
    if el < 2.5 or er < 2.5:
        status = "WINK/BLINK"
        blink_frames.append(p['id'])
    print(f"Pose {p['id']:02d} (F{f_num:3d}, {p['label']:12s}, {p['angle']:5.1f}°): EL={el:4.1f} ER={er:4.1f} [{status}]")

# Also check center frame (F183)
cap.set(cv2.CAP_PROP_POS_FRAMES, 183)
ret, frame = cap.read()
crop = frame[:, 147:1132]
el, er = eye_score(crop)
print(f"\nCenter F183: EL={el:.1f} ER={er:.1f}")

# Check F182, F184, F373, F374, F375 as alternative center frames
for f in [182, 183, 184, 373, 374, 375, 376]:
    cap.set(cv2.CAP_PROP_POS_FRAMES, f)
    ret, frame = cap.read()
    crop = frame[:, 147:1132]
    el, er = eye_score(crop)
    print(f"F{f}: EL={el:.1f} ER={er:.1f}")

cap.release()
print(f"\nBlink/wink pose IDs to remove: {blink_frames}")
