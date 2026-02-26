'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { FiCamera, FiX, FiRefreshCw } from 'react-icons/fi';

export default function ARView({ product, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const [facingMode, setFacingMode] = useState('user');
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setStreaming(true);
        setError('');
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreaming(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const flipCamera = () => {
    stopCamera();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  useEffect(() => {
    if (facingMode) startCamera();
  }, [facingMode, startCamera]);

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    // Draw product overlay (simplified)
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = product?.image_url || `https://picsum.photos/seed/${product?.id || 1}/300/300`;
    img.onload = () => {
      ctx.globalAlpha = 0.7;
      const w = canvas.width * 0.3;
      const h = (img.height / img.width) * w;
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      ctx.globalAlpha = 1.0;
    };
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={onClose} className="p-2 bg-white/20 backdrop-blur rounded-full text-white">
          <FiX className="w-5 h-5" />
        </button>
        <div className="text-white text-center">
          <p className="text-sm font-semibold">AR Try-On</p>
          <p className="text-xs opacity-70">{product?.title || 'Product'}</p>
        </div>
        <button onClick={flipCamera} className="p-2 bg-white/20 backdrop-blur rounded-full text-white">
          <FiRefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        {error ? (
          <div className="h-full flex items-center justify-center text-white text-center p-8">
            <div>
              <FiCamera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Camera Unavailable</p>
              <p className="text-sm opacity-70 mb-4">{error}</p>
              <button onClick={startCamera} className="bg-vikas-blue px-6 py-2 rounded-lg text-sm">
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />
            {streaming && product && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img
                  src={product.image_url || `https://picsum.photos/seed/${product.id}/300/300`}
                  alt="AR overlay"
                  className="w-1/3 opacity-60 animate-pulse-slow"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(255,107,53,0.6))' }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-center gap-6">
          <button onClick={captureFrame} className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl">
            <FiCamera className="w-7 h-7 text-gray-800" />
          </button>
        </div>
        <p className="text-white/60 text-xs text-center mt-3">
          Point your camera and see how the product looks
        </p>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
