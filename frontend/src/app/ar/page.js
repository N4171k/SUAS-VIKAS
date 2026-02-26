'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiCamera, FiAlertCircle } from 'react-icons/fi';

export default function ARPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-8 text-center"><div className="animate-pulse">Loading AR...</div></div>}>
      <ARContent />
    </Suspense>
  );
}

function ARContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      const video = document.getElementById('ar-video');
      if (video) {
        video.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions in your browser.');
    }
  };

  const stopCamera = () => {
    const video = document.getElementById('ar-video');
    if (video?.srcObject) {
      video.srcObject.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">AR Try-On</h1>
      <p className="text-gray-500 mb-6">Try products virtually using your camera with Mediapipe face tracking.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <FiAlertCircle /> {error}
        </div>
      )}

      <div className="bg-black rounded-2xl overflow-hidden relative aspect-video mb-6">
        {cameraActive ? (
          <video id="ar-video" autoPlay playsInline muted className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white">
            <FiCamera className="w-16 h-16 mb-4 text-gray-400" />
            <p className="text-gray-400 mb-4">Camera preview will appear here</p>
            <button onClick={startCamera}
              className="bg-vikas-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition">
              Start Camera
            </button>
          </div>
        )}
        {cameraActive && (
          <div className="absolute top-4 right-4 flex gap-2">
            <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> LIVE
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {cameraActive && (
          <button onClick={stopCamera}
            className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition">
            Stop Camera
          </button>
        )}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-vikas-blue mb-2">How AR Try-On Works</h3>
        <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
          <li>Select a product (sunglasses, jewelry, accessories)</li>
          <li>Allow camera access when prompted</li>
          <li>Mediapipe tracks your face in real-time</li>
          <li>The product is overlaid on the live video feed</li>
          <li>Move and turn your head to see from different angles</li>
        </ol>
        <p className="text-xs text-gray-500 mt-3">Note: Full AR rendering requires Mediapipe WASM module. This preview demonstrates camera integration.</p>
      </div>
    </div>
  );
}
