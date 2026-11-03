import cv2
import numpy as np

img = cv2.imread('assets/frames/center.webp')
h, w = img.shape[:2]

# Scale to 1080 height
scaled_h = 1080
scaled_w = int(round(w * (scaled_h / h)))
resized = cv2.resize(img, (scaled_w, scaled_h), interpolation=cv2.INTER_LANCZOS4)

# Place on 1920x1080 canvas with matching red background
canvas_1080p = np.zeros((1080, 1920, 3), dtype=np.uint8)
canvas_1080p[:, :] = [1, 6, 242] # Matching red background BGR
x_offset = (1920 - scaled_w) // 2
canvas_1080p[:, x_offset:x_offset+scaled_w] = resized

cv2.imwrite('assets/reference_original.png', canvas_1080p)
print("Saved 1080p original reference to assets/reference_original.png")
