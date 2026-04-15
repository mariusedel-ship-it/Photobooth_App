import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RotateCcw, ArrowLeft, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import FilmGrainOverlay from './FilmGrainOverlay';
import { getFilterCSS, FILM_GRAIN_FILTERS } from './filterConfig';

const TOTAL_PHOTOS = 4;

export default function CameraCapture({ selectedFrame, onCapture, onBack }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [countdown, setCountdown] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [facingMode, setFacingMode] = useState('user');
  const [error, setError] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(true);

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async (mode) => {
    setIsLoading(true);
    setError(null);
    setCameraReady(false);
    
    // Stop existing stream first
    stopCamera();

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: mode,
          width: { ideal: 960 },
          height: { ideal: 1280 },
        },
        audio: false,
      });
      
      streamRef.current = mediaStream;
      
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = mediaStream;
        
        // Wait for loadedmetadata then play
        video.onloadedmetadata = async () => {
          try {
            await video.play();
            setCameraReady(true);
            setIsLoading(false);
            startPreviewLoop();
          } catch (playError) {
            console.error('Play error:', playError);
            // Try again without await
            video.play();
            setCameraReady(true);
            setIsLoading(false);
            startPreviewLoop();
          }
        };
        
        // Also try to play directly as fallback
        video.load();
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Kamerazugriff wurde verweigert. Bitte erlaube den Zugriff in deinen Browser-Einstellungen.');
      } else if (err.name === 'NotFoundError') {
        setError('Keine Kamera gefunden. Bitte schließe eine Kamera an.');
      } else {
        setError('Kamera konnte nicht gestartet werden. Bitte erlaube den Kamerazugriff.');
      }
      setIsLoading(false);
    }
  }, [stopCamera]);



  const startPreviewLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = previewCanvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');

    const drawFrame = () => {
      if (!video.videoWidth || !video.videoHeight) {
        animationFrameRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.setTransform(1, 0, 0, 1, 0, 0);

      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      // Apply CSS filter via canvas filter API
      if (selectedFrame?.filter) {
        ctx.filter = getFilterCSS(selectedFrame.filter);
      } else {
        ctx.filter = 'none';
      }

      ctx.drawImage(video, 0, 0);

      // Reset filter for overlays
      ctx.filter = 'none';

      if (selectedFrame?.filter) {
        if (selectedFrame.filter === 'vintage-polaroid') {
          // Vignette
          const vignetteGradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, canvas.width * 0.2,
            canvas.width / 2, canvas.height / 2, canvas.width * 0.8
          );
          vignetteGradient.addColorStop(0, 'rgba(0,0,0,0)');
          vignetteGradient.addColorStop(1, 'rgba(0,0,0,0.51)');
          ctx.fillStyle = vignetteGradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        else if (selectedFrame.filter === 'dark-soul') {
          const vignetteGradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
            canvas.width / 2, canvas.height / 2, canvas.width * 0.7
          );
          vignetteGradient.addColorStop(0, 'rgba(0,0,0,0)');
          vignetteGradient.addColorStop(1, 'rgba(0,0,0,0.19)');
          ctx.fillStyle = vignetteGradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();
  }, [facingMode, selectedFrame, getFilterCSS]);

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      stopCamera();
    };
  }, []);

  const switchCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  const capturePhoto = () => {
    if (!previewCanvasRef.current || !cameraReady) return null;

    const previewCanvas = previewCanvasRef.current;

    if (previewCanvas.width === 0 || previewCanvas.height === 0) {
      console.error('Canvas has no dimensions');
      return null;
    }

    // Create a new canvas to add film grain if needed
    const filmGrainFilters = ['vintage-polaroid', 'old-money', 'bw-filter', 'dark-soul'];
    const needsFilmGrain = filmGrainFilters.includes(selectedFrame?.filter);

    if (needsFilmGrain) {
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = previewCanvas.width;
      finalCanvas.height = previewCanvas.height;
      const ctx = finalCanvas.getContext('2d');

      // Draw the filtered image
      ctx.drawImage(previewCanvas, 0, 0);

      // Generate film grain exactly like FilmGrainOverlay does
      const grainCanvas = document.createElement('canvas');
      grainCanvas.width = finalCanvas.width;
      grainCanvas.height = finalCanvas.height;
      const grainCtx = grainCanvas.getContext('2d');

      // Base grain layer
      for (let i = 0; i < 3000; i++) {
        const x = Math.random() * grainCanvas.width;
        const y = Math.random() * grainCanvas.height;
        const opacity = Math.random() * 0.5;
        const size = Math.random() * 1.5;

        grainCtx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        grainCtx.fillRect(x, y, size, size);
      }

      // Dark grain
      for (let i = 0; i < 2000; i++) {
        const x = Math.random() * grainCanvas.width;
        const y = Math.random() * grainCanvas.height;
        const opacity = Math.random() * 0.3;
        const size = Math.random() * 1.5;

        grainCtx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        grainCtx.fillRect(x, y, size, size);
      }

      // Dust spots
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * grainCanvas.width;
        const y = Math.random() * grainCanvas.height;
        const radius = Math.random() * 3 + 1;
        const opacity = Math.random() * 0.4;

        grainCtx.beginPath();
        grainCtx.arc(x, y, radius, 0, Math.PI * 2);
        grainCtx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        grainCtx.fill();
      }

      // Scratches
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * grainCanvas.width;
        const y = Math.random() * grainCanvas.height;
        const length = Math.random() * 100 + 50;
        const angle = Math.random() * Math.PI * 2;
        const opacity = Math.random() * 0.3;

        grainCtx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        grainCtx.lineWidth = Math.random() * 0.5 + 0.3;
        grainCtx.beginPath();
        grainCtx.moveTo(x, y);
        grainCtx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        grainCtx.stroke();
      }

      // Apply grain overlay
      ctx.globalAlpha = 0.6;
      ctx.drawImage(grainCanvas, 0, 0);
      ctx.globalAlpha = 1;

      return finalCanvas.toDataURL('image/jpeg', 0.9);
    }

    return previewCanvas.toDataURL('image/jpeg', 0.9);
  };

  const startPhotoSequence = async () => {
    setIsCapturing(true);
    const images = [];
    
    for (let i = 0; i < TOTAL_PHOTOS; i++) {
      // Countdown
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setCountdown(null);
      
      // Flash effect
      if (flashEnabled) {
        setShowFlash(true);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Capture
      const imageData = capturePhoto();
      if (imageData) {
        images.push(imageData);
        setCapturedImages(images);
      }
      
      setShowFlash(false);
      
      // Small pause between photos
      if (i < TOTAL_PHOTOS - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    setIsCapturing(false);
    
    // Automatically proceed to result
    if (images.length === TOTAL_PHOTOS) {
      await new Promise(resolve => setTimeout(resolve, 500));
      onCapture(images);
    }
  };

  const retakePhotos = () => {
    setCapturedImages([]);
  };

  const confirmPhotos = () => {
    onCapture(capturedImages);
  };

  const removePhoto = (index) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  const retakeSinglePhoto = async (index) => {
    // Countdown for single photo
    for (let c = 3; c > 0; c--) {
      setCountdown(c);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setCountdown(null);
    
    // Flash effect
    if (flashEnabled) {
      setShowFlash(true);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    const imageData = capturePhoto();
    if (imageData) {
      setCapturedImages(prev => {
        const newImages = [...prev];
        newImages[index] = imageData;
        return newImages;
      });
    }
    
    setShowFlash(false);
  };

  const allPhotosTaken = capturedImages.length === TOTAL_PHOTOS;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-zinc-400 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Frames
        </Button>
        
        <div className="flex items-center gap-4">
          {!allPhotosTaken && !error && (
            <>
              <div className="flex items-center gap-2">
                <Switch
                  checked={flashEnabled}
                  onCheckedChange={setFlashEnabled}
                  disabled={isCapturing}
                />
                <span className="text-zinc-400 text-sm">Blitz</span>
              </div>
              <Button
                variant="ghost"
                onClick={switchCamera}
                disabled={isCapturing}
                className="text-zinc-400 hover:text-white hover:bg-white/5"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Kamera wechseln
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: TOTAL_PHOTOS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i < capturedImages.length
                  ? "w-8 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                  : "w-2 bg-zinc-700"
              )}
            />
          ))}
        </div>
        <p className="text-center text-zinc-500 text-sm mt-2">
          Foto {Math.min(capturedImages.length + 1, TOTAL_PHOTOS)} von {TOTAL_PHOTOS}
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 p-4">
        {/* Camera View */}
        <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 group">
          {error ? (
            <div className="w-full h-full flex items-center justify-center p-6 text-center">
              <div>
                <Camera className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">{error}</p>
                <Button
                  onClick={() => startCamera(facingMode)}
                  className="mt-4 bg-violet-600 hover:bg-violet-500 rounded-full"
                >
                  Erneut versuchen
                </Button>
              </div>
            </div>
          ) : null}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ display: 'none' }}
            className="w-full h-full object-cover"
          />

          <canvas
            ref={previewCanvasRef}
            style={{ display: isLoading || error ? 'none' : 'block' }}
            className="w-full h-full object-cover"
          />

          {/* Film Grain Overlay */}
          {!isLoading && !error && selectedFrame?.filter && FILM_GRAIN_FILTERS.includes(selectedFrame.filter) && (
            <FilmGrainOverlay 
              enabled={1}
              width={videoRef.current?.videoWidth}
              height={videoRef.current?.videoHeight}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
          )}

          {/* Countdown Overlay */}
          <AnimatePresence>
            {countdown && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/50"
              >
                <motion.span
                  key={countdown}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  className="text-8xl font-bold text-white"
                >
                  {countdown}
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Flash Effect */}
          <AnimatePresence>
            {showFlash && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.05 }}
                className="absolute inset-0 z-30 bg-white pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Camera Button Overlay */}
          {!allPhotosTaken && !error && !isCapturing && (
            <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={startPhotoSequence}
                disabled={isLoading || !!error || isCapturing || !cameraReady}
                className="w-20 h-20 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
                  {isCapturing ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                </div>
              </motion.button>
            </div>
          )}
        </div>

        {/* Photo Strip Preview */}
        <div className="flex flex-row lg:flex-col gap-2">
          {Array.from({ length: TOTAL_PHOTOS }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: capturedImages[index] ? 1 : 0.3, 
                scale: 1 
              }}
              className={cn(
                "relative w-12 h-16 lg:w-18 lg:h-24 rounded-lg overflow-hidden bg-zinc-800 border-2",
                capturedImages[index] ? "border-violet-500" : "border-zinc-700"
              )}
            >
              {capturedImages[index] ? (
                <>
                  <img 
                    src={capturedImages[index]} 
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {allPhotosTaken && (
                    <button
                      onClick={() => retakeSinglePhoto(index)}
                      className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <RotateCcw className="w-4 h-4 text-white" />
                    </button>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-zinc-600 text-xs">{index + 1}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}