import cv2
import numpy as np
import json
import os

# The eye metric is unreliable when the head turns — the eye patches are at fixed coords
# but the eyes move with the head. We need to offset the eye search region based on each pose's dx, dy.
# From clean_frames_analysis.json we have dx, dy for each frame.

with open('tools/clean_frames_analysis.json') as f:
    all_frames = json.load(f)

frame_map = {x['frame']: x for x in all_frames}

with open('assets/frames/poses.json') as f:
    data = json.load(f)

cap = cv2.VideoCapture('tools/source/character.mp4')

# Base eye positions in NEUTRAL frame (F183):
# Left eye center  ~ (x=468, y=278) in cropped coords (in 985x720)
# Right eye center ~ (x=508, y=278)
BASE_EYE_L = (468, 278)
BASE_EYE_R = (508, 278)
EYE_PATCH_W = 30
EYE_PATCH_H = 28

def eye_score_offset(crop, dx, dy):
    """Compute eye openness with head-turn offset applied."""
    lx = BASE_EYE_L[0] + dx - EYE_PATCH_W // 2
    ly = BASE_EYE_L[1] + dy - EYE_PATCH_H // 2
    rx = BASE_EYE_R[0] + dx - EYE_PATCH_W // 2
    ry = BASE_EYE_R[1] + dy - EYE_PATCH_H // 2

    # Clamp to valid range
    lx = max(0, min(985 - EYE_PATCH_W, lx))
    rx = max(0, min(985 - EYE_PATCH_W, rx))
    ly = max(0, min(720 - EYE_PATCH_H, ly))
    ry = max(0, min(720 - EYE_PATCH_H, ry))

    eye_l = crop[ly:ly+EYE_PATCH_H, lx:lx+EYE_PATCH_W]
    eye_r = crop[ry:ry+EYE_PATCH_H, rx:rx+EYE_PATCH_W]

    if eye_l.size == 0 or eye_r.size == 0:
        return 0.0, 0.0

    gray_l = cv2.cvtColor(eye_l, cv2.COLOR_BGR2GRAY)
    gray_r = cv2.cvtColor(eye_r, cv2.COLOR_BGR2GRAY)
    el = float(np.sum(cv2.Sobel(gray_l, cv2.CV_64F, 1, 1)**2)) / 1e5
    er = float(np.sum(cv2.Sobel(gray_r, cv2.CV_64F, 1, 1)**2)) / 1e5
    return el, er

BLINK_THRESHOLD = 2.0

print("=== EYE CHECK (HEAD-OFFSET-CORRECTED) FOR ALL POSES ===")
bad_poses = []
for p in data['poses']:
    f_num = p['sourceFrame']
    info = frame_map.get(f_num, {'dx': 0, 'dy': 0})
    dx, dy = info['dx'], info['dy']
    
    cap.set(cv2.CAP_PROP_POS_FRAMES, f_num)
    ret, frame = cap.read()
    crop = frame[:, 147:1132]
    
    el, er = eye_score_offset(crop, dx, dy)
    status = "OK"
    if el < BLINK_THRESHOLD and er < BLINK_THRESHOLD:
        status = "BLINK"
        bad_poses.append(p['id'])
    elif el < BLINK_THRESHOLD:
        status = "LEFT-EYE-CLOSED"
        bad_poses.append(p['id'])
    elif er < BLINK_THRESHOLD:
        status = "RIGHT-EYE-CLOSED"
        bad_poses.append(p['id'])
    
    print(f"Pose {p['id']:02d} F{f_num:3d} {p['label']:12s} {p['angle']:5.1f}° dx={dx:+3d} dy={dy:+3d}: EL={el:4.1f} ER={er:4.1f} [{status}]")

cap.release()
print(f"\nPoses with closed/half-closed eyes: {bad_poses}")
print(f"Total poses remaining if removed: {len(data['poses']) - len(bad_poses)}")
