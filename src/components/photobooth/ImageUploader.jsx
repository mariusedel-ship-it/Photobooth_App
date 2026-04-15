import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ArrowLeft, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getFilterCSS } from './filterConfig';

const TOTAL_PHOTOS = 4;

export default function ImageUploader({ initialImages = [], selectedFrame, onComplete, onBack }) {
  const [images, setImages] = useState(initialImages);
  const fileInputRef = useRef(null);
  const replaceIndexRef = useRef(null);

  const applyFilterToImage = (imageDataUrl, filter) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        // Apply filter
        if (filter) {
          ctx.filter = getFilterCSS(filter);
        }
        ctx.drawImage(img, 0, 0);
        
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = imageDataUrl;
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const imageData = e.target.result;
          // Apply filter if frame is selected
          const filtered = await applyFilterToImage(imageData, selectedFrame?.filter);
          resolve(filtered);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(newImages => {
      if (replaceIndexRef.current !== null) {
        // Replace specific image
        setImages(prev => {
          const updated = [...prev];
          updated[replaceIndexRef.current] = newImages[0];
          return updated;
        });
        replaceIndexRef.current = null;
      } else {
        // Add new images
        setImages(prev => {
          const combined = [...prev, ...newImages];
          return combined.slice(0, TOTAL_PHOTOS);
        });
      }
    });

    // Reset input
    e.target.value = '';
  };

  const handleAddClick = (index = null) => {
    replaceIndexRef.current = index;
    fileInputRef.current?.click();
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const allImagesFilled = images.length === TOTAL_PHOTOS;

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
        
        <Button
          onClick={() => onComplete(images)}
          disabled={images.length === 0}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-full px-6 disabled:opacity-50"
        >
          {allImagesFilled ? 'Weiter' : `Weiter (${images.length}/${TOTAL_PHOTOS})`}
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: TOTAL_PHOTOS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i < images.length
                  ? "w-8 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                  : "w-2 bg-zinc-700"
              )}
            />
          ))}
        </div>
        <p className="text-center text-zinc-500 text-sm mt-2">
          {images.length} von {TOTAL_PHOTOS} Bildern hochgeladen
        </p>
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-6 pb-6"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Bilder hochladen
        </h2>
        <p className="text-zinc-400">
          Wähle {TOTAL_PHOTOS} Bilder für deinen Fotostreifen
        </p>
      </motion.div>

      {/* Image Grid */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {Array.from({ length: TOTAL_PHOTOS }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all duration-300",
                images[index] 
                  ? "border-violet-500 bg-zinc-900" 
                  : "border-dashed border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-900"
              )}
            >
              {images[index] ? (
                <>
                  <img 
                    src={images[index]} 
                    alt={`Bild ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-colors group flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleAddClick(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-white/20 hover:bg-white/30"
                    >
                      <Upload className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => removeImage(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-red-500/80 hover:bg-red-500"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Number badge */}
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => handleAddClick(null)}
                  className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <Plus className="w-8 h-8" />
                  <span className="text-sm">Bild {index + 1}</span>
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={replaceIndexRef.current === null}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Bottom info */}
      <div className="p-6 pb-10 text-center">
        {!allImagesFilled && (
          <Button
            onClick={() => handleAddClick(null)}
            variant="outline"
            size="lg"
            className="rounded-full px-8 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bilder auswählen
          </Button>
        )}
        
        {allImagesFilled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-green-500"
          >
            <Check className="w-5 h-5" />
            <span>Alle Bilder ausgewählt</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}