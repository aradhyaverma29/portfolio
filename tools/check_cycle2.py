import json

with open('tools/clean_frames_analysis.json') as f:
    data = json.load(f)

c2 = [x for x in data if 170 <= x['frame'] <= 220]
print(f"Cycle 2 frames (170..220): {len(c2)}")
for x in c2:
    print(f"F{x['frame']:03d}: dx={x['dx']:3d}, dy={x['dy']:3d}, dist={x['dist']:4.1f}, angle={x['angle']:5.1f}")
