import json

with open('tools/clean_frames_analysis.json') as f:
    data = json.load(f)

# Safe frames: 0..110, 170..299, 360..386
safe = [x for x in data if (0 <= x['frame'] <= 110) or (170 <= x['frame'] <= 299) or (360 <= x['frame'] <= 386)]

print(f"Total safe frames: {len(safe)}")

for target_angle in range(0, 360, 20):
    def ang_diff(a, b):
        d = abs(a - b) % 360
        return min(d, 360 - d)

    # find frames within 25 degrees
    candidates = [x for x in safe if ang_diff(x['angle'], target_angle) <= 25 and x['dist'] >= 8]
    if candidates:
        candidates.sort(key=lambda x: ang_diff(x['angle'], target_angle))
        best = candidates[0]
        diff = ang_diff(best['angle'], target_angle)
        print(f"Target {target_angle:3d}° -> Frame #{best['frame']:3d}: angle={best['angle']:5.1f}° (diff={diff:4.1f}°), dist={best['dist']:4.1f}px")
    else:
        print(f"Target {target_angle:3d}° -> NO CANDIDATES")
