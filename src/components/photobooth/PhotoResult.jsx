import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Mail, RotateCcw, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function PhotoResult({ capturedImages, selectedFrame, onRestart, onBack }) {
  const canvasRef = useRef(null);
  const [finalImage, setFinalImage] = useState(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [customText, setCustomText] = useState('Polaroid.io');
  const [customDate, setCustomDate] = useState(() => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
  });
  const [currentFrame, setCurrentFrame] = useState(selectedFrame);

  const frameStyles = [
    { id: 'vintage-polaroid', name: 'Vintage', colors: ['#fefce8', '#fef3c7'], textColor: '#18181b' },
    { id: 'old-money', name: 'Old Money', colors: ['#78350f', '#57534e'], textColor: '#ffffff' },
    { id: 'bw-filter', name: 'Schwarz/Weiß', colors: ['#d4d4d8', '#71717a'], textColor: '#ffffff' },
    { id: 'dark-soul', name: 'Dark', colors: ['#18181b', '#000000'], textColor: '#ffffff' },
    { id: 'minimal-white', name: 'Weiß', colors: ['#ffffff', '#ffffff'], textColor: '#18181b' },
    { id: 'elegant-gold', name: 'Gold', colors: ['#fcd34d', '#f59e0b'], textColor: '#18181b' },
    { id: 'party-neon', name: 'Neon', colors: ['#8b5cf6', '#d946ef'], textColor: '#ffffff' },
    { id: 'corporate-blue', name: 'Blau', colors: ['#2563eb', '#06b6d4'], textColor: '#ffffff' },
    { id: 'vintage-sepia', name: 'Sepia', colors: ['#fef3c7', '#fed7aa'], textColor: '#18181b' },
    { id: 'nature-green', name: 'Grün', colors: ['#34d399', '#14b8a6'], textColor: '#ffffff' },
  ];

  useEffect(() => {
    if (capturedImages && capturedImages.length === 4) {
      generateFinalImage();
    }
  }, [capturedImages, currentFrame]);

  // Debounced update for text changes
  useEffect(() => {
    if (capturedImages && capturedImages.length === 4) {
      const timer = setTimeout(() => {
        generateFinalImage();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [customText, customDate]);

  const generateFinalImage = async () => {
      setIsGenerating(true);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');

      // Photo strip dimensions
      const frameWidth = 700;
      const photoPadding = 20;
      const photoGap = 15;
      const photoWidth = frameWidth - (photoPadding * 2);
      const photoHeight = photoWidth * (4/3); // 3:4 aspect ratio (portrait)
      const frameHeight = (photoPadding * 2) + (photoHeight * 4) + (photoGap * 3) + 80; // Extra space for branding

      canvas.width = frameWidth;
      canvas.height = frameHeight;

      // Draw frame background
      const frameStyle = frameStyles.find(f => f.id === currentFrame?.id) || frameStyles[0];
      
      if (frameStyle.colors[0] === frameStyle.colors[1]) {
        ctx.fillStyle = frameStyle.colors[0];
      } else {
        const gradient = ctx.createLinearGradient(0, 0, frameWidth, frameHeight);
        gradient.addColorStop(0, frameStyle.colors[0]);
        gradient.addColorStop(1, frameStyle.colors[1]);
        ctx.fillStyle = gradient;
      }

      ctx.fillRect(0, 0, frameWidth, frameHeight);

      // Load and draw all photos
      const loadImage = (src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = src;
        });
      };

      const images = await Promise.all(capturedImages.map(loadImage));

      // Get CSS filter string
      const getFilterCSS = (filter) => {
        if (filter === 'vintage-polaroid') {
          return 'brightness(0.76) contrast(1.28) saturate(0.76) sepia(0.15)';
        } else if (filter === 'old-money') {
          return 'brightness(0.55) contrast(0.7) saturate(0.85) sepia(0.2)';
        } else if (filter === 'bw-filter') {
          return 'grayscale(1) brightness(0.5) contrast(1.1)';
        } else if (filter === 'dark-soul') {
          return 'brightness(0.47) saturate(0.62) contrast(0.69)';
        }
        return 'none';
      };

      // Generate film grain overlay if needed
      const filmGrainFilters = ['vintage-polaroid', 'old-money', 'bw-filter', 'dark-soul'];
      const needsFilmGrain = filmGrainFilters.includes(currentFrame?.id);

      images.forEach((img, index) => {
        if (!img) return;

        const y = photoPadding + (index * (photoHeight + photoGap));

        // Draw photo background (dark)
        ctx.fillStyle = '#18181b';
        roundRect(ctx, photoPadding - 2, y - 2, photoWidth + 4, photoHeight + 4, 12);
        ctx.fill();

        // Calculate crop to fit
        const imgAspect = img.width / img.height;
        const targetAspect = photoWidth / photoHeight;

        let sx, sy, sw, sh;

        if (imgAspect > targetAspect) {
          sh = img.height;
          sw = sh * targetAspect;
          sx = (img.width - sw) / 2;
          sy = 0;
        } else {
          sw = img.width;
          sh = sw / targetAspect;
          sx = 0;
          sy = (img.height - sh) / 2;
        }

        // Clip and draw photo with rounded corners and CSS filter
        ctx.save();
        roundRect(ctx, photoPadding, y, photoWidth, photoHeight, 10);
        ctx.clip();

        // Apply CSS filter - images already have filter applied from capture with film grain baked in
        ctx.drawImage(img, sx, sy, sw, sh, photoPadding, y, photoWidth, photoHeight);

        ctx.restore();
      });

      // Add branding text at bottom
      ctx.fillStyle = frameStyle.textColor;
      ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(customText, frameWidth / 2, frameHeight - 40);

      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.globalAlpha = 0.6;
      ctx.textAlign = 'right';
      ctx.fillText(customDate, frameWidth - photoPadding, frameHeight - 20);
      ctx.globalAlpha = 1;

      setFinalImage(canvas.toDataURL('image/jpeg', 0.95));
      setIsGenerating(false);
    };

  // Helper function for rounded rectangles
  const roundRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const handleDownload = () => {
    if (!finalImage) return;
    
    const link = document.createElement('a');
    link.download = `photobooth-${Date.now()}.jpg`;
    link.href = finalImage;
    link.click();
    setDownloaded(true);
  };

  const handleShare = async () => {
    if (!finalImage) return;

    try {
      const response = await fetch(finalImage);
      const blob = await response.blob();
      const file = new File([blob], 'photobooth.jpg', { type: 'image/jpeg' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Mein Photobooth Foto',
        });
      } else {
        handleDownload();
      }
    } catch (err) {
      console.error('Share error:', err);
      handleDownload();
    }
  };

  const handleSendEmail = async () => {
    // E-Mail Versand benötigt ein eigenes Backend.
    // Hier könnte z.B. EmailJS oder ein eigener API-Endpunkt eingebunden werden.
    alert('E-Mail Versand ist ohne Backend nicht verfügbar. Bitte lade das Bild herunter und sende es manuell.');
  };

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
          Zurück
        </Button>
      </div>

      {/* Result */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Image Preview */}
          <div className="flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: -5 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[280px]"
              style={{ transformOrigin: 'center center' }}
            >
              {isGenerating ? (
                <div className="aspect-[3/5] bg-zinc-800 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                </div>
              ) : finalImage ? (
                <img 
                  src={finalImage} 
                  alt="Final" 
                  className="w-full rounded-2xl shadow-2xl shadow-black/50"
                />
              ) : null}
            </motion.div>
          </div>

          {/* Right side - Controls */}
          <div className="flex flex-col justify-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Perfekt! 🎉
              </h2>
              <p className="text-zinc-400 mb-6">
                Dein Fotostreifen ist fertig
              </p>

              {/* Frame Style Selection */}
              <div className="mb-6">
                <label className="text-zinc-400 text-sm mb-3 block">Rahmen-Stil</label>
                <div className="grid grid-cols-5 gap-2">
                  {frameStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setCurrentFrame({ ...currentFrame, id: style.id })}
                      className={cn(
                        "aspect-square rounded-lg transition-all duration-200",
                        "border-2 hover:scale-105",
                        currentFrame?.id === style.id 
                          ? "border-violet-500 scale-105" 
                          : "border-zinc-700 hover:border-zinc-500"
                      )}
                      style={{
                        background: style.colors[0] === style.colors[1]
                          ? style.colors[0]
                          : `linear-gradient(135deg, ${style.colors[0]}, ${style.colors[1]})`
                      }}
                      title={style.name}
                    />
                  ))}
                </div>
              </div>

              {/* Text customization */}
              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-zinc-400 text-sm mb-2 block">Text</label>
                  <Input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="h-10 rounded-lg bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 text-sm mb-2 block">Datum & Uhrzeit</label>
                  <Input
                    type="text"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="h-10 rounded-lg bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            {!isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
            <Button
              onClick={handleDownload}
              className={cn(
                "w-full rounded-full h-12 font-semibold transition-all duration-300",
                downloaded 
                  ? "bg-green-600 hover:bg-green-500" 
                  : "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
              )}
            >
              {downloaded ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Heruntergeladen
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Herunterladen
                </>
              )}
            </Button>

            <Button
              onClick={handleShare}
              variant="outline"
              className="w-full rounded-full h-12 font-semibold bg-white border-zinc-300 text-black hover:bg-zinc-100"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Teilen
            </Button>

            {/* Email Form */}
            {!sent ? (
              <>
                {showEmailForm ? (
                  <div className="space-y-3">
                    <Input
                      type="email"
                      placeholder="deine@email.de"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 rounded-lg bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                    />
                    <Button
                      onClick={handleSendEmail}
                      disabled={!email || sending}
                      className="w-full rounded-full h-12 font-semibold bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Wird gesendet...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Per E-Mail senden
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowEmailForm(true)}
                    variant="ghost"
                    className="w-full rounded-full h-12 font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Per E-Mail erhalten
                  </Button>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 text-green-500">
                <Check className="w-4 h-4" />
                <span className="text-sm">E-Mail wurde gesendet!</span>
              </div>
            )}

            {/* Restart */}
            <Button
              onClick={onRestart}
              variant="ghost"
              className="w-full text-zinc-500 hover:text-white hover:bg-white/5 mt-4"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Neuen Fotostreifen machen
            </Button>
            </motion.div>
            )}
            </div>
            </div>

            {/* Hidden canvas */}
            <canvas ref={canvasRef} className="hidden" />
            </div>
    </div>
  );
}