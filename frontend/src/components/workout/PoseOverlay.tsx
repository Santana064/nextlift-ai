import React, { useEffect, useRef } from 'react';

interface PoseOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isActive: boolean;
}

const PoseOverlay: React.FC<PoseOverlayProps> = ({ videoRef, canvasRef, isActive }) => {
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isActive || !videoRef.current || !canvasRef.current) return;

    const drawSkeleton = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (!canvas || !video || video.readyState < 2) {
        animationRef.current = requestAnimationFrame(drawSkeleton);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Clear previous drawings
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw a simple skeleton overlay (simplified for demo)
      // In a real app, this would use actual pose detection data
      
      // Draw some example pose lines
      ctx.strokeStyle = '#2DD4BF';
      ctx.lineWidth = 3;
      
      // Example: draw a simple stick figure
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Head
      ctx.beginPath();
      ctx.arc(centerX, centerY - 50, 20, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Body
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 30);
      ctx.lineTo(centerX, centerY + 50);
      ctx.stroke();
      
      // Arms
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 10);
      ctx.lineTo(centerX - 30, centerY + 10);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 10);
      ctx.lineTo(centerX + 30, centerY + 10);
      ctx.stroke();
      
      // Legs
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + 50);
      ctx.lineTo(centerX - 30, centerY + 90);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + 50);
      ctx.lineTo(centerX + 30, centerY + 90);
      ctx.stroke();

      // Continue animation
      animationRef.current = requestAnimationFrame(drawSkeleton);
    };

    animationRef.current = requestAnimationFrame(drawSkeleton);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, videoRef, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ transform: 'scaleX(-1)' }}
    />
  );
};

export default PoseOverlay;
