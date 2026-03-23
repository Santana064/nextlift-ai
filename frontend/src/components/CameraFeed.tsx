import { useEffect, useRef } from 'react';

export default function CameraFeed({ onPoseData, isRecording }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const load = (src) =>
      new Promise((r) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = r;
        document.body.appendChild(s);
      });

    const init = async () => {
      await load('https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js');
      await load('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');

      const pose = new window.Pose({
        locateFile: (f) => "https://cdn.jsdelivr.net/npm/@mediapipe/pose/" + f
      });

      let stage = "down";
      let reps = 0;

      pose.onResults((res) => {
        if (!res.poseLandmarks || !isRecording) return;

        const lm = res.poseLandmarks;
        const shoulder = lm[11];
        const elbow = lm[13];
        const wrist = lm[15];

        const angle =
          Math.abs(
            Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x) -
            Math.atan2(shoulder.y - elbow.y, shoulder.x - elbow.x)
          ) * (180 / Math.PI);

        if (angle > 150) stage = "up";
        if (angle < 70 && stage === "up") {
          stage = "down";
          reps++;
        }

        onPoseData({
          reps,
          formScore: Math.min(100, angle),
          feedback: angle > 100 ? "Good rep" : "Extend more"
        });
      });

      const cam = new window.Camera(videoRef.current, {
        onFrame: async () => {
          await pose.send({ image: videoRef.current });
        },
      });

      cam.start();
    };

    init();
  }, [isRecording]);

  return <video ref={videoRef} autoPlay className="w-full rounded-xl" />;
}

