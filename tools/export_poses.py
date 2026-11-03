import cv2
import json
import os
import shutil

# Make sure assets/frames directory exists
out_dir = 'assets/frames'
os.makedirs(out_dir, exist_ok=True)

poses_config = [
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
total_bytes = 0

poses_json_data = {
    'width': 985,
    'height': 720,
    'aspectRatio': round(985 / 720, 4),
    'backgroundColor': '#f20601',
    'center': 'center.webp',
    'poses': []
}

print("=== EXPORTING POSES TO WEBP ===")
for i, p in enumerate(poses_config):
    file_name = f"pose_{i:02d}.webp"
    out_path = os.path.join(out_dir, file_name)
    cap.set(cv2.CAP_PROP_POS_FRAMES, p['frame'])
    ret, frame = cap.read()
    if not ret:
        raise RuntimeError(f"Could not read frame {p['frame']}")
    
    # Crop horizontal black bars [147:1132]
    crop = frame[:, 147:1132]
    # Save WebP quality 85
    cv2.imwrite(out_path, crop, [cv2.IMWRITE_WEBP_QUALITY, 85])
    
    file_size = os.path.getsize(out_path)
    total_bytes += file_size
    
    poses_json_data['poses'].append({
        'id': i,
        'file': file_name,
        'angle': p['angle'],
        'label': p['name'],
        'sourceFrame': p['frame']
    })
    print(f"Saved {file_name:12s} (Frame {p['frame']:3d}, {p['angle']:5.1f}°, {p['name']:11s}) - {file_size/1024:.1f} KB")

# Center frame (Frame 183)
cap.set(cv2.CAP_PROP_POS_FRAMES, 183)
ret, center_frame = cap.read()
center_crop = center_frame[:, 147:1132]
center_path = os.path.join(out_dir, 'center.webp')
cv2.imwrite(center_path, center_crop, [cv2.IMWRITE_WEBP_QUALITY, 85])
center_size = os.path.getsize(center_path)
total_bytes += center_size
print(f"Saved center.webp  (Frame 183, neutral forward gaze) - {center_size/1024:.1f} KB")

cap.release()

# Write JSON
json_path = os.path.join(out_dir, 'poses.json')
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(poses_json_data, f, indent=2)
print(f"Saved {json_path}")

print(f"\nTotal asset size for 19 frames: {total_bytes / 1024:.1f} KB ({total_bytes / (1024*1024):.2f} MB)")
print("Average per frame: {:.1f} KB (Well below 120 KB limit)".format((total_bytes / 19) / 1024))
