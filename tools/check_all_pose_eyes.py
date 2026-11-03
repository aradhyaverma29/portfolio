import json
import cv2
import numpy as np

with open('assets/frames/poses.json') as f:
    data = json.load(f)

cap = cv2.VideoCapture('tools/source/character.mp4')

print("=== CHECKING CURRENT POSES IN POSES.JSON ===")
for p in data['poses']:
    f_num = p['sourceFrame']
    cap.set(cv2.CAP_PROP_POS_FRAMES, f_num)
    ret, frame = cap.read()
    crop = frame[:, 147:1132]
    # Save face to tools/eyes_check
    cv2.imwrite(f"tools/eyes_check/pose_{p['id']:02d}_f{f_num:03d}.jpg", crop[230:370, 430:550])
    
    # Check left and right eye
    # Note: when head turns, face moves slightly by dx, dy
    # Let's locate the face template
cap.release()
print("Saved all 18 pose faces to tools/eyes_check/")
