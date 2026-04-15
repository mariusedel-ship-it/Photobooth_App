import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Sparkles, Share2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection({ onStart, onUpload }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col lg:flex-row items-center justify-center gap-12 px-6 py-12 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[128px]" />
      </div>

      {/* Preview Image */}
      <motion.div
        initial={{ opacity: 0, x: -50, rotate: -8 }}
        animate={{ opacity: 1, x: 0, rotate: -5, scale: 0.7 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        className="relative z-10 w-full max-w-[180px] lg:max-w-[200px] shrink-0 order-2 lg:order-1"
      >
        <img 
          src="/Ergebnis.webp"
          alt="Photobooth Beispiel"
          className="w-full rounded-2xl shadow-2xl shadow-black/50"
        />
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center lg:text-left max-w-2xl order-1 lg:order-2"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
        >
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-sm text-zinc-300 font-medium">Keine App · Kein Download · Einfach loslegen</span>
        </motion.div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6">
          Deine{' '}
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            Online-Photobooth
          </span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed">
          Mache unvergessliche Fotos direkt im Browser – mit individuellen Frames, 
          sofortigem Download und einfachem Teilen.
        </p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 items-center lg:items-start"
        >
          <Button
            onClick={onStart}
            size="lg"
            className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-full shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-105"
          >
            <Camera className="w-5 h-5 mr-3" />
            Foto machen
          </Button>
          
          <span className="text-zinc-500">oder</span>
          
          <Button
            onClick={onUpload}
            size="lg"
            className="h-14 px-8 text-lg font-semibold bg-white text-black hover:bg-white hover:border-2 hover:border-black rounded-full transition-all duration-300"
          >
            <Upload className="w-5 h-5 mr-3" />
            Bilder hochladen
          </Button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-16 grid grid-cols-3 gap-6 md:gap-12"
        >
          {[
            { icon: Camera, label: 'Browser-basiert' },
            { icon: Sparkles, label: 'Individuelle Frames' },
            { icon: Upload, label: 'Bilder hochladen' },
          ].map(({ icon: Icon, label }, index) => (
            <div key={label} className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-zinc-400" />
              </div>
              <span className="text-sm text-zinc-500 font-medium">{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}