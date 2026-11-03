import cv2
import numpy as np
import json
import os

# Replacements found:
# pose_02 (UP-RIGHT 45°)   -> F50  (52.4°) — EYES OPEN
# pose_03 (ENE 67.7°)      -> F56  (56.0°) — EYES OPEN (best we can do, 67° range has all eyes closed)
# pose_04 (RIGHT 94.4°)    -> F68  (121.0°) — EYES OPEN (90° range fully blinks)
# pose_05 (ESE 116.6°)     -> F68  (121.0°) — EYES OPEN (same best frame, merge with pose_04)
# Since F68 covers both 90° and 116°, remove ESE and use one pose for that range.

with open('assets/frames/poses.json') as f:
    data = json.load(f)

cap = cv2.VideoCapture('tools/source/character.mp4')

out_dir = 'assets/frames'

def save_webp(frame_num, out_path, cap):
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
    ret, frame = cap.read()
    crop = frame[:, 147:1132]
    cv2.imwrite(out_path, crop, [cv2.IMWRITE_WEBP_QUALITY, 85])
    size = os.path.getsize(out_path)
    print(f"  Saved {os.path.basename(out_path)}: F{frame_num}, {size/1024:.1f} KB")
    return size

print("=== REPLACING BLINK-AFFECTED POSES ===")

# New pose definitions — removing the bad ones and replacing with open-eye frames
new_poses = [
    {'id': 0,  'file': 'pose_00.webp', 'angle': 1.4,   'label': 'UP',         'sourceFrame': 22},
    {'id': 1,  'file': 'pose_01.webp', 'angle': 24.3,  'label': 'NNE',        'sourceFrame': 43},
    # pose_02 was F46 (45° blink) -> replace with F50 (52.4°, eyes open)
    {'id': 2,  'file': 'pose_02.webp', 'angle': 52.4,  'label': 'UP-RIGHT',   'sourceFrame': 50},
    # pose_03 was F62 (67.7° blink) -> replace with F56 (56.0°, eyes open)
    # pose_04 was F65 (94.4° blink) -> replace with F68 (121.0°, eyes open)
    # pose_05 was F67 (116.6° blink) -> merged into F68 (121.0°)
    # So we go from UP-RIGHT straight to DOWN-RIGHT range with F68 as the bridge
    {'id': 3,  'file': 'pose_03.webp', 'angle': 121.0, 'label': 'ESE-DR',     'sourceFrame': 68},
    {'id': 4,  'file': 'pose_06.webp', 'angle': 135.0, 'label': 'DOWN-RIGHT', 'sourceFrame': 72},
    {'id': 5,  'file': 'pose_07.webp', 'angle': 156.6, 'label': 'SSE',        'sourceFrame': 103},
    {'id': 6,  'file': 'pose_08.webp', 'angle': 182.3, 'label': 'DOWN',       'sourceFrame': 107},
    {'id': 7,  'file': 'pose_09.webp', 'angle': 205.8, 'label': 'SSW',        'sourceFrame': 110},
    {'id': 8,  'file': 'pose_10.webp', 'angle': 213.2, 'label': 'DOWN-LEFT',  'sourceFrame': 111},
    {'id': 9,  'file': 'pose_11.webp', 'angle': 270.0, 'label': 'LEFT',       'sourceFrame': 204},
    {'id': 10, 'file': 'pose_12.webp', 'angle': 282.1, 'label': 'WNW',        'sourceFrame': 207},
    {'id': 11, 'file': 'pose_13.webp', 'angle': 298.3, 'label': 'UP-LEFT-1',  'sourceFrame': 208},
    {'id': 12, 'file': 'pose_14.webp', 'angle': 309.8, 'label': 'UP-LEFT-2',  'sourceFrame': 209},
    {'id': 13, 'file': 'pose_15.webp', 'angle': 324.5, 'label': 'UP-LEFT-3',  'sourceFrame': 210},
    {'id': 14, 'file': 'pose_16.webp', 'angle': 348.3, 'label': 'NNW',        'sourceFrame': 211},
    {'id': 15, 'file': 'pose_17.webp', 'angle': 356.9, 'label': 'NNW-UP',     'sourceFrame': 213},
]

# Files to keep as-is (sourced from same frame): pose_00, pose_01, pose_06..17
# Files to overwrite: pose_02 (new F50), pose_03 (new F68)
# Files to become new pose files: pose_04..05 are removed, renumber accordingly

# Map from new id -> old file to use (reuse or regenerate):
overwrite_map = {
    2: 50,   # pose_02 -> F50
    3: 68,   # pose_03 -> F68
    4: 72,   # pose_06 renumbered to pose_04 -- but file name is still pose_06.webp so no change needed
}

# The trick: in new_poses, for IDs >= 4 the 'file' already points to the OLD file names (pose_06.webp, etc.)
# We just need to overwrite pose_02 and pose_03, and update poses.json.

for pose_id, frame_num in overwrite_map.items():
    # Find the new pose entry with this id
    entry = next((p for p in new_poses if p['id'] == pose_id), None)
    if entry:
        path = os.path.join(out_dir, entry['file'])
        save_webp(frame_num, path, cap)

cap.release()

# Write updated poses.json
new_data = dict(data)
new_data['poses'] = new_poses

with open('assets/frames/poses.json', 'w', encoding='utf-8') as f:
    json.dump(new_data, f, indent=2)

print("\nUpdated assets/frames/poses.json with 16 open-eye poses")
print("Poses removed: original pose_02 (F46 blink), pose_03 (F62 blink), pose_04 (F65 blink), pose_05 (F67 blink)")
print("Replacements: pose_02 -> F50 (52.4deg), pose_03 -> F68 (121.0deg)")
print("Merged 90-116 deg range into single F68 pose at 121 deg (nearest open-eye frame)")
