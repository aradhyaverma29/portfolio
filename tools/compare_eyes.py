import cv2
import numpy as np

f183 = cv2.imread('tools/eyes_check/face_183.jpg')
f374 = cv2.imread('tools/eyes_check/face_374.jpg')
f010 = cv2.imread('tools/eyes_check/face_010.jpg')

# Eye crops:
# In the 140x120 face patch (from 230:370, 430:550):
# y=260-230 = 30 to 70
# x=450-430 = 20 to 50 (left eye), 65 to 95 (right eye)
eye_l_183 = f183[35:65, 20:55]
eye_r_183 = f183[35:65, 65:100]

eye_l_374 = f374[35:65, 20:55]
eye_r_374 = f374[35:65, 65:100]

cv2.imwrite('tools/eyes_check/eye_l_183.jpg', eye_l_183)
cv2.imwrite('tools/eyes_check/eye_r_183.jpg', eye_r_183)
cv2.imwrite('tools/eyes_check/eye_l_374.jpg', eye_l_374)
cv2.imwrite('tools/eyes_check/eye_r_374.jpg', eye_r_374)

print("183 left eye mean:", np.mean(eye_l_183, axis=(0,1)), "right eye mean:", np.mean(eye_r_183, axis=(0,1)))
print("374 left eye mean:", np.mean(eye_l_374, axis=(0,1)), "right eye mean:", np.mean(eye_r_374, axis=(0,1)))
