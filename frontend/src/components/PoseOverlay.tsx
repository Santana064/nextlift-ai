import React, { useRef, useEffect } from 'react';
import { Pose } from '@mediapipe/pose';

interface PoseOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isActive: boolean;
}

const PoseOverlay: React.FC<PoseOverlayProps> = ({ videoRef, canvasRef, isActive }) => {
  const poseRef = useRef<Pose | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      }
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    pose.onResults(onResults);
    poseRef.current = pose;

    return () => {
      pose.close();
    };
  }, [isActive]);

  const onResults = (results: any) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the pose landmarks
    if (results.poseLandmarks) {
      // Draw connections
      drawConnectors(ctx, results.poseLandmarks);
      // Draw landmarks
      drawLandmarks(ctx, results.poseLandmarks);
    }
    
    ctx.restore();
  };

  const drawConnectors = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    const connections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],  // Arms
      [11, 23], [12, 24], [23, 24],                        // Torso
      [23, 25], [25, 27], [24, 26], [26, 28]               // Legs
    ];

    ctx.strokeStyle = '#2DD4BF';
    ctx.lineWidth = 3;

    connections.forEach(([i, j]) => {
      if (landmarks[i] && landmarks[j]) {
        ctx.beginPath();
        ctx.moveTo(landmarks[i].x * ctx.canvas.width, landmarks[i].y * ctx.canvas.height);
        ctx.lineTo(landmarks[j].x * ctx.canvas.width, landmarks[j].y * ctx.canvas.height);
        ctx.stroke();
      }
    });
  };

  const drawLandmarks = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    ctx.fillStyle = '#3B82F6';
    
    landmarks.forEach(landmark => {
      if (landmark.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(
          landmark.x * ctx.canvas.width,
          landmark.y * ctx.canvas.height,
          5, 0, 2 * Math.PI
        );
        ctx.fill();
      }
    });
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ transform: 'scaleX(-1)' }}
    />
  );
};

export default PoseOverlay;