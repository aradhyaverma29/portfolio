import cv2
import numpy as np

img = cv2.imread('assets/character_green_generated.jpg')
h, w = img.shape[:2]

# Scale to fit within 1080 height
scaled_h = 1080
scaled_w = int(round(w * (scaled_h / h)))
resized = cv2.resize(img, (scaled_w, scaled_h), interpolation=cv2.INTER_LANCZOS4)

# Create 1920x1080 canvas with #00B140 (BGR: 0x40, 0xB1, 0x00 -> 64, 177, 0)
canvas = np.zeros((1080, 1920, 3), dtype=np.uint8)
canvas[:, :] = [64, 177, 0]

x_offset = (1920 - scaled_w) // 2
canvas[:, x_offset:x_offset+scaled_w] = resized

cv2.imwrite('assets/character_green_1080p.png', canvas)
print("Saved 1080p green reference to assets/character_green_1080p.png")
