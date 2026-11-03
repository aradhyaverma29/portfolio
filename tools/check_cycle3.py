import json

with open('tools/clean_frames_analysis.json') as f:
    data = json.load(f)

c3 = [x for x in data if 353 <= x['frame'] <= 386]
print(f"Cycle 3 frames (353..386): {len(c3)}")
for x in c3:
    print(f"F{x['frame']:03d}: dx={x['dx']:3d}, dy={x['dy']:3d}, dist={x['dist']:4.1f}, angle={x['angle']:5.1f}")
