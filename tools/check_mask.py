import cv2
import numpy as np

img = cv2.imread('tools/key_test/orig_183.jpg')
keyed = cv2.imread('tools/key_test/keyed_183.jpg')

# Check center of character (face / chest)
face_region = img[200:350, 400:600]
hsv_face = cv2.cvtColor(face_region, cv2.COLOR_BGR2HSV)
mask1 = cv2.inRange(hsv_face, np.array([0, 120, 120]), np.array([12, 255, 255]))
mask2 = cv2.inRange(hsv_face, np.array([168, 120, 120]), np.array([180, 255, 255]))
face_keyed_pixels = np.count_nonzero(mask1 | mask2)
total_face_pixels = face_region.shape[0] * face_region.shape[1]

print(f"Face region red mask overlap: {face_keyed_pixels} / {total_face_pixels} ({face_keyed_pixels/total_face_pixels*100:.2f}%)")

# Check edge fringe: compare edge pixels
# Let's inspect hair and silhouette
print("Original shape:", img.shape)
print("Keyed shape:", keyed.shape)
