import cv2
import numpy as np
import json
import os

# Poses 2 (F46, UP-RIGHT 45°), 3 (F62, ENE 67.7°), 4 (F65, RIGHT 94.4°), 5 (F67, ESE 116.6°)
# have eyes closed/half-closed. Need replacements.
# These are in 45-117 degree range (UP-RIGHT to ESE).
# Let's search clean frames in cycle 2 for those angles.

with open('tools/clean_frames_analysis.json') as f:
    all_frames = json.load(f)

cap = cv2.VideoCapture('tools/source/character.mp4')

BASE_EYE_L = (468, 278)
BASE_EYE_R = (508, 278)
EYE_PATCH_W = 30
EYE_PATCH_H = 28

def eye_score_offset(crop, dx, dy):
    lx = max(0, min(985 - EYE_PATCH_W, BASE_EYE_L[0] + dx - EYE_PATCH_W // 2))
    ly = max(0, min(720 - EYE_PATCH_H, BASE_EYE_L[1] + dy - EYE_PATCH_H // 2))
    rx = max(0, min(985 - EYE_PATCH_W, BASE_EYE_R[0] + dx - EYE_PATCH_W // 2))
    ry = max(0, min(720 - EYE_PATCH_H, BASE_EYE_R[1] + dy - EYE_PATCH_H // 2))
    
    eye_l = crop[ly:ly+EYE_PATCH_H, lx:lx+EYE_PATCH_W]
    eye_r = crop[ry:ry+EYE_PATCH_H, rx:rx+EYE_PATCH_W]
    
    if eye_l.size == 0 or eye_r.size == 0:
        return 0.0, 0.0
    
    gl = cv2.cvtColor(eye_l, cv2.COLOR_BGR2GRAY)
    gr = cv2.cvtColor(eye_r, cv2.COLOR_BGR2GRAY)
    el = float(np.sum(cv2.Sobel(gl, cv2.CV_64F, 1, 1)**2)) / 1e5
    er = float(np.sum(cv2.Sobel(gr, cv2.CV_64F, 1, 1)**2)) / 1e5
    return el, er

# Clean safe frames (no hand): 0..111, 166..299, 353..386
def is_clean(f):
    return (0 <= f <= 111) or (166 <= f <= 299) or (353 <= f <= 386)

# Target angles we need replacements for
target_angles = [45.0, 67.7, 94.4, 116.6]

frame_map = {x['frame']: x for x in all_frames}
clean_frames = [x for x in all_frames if is_clean(x['frame']) and x['dist'] >= 8]

print("=== SEARCHING REPLACEMENTS FOR CLOSED-EYE POSES ===")
for target_angle in target_angles:
    def ang_diff(a, b):
        d = abs(a - b) % 360
        return min(d, 360 - d)
    
    # Candidates within 30 degrees
    candidates = [(x, ang_diff(x['angle'], target_angle)) for x in clean_frames if ang_diff(x['angle'], target_angle) < 30]
    candidates.sort(key=lambda t: t[1])
    
    print(f"\nTarget {target_angle}° — top candidates:")
    found = False
    for c_data, diff in candidates[:15]:
        f_num = c_data['frame']
        dx, dy = c_data['dx'], c_data['dy']
        cap.set(cv2.CAP_PROP_POS_FRAMES, f_num)
        ret, frame = cap.read()
        crop = frame[:, 147:1132]
        el, er = eye_score_offset(crop, dx, dy)
        ok = el >= 2.0 and er >= 2.0
        status = "EYES OPEN" if ok else "EYES CLOSED"
        print(f"  F{f_num:3d}: angle={c_data['angle']:5.1f}deg (diff={diff:.1f}deg) dist={c_data['dist']:.1f}px EL={el:.1f} ER={er:.1f} [{status}]")
        if ok and not found:
            print(f"  >>> BEST REPLACEMENT for {target_angle}deg is F{f_num} at {c_data['angle']}deg")
            found = True

cap.release()
