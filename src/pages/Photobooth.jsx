import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import HeroSection from '@/components/photobooth/HeroSection';
import FrameSelector from '@/components/photobooth/FrameSelector';
import CameraCapture from '@/components/photobooth/CameraCapture';
import ImageUploader from '@/components/photobooth/ImageUploader';
import PhotoResult from '@/components/photobooth/PhotoResult';

const STEPS = {
  HERO: 'hero',
  FRAMES: 'frames',
  CAMERA: 'camera',
  UPLOAD: 'upload',
  RESULT: 'result',
};

export default function Photobooth() {
  const [step, setStep] = useState(STEPS.HERO);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploadMode, setIsUploadMode] = useState(false);

  const handleStart = () => {
    setIsUploadMode(false);
    setStep(STEPS.FRAMES);
  };

  const handleUploadStart = () => {
    setIsUploadMode(true);
    setStep(STEPS.FRAMES);
  };

  const handleFrameSelect = (frame) => {
    setSelectedFrame(frame);
  };

  const handleContinueToCamera = () => {
    if (isUploadMode) {
      setStep(STEPS.UPLOAD);
    } else {
      setStep(STEPS.CAMERA);
    }
  };

  const handleCapture = (images) => {
    setCapturedImages(images);
    setStep(STEPS.RESULT);
  };

  const handleRestart = () => {
    setSelectedFrame(null);
    setCapturedImages([]);
    setUploadedImages([]);
    setIsUploadMode(false);
    setStep(STEPS.HERO);
  };

  const handleBackToFrames = () => {
    setStep(STEPS.FRAMES);
  };

  const handleBackToCamera = () => {
    setCapturedImages([]);
    setUploadedImages([]);
    if (isUploadMode) {
      setStep(STEPS.UPLOAD);
    } else {
      setStep(STEPS.CAMERA);
    }
  };

  const handleUploadComplete = (images) => {
    setCapturedImages(images);
    setStep(STEPS.RESULT);
  };

  const handleBackToHero = () => {
    setSelectedFrame(null);
    setUploadedImages([]);
    setIsUploadMode(false);
    setStep(STEPS.HERO);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <AnimatePresence mode="wait">
        {step === STEPS.HERO && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <HeroSection onStart={handleStart} onUpload={handleUploadStart} />
          </motion.div>
        )}

        {step === STEPS.FRAMES && (
          <motion.div
            key="frames"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <FrameSelector
              selectedFrame={selectedFrame}
              onSelect={handleFrameSelect}
              onBack={handleBackToHero}
              onContinue={handleContinueToCamera}
            />
          </motion.div>
        )}

        {step === STEPS.CAMERA && (
          <motion.div
            key="camera"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <CameraCapture
              selectedFrame={selectedFrame}
              onCapture={handleCapture}
              onBack={handleBackToFrames}
            />
          </motion.div>
        )}

        {step === STEPS.UPLOAD && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ImageUploader
              initialImages={uploadedImages}
              selectedFrame={selectedFrame}
              onComplete={handleUploadComplete}
              onBack={handleBackToFrames}
            />
          </motion.div>
        )}

        {step === STEPS.RESULT && (
          <motion.div
            key="result"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <PhotoResult
              capturedImages={capturedImages}
              selectedFrame={selectedFrame}
              onRestart={handleRestart}
              onBack={handleBackToCamera}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}