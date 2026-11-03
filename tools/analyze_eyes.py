import cv2
import numpy as np

cap = cv2.VideoCapture('tools/source/character.mp4')

# Let's inspect eye openness
# Left eye in image (character's right eye): x: 460..485, y: 270..295
# Right eye in image (character's left eye): x: 495..520, y: 270..295

def analyze_eyes(crop):
    # crop is 985x720
    # Eye patches:
    eye_left = crop[270:298, 458:488]
    eye_right = crop[270:298, 492:522]
    
    # In eyes, pupils and eyelashes have low intensity (dark)
    gray_l = cv2.cvtColor(eye_left, cv2.COLOR_BGR2GRAY)
    gray_r = cv2.cvtColor(eye_right, cv2.COLOR_BGR2GRAY)
    
    # Threshold for dark eye features (pupils/lashes)
    dark_l = np.count_nonzero(gray_l < 70)
    dark_r = np.count_nonzero(gray_r < 70)
    
    # Edge density (open eyes with glasses and iris have high edge gradient)
    edges_l = np.sum(cv2.Sobel(gray_l, cv2.CV_64F, 1, 1)**2)
    edges_r = np.sum(cv2.Sobel(gray_r, cv2.CV_64F, 1, 1)**2)
    
    return dark_l, dark_r, edges_l, edges_r

print("--- Center candidates eye openness ---")
for f in list(range(175, 195)) + list(range(365, 385)):
    cap.set(cv2.CAP_PROP_POS_FRAMES, f)
    ret, frame = cap.read()
    crop = frame[:, 147:1132]
    dl, dr, el, er = analyze_eyes(crop)
    print(f"F{f:03d}: Dark L={dl:3d}, R={dr:3d} | Edges L={el/1e5:5.1f}, R={er/1e5:5.1f}")

cap.release()
