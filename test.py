import cv2
import numpy as np
import glob

frameSize = (3840, 2160)

out = cv2.VideoWriter('output_video.mp4', cv2.VideoWriter_fourcc(*'MP4V'), 1, frameSize)

for filename in glob.glob('./output/*.jpg'):
    print(filename)
    img = cv2.imread(filename)
    cv2.imshow('image',img)  # display the image
    cv2.waitKey(500)  # wait for 500 ms
    out.write(img)

out.release()
cv2.destroyAllWindows()