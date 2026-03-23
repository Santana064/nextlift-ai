import { useState, useRef, useEffect } from 'react';

interface UseCameraReturn {
  cameraPermission: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  isCameraReady: boolean;
}

export const useCamera = (): UseCameraReturn => {
  const [cameraPermission, setCameraPermission] = useState<string>('prompt');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);
      }
      
      setCameraPermission('granted');
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraPermission('denied');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraReady(false);
    setCameraPermission('prompt');
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return {
    cameraPermission,
    videoRef,
    startCamera,
    stopCamera,
    isCameraReady
  };
};
