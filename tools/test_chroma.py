import cv2
import numpy as np
import os

video_path = 'assets/character.mp4.mp4'
cap = cv2.VideoCapture(video_path)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
print(f"Total frames: {total_frames}")

# Read sample frames
test_frame_indices = [34, 64, 108, 183, 207, 237, 261, 374]
frames = {}
f_idx = 0
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    if f_idx in test_frame_indices:
        # Crop black sidebars: x in [147, 1132]
        crop = frame[:, 147:1132]
        frames[f_idx] = crop
    f_idx += 1
cap.release()

os.makedirs('tools/key_test', exist_ok=True)

# Test keying out the red background
# Red is around BGR: (2, 7, 242)
target_bg_color = np.array([0x26, 0x14, 0x10], dtype=np.uint8) # #101426 in BGR is (0x26, 0x14, 0x10) -> (38, 20, 16)

for idx, img in frames.items():
    # Save original cropped
    cv2.imwrite(f'tools/key_test/orig_{idx}.jpg', img)

    # HSV conversion
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    # Red in HSV wraps around 0 and 180
    # Red hue is around 0-10 and 170-180, high saturation, high value
    mask1 = cv2.inRange(hsv, np.array([0, 120, 120]), np.array([12, 255, 255]))
    mask2 = cv2.inRange(hsv, np.array([168, 120, 120]), np.array([180, 255, 255]))
    red_mask = cv2.bitwise_or(mask1, mask2)

    # Clean mask: close small holes inside character if any
    # Character mask is inverse of red_mask
    char_mask = cv2.bitwise_not(red_mask)

    # Morphological clean up
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    # Fill small red noise inside character
    char_mask_cleaned = cv2.morphologyEx(char_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    # Slight feathering
    blurred_mask = cv2.GaussianBlur(char_mask_cleaned.astype(np.float32) / 255.0, (5, 5), 0)
    blurred_mask = np.clip(blurred_mask[:, :, None], 0.0, 1.0)

    # De-spill red on edges: where red is high and green/blue are lower
    b, g, r = cv2.split(img.astype(np.float32))
    # Excess red over max(g, b)
    max_gb = np.maximum(g, b)
    excess_r = np.maximum(0.0, r - max_gb)
    # Despill only near transition edges
    edge_zone = (blurred_mask > 0.05) & (blurred_mask < 0.95)
    r_despilled = r.copy()
    r_despilled[edge_zone[:, :, 0]] -= excess_r[edge_zone[:, :, 0]] * 0.7
    img_despilled = cv2.merge([b, g, r_despilled])

    # Composite onto #101426 background
    bg = np.zeros_like(img, dtype=np.float32)
    bg[:, :] = target_bg_color

    keyed = img_despilled * blurred_mask + bg * (1.0 - blurred_mask)
    keyed = np.clip(keyed, 0, 255).astype(np.uint8)

    cv2.imwrite(f'tools/key_test/keyed_{idx}.jpg', keyed)

print("Keying test finished. Saved to tools/key_test/")
