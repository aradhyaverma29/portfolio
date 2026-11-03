import cv2
import numpy as np
import json

video_path = 'assets/character.mp4.mp4'
cap = cv2.VideoCapture(video_path)

# Extract center reference frame (frame 183)
cap.set(cv2.CAP_PROP_POS_FRAMES, 183)
ret, center_frame = cap.read()
center_crop = center_frame[:, 147:1132]

# Center face template around nose/eyes:
# In center_crop (height 720, width 985):
# Center is around x=492, y=260-350
face_tmpl = center_crop[260:360, 440:540]
cv2.imwrite('tools/face_tmpl.jpg', face_tmpl)

clean_ranges = [(0, 114), (166, 299), (353, 386)]

frame_data = []

cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
f_idx = 0
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    
    # Check if in clean ranges
    is_clean = any(start <= f_idx <= end for start, end in clean_ranges)
    if is_clean:
        crop = frame[:, 147:1132]
        # Match template in face search area
        search_area = crop[180:440, 360:620]
        res = cv2.matchTemplate(search_area, face_tmpl, cv2.TM_CCOEFF_NORMED)
        min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)
        
        # Center of match in crop coordinates
        match_x = 360 + max_loc[0] + 50
        match_y = 180 + max_loc[1] + 50
        
        # Center reference is (440+50=490, 260+50=310)
        dx = match_x - 490
        dy = match_y - 310
        dist = np.sqrt(dx*dx + dy*dy)
        
        # Compass angle in degrees from viewer's perspective:
        # 0 deg = UP (dx=0, dy < 0)
        # 90 deg = RIGHT (dx > 0, dy=0)
        # 180 deg = DOWN (dx=0, dy > 0)
        # 270 deg = LEFT (dx < 0, dy=0)
        # atan2(dx, -dy) gives 0 at UP, 90 at RIGHT, 180/-180 at DOWN, -90/270 at LEFT
        angle = (np.degrees(np.arctan2(dx, -dy))) % 360
        
        frame_data.append({
            'frame': f_idx,
            'dx': int(dx),
            'dy': int(dy),
            'dist': float(round(dist, 2)),
            'angle': float(round(angle, 1)),
            'score': float(round(max_val, 3))
        })
    f_idx += 1

cap.release()

print(f"Total clean frames analyzed: {len(frame_data)}")

# Find best frames near target compass angles:
# e.g. 16 sectors around 0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5
target_angles = [i * 22.5 for i in range(16)]
compass_names = [
    "UP (0°)", "NNE (22.5°)", "UP-RIGHT (45°)", "ENE (67.5°)",
    "RIGHT (90°)", "ESE (112.5°)", "DOWN-RIGHT (135°)", "SSE (157.5°)",
    "DOWN (180°)", "SSW (202.5°)", "DOWN-LEFT (225°)", "WSW (247.5°)",
    "LEFT (270°)", "WNW (292.5°)", "UP-LEFT (315°)", "NNW (337.5°)"
]

print("\n--- Target Angle Matches (min dist >= 10 to ensure noticeable head turn) ---")
for t_ang, name in zip(target_angles, compass_names):
    # Filter for frames with sufficient head deflection
    candidates = [f for f in frame_data if f['dist'] >= 10]
    if not candidates:
        continue
    def angular_diff(f):
        diff = abs(f['angle'] - t_ang)
        return min(diff, 360 - diff)
    candidates.sort(key=lambda f: (angular_diff(f), -f['dist']))
    top = candidates[:3]
    print(f"{name:18s}:")
    for c in top:
        diff = angular_diff(c)
        print(f"   Frame #{c['frame']:3d}: angle={c['angle']:5.1f}° (diff={diff:4.1f}°), dist={c['dist']:4.1f}px, dx={c['dx']:3d}, dy={c['dy']:3d}")

with open('tools/clean_frames_analysis.json', 'w') as f:
    json.dump(frame_data, f, indent=2)
