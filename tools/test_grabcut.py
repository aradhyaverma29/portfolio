import cv2
import numpy as np

img = cv2.imread('assets/frames/center.webp')
h, w = img.shape[:2]

# Bounding box of character: character is in center, background is around outer borders
# Rect: (x, y, w, h)
rect = (80, 50, w - 160, h - 50)

mask = np.zeros((h, w), np.uint8)
bgdModel = np.zeros((1, 65), np.float64)
fgdModel = np.zeros((1, 65), np.float64)

# Run grabCut with rectangle
cv2.grabCut(img, mask, rect, bgdModel, fgdModel, 5, cv2.GC_INIT_WITH_RECT)

# 0 = BGD, 1 = FGD, 2 = PR_BGD, 3 = PR_FGD
fg_mask = np.where((mask == 1) | (mask == 3), 255, 0).astype('uint8')

# Check corners: outer borders are definite background
fg_mask[:40, :] = 0
fg_mask[:, :60] = 0
fg_mask[:, -60:] = 0

# Feather mask edges slightly
blurred = cv2.GaussianBlur(fg_mask.astype(float)/255.0, (7, 7), 0)[:, :, None]

# Solid pure green background #00B140 (BGR: 0x40, 0xB1, 0x00 -> 64, 177, 0)
green_bg = np.zeros_like(img, dtype=float)
green_bg[:, :] = [0x40, 0xB1, 0x00]

composited = (img.astype(float) * blurred + green_bg * (1.0 - blurred)).astype(np.uint8)

# Resize to 1080p (1920x1080, centered)
# Currently 985x720 (aspect 1.368). Scale by 1.5 to 1478x1080, padded to 1920x1080
scaled_h = 1080
scaled_w = int(round(w * (scaled_h / h)))
resized_char = cv2.resize(composited, (scaled_w, scaled_h), interpolation=cv2.INTER_LANCZOS4)

canvas_1080p = np.zeros((1080, 1920, 3), dtype=np.uint8)
canvas_1080p[:, :] = [0x40, 0xB1, 0x00] # Pure green #00B140
x_offset = (1920 - scaled_w) // 2
canvas_1080p[:, x_offset:x_offset+scaled_w] = resized_char

cv2.imwrite('tools/reference_green_1080p.png', canvas_1080p)
cv2.imwrite('assets/reference_green.png', canvas_1080p)
print(f"Saved 1080p reference image to tools/reference_green_1080p.png and assets/reference_green.png")
