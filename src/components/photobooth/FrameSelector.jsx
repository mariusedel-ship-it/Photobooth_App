import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getFilterCSS } from './filterConfig';

const defaultFrames = [
  {
    id: 'vintage-polaroid',
    name: 'Vintage Polaroid',
    category: 'fun',
    preview: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&q=80',
    borderColor: 'border-amber-800',
    bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
    filter: 'vintage-polaroid',
  },
  {
    id: 'old-money',
    name: 'Old Money',
    category: 'fun',
    preview: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&q=80',
    borderColor: 'border-amber-900',
    bgColor: 'bg-gradient-to-br from-amber-900 to-stone-800',
    filter: 'old-money',
  },
  {
    id: 'bw-filter',
    name: 'B&W Filter',
    category: 'fun',
    preview: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&q=80',
    borderColor: 'border-zinc-400',
    bgColor: 'bg-gradient-to-br from-zinc-300 to-zinc-500',
    filter: 'bw-filter',
  },
  {
    id: 'dark-soul',
    name: 'Dark Soul',
    category: 'fun',
    preview: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&q=80',
    borderColor: 'border-zinc-800',
    bgColor: 'bg-gradient-to-br from-zinc-900 to-black',
    filter: 'dark-soul',
  },
  {
    id: 'minimal-white',
    name: 'Minimal Weiß',
    category: 'minimal',
    preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    borderColor: 'border-white',
    bgColor: 'bg-white',
  },
  {
    id: 'elegant-gold',
    name: 'Elegant Gold',
    category: 'wedding',
    preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80',
    borderColor: 'border-amber-400',
    bgColor: 'bg-gradient-to-br from-amber-200 to-amber-400',
  },
  {
    id: 'party-neon',
    name: 'Party Neon',
    category: 'event',
    preview: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=400&q=80',
    borderColor: 'border-fuchsia-500',
    bgColor: 'bg-gradient-to-br from-violet-500 to-fuchsia-500',
  },
  {
    id: 'corporate-blue',
    name: 'Business Blau',
    category: 'brand',
    preview: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&q=80',
    borderColor: 'border-blue-500',
    bgColor: 'bg-gradient-to-br from-blue-600 to-cyan-500',
  },
  {
    id: 'vintage-sepia',
    name: 'Vintage Sepia',
    category: 'fun',
    preview: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&q=80',
    borderColor: 'border-amber-700',
    bgColor: 'bg-gradient-to-br from-amber-100 to-orange-200',
  },
  {
    id: 'nature-green',
    name: 'Natur Grün',
    category: 'event',
    preview: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=400&q=80',
    borderColor: 'border-emerald-500',
    bgColor: 'bg-gradient-to-br from-emerald-400 to-teal-500',
  },
];

const categories = [
  { id: 'all', label: 'Alle' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'wedding', label: 'Hochzeit' },
  { id: 'event', label: 'Event' },
  { id: 'brand', label: 'Business' },
  { id: 'fun', label: 'Fun' },
];

export default function FrameSelector({ selectedFrame, onSelect, onBack, onContinue }) {
  const [activeCategory, setActiveCategory] = React.useState('all');

  const filteredFrames = activeCategory === 'all' 
    ? defaultFrames 
    : defaultFrames.filter(f => f.category === activeCategory);

  const handleFrameSelect = (frame) => {
    onSelect(frame);
    // Direkt weiter zur Kamera
    setTimeout(() => onContinue(), 150);
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-zinc-400 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
{selectedFrame && (
            <span className="text-zinc-400 text-sm">
              {selectedFrame.name} ausgewählt
            </span>
          )}
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Wähle deinen Frame
          </h2>
          <p className="text-zinc-400">
            Finde den perfekten Rahmen für dein Foto
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                activeCategory === cat.id
                  ? "bg-white text-black"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Frame Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
        >
          {filteredFrames.map((frame, index) => (
            <motion.button
              key={frame.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleFrameSelect(frame)}
              className={cn(
                "relative aspect-[3/4] rounded-2xl overflow-hidden group transition-all duration-300",
                selectedFrame?.id === frame.id
                  ? "ring-2 ring-violet-500 ring-offset-4 ring-offset-zinc-950 scale-[0.98]"
                  : "hover:scale-[0.98]"
              )}
            >
              {/* Frame Preview */}
              <div className={cn(
                "absolute inset-0",
                frame.bgColor
              )} />

              {/* Inner photo area with preview image */}
              <div className="absolute inset-3 md:inset-4 bg-zinc-800 rounded-lg overflow-hidden">
                <img 
                  src="/Woman_stock.webp"
                  alt="Vorschau"
                  className="w-full h-full object-cover"
                  style={{ filter: getFilterCSS(frame.filter) }}
                />
              </div>

              {/* Frame name overlay */}
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-sm font-medium">{frame.name}</p>
              </div>

              {/* Selected check */}
              {selectedFrame?.id === frame.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center"
                >
                  <Check className="w-5 h-5 text-white" />
                </motion.div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}