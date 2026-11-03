import cv2
import numpy as np

# Let's inspect center.webp directly
center_img = cv2.imread('assets/frames/center.webp')
# Crop face
center_face = center_img[230:370, 430:550]
cv2.imwrite('tools/eyes_check/current_center_face.jpg', center_face)

# Let's inspect frame 374 face
cap = cv2.VideoCapture('tools/source/character.mp4')
cap.set(cv2.CAP_PROP_POS_FRAMES, 374)
ret, f374 = cap.read()
crop374 = f374[:, 147:1132]
cv2.imwrite('tools/eyes_check/f374_face.jpg', crop374[230:370, 430:550])

# Let's check frames 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 175, 180, 183, 185, 204, 210, 370, 374, 380
for f in [0, 10, 20, 30, 70, 107, 180, 183, 204, 208, 211, 372, 374, 378]:
    cap.set(cv2.CAP_PROP_POS_FRAMES, f)
    ret, fr = cap.read()
    c = fr[:, 147:1132]
    cv2.imwrite(f'tools/eyes_check/face_{f:03d}.jpg', c[230:370, 430:550])

cap.release()
print("Saved sample faces.")
