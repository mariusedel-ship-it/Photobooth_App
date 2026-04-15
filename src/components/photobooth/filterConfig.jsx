// Filter definitions for photobooth
// Adjust values here to change filter appearance

export const FILTERS = {
  'vintage-polaroid': 'brightness(0.76) contrast(1.28) saturate(0.76) sepia(0.15)',
  'old-money': 'brightness(0.55) contrast(0.7) saturate(0.85) sepia(0.2)',
  'bw-filter': 'grayscale(1) brightness(0.5) contrast(1.1)',
  'dark-soul': 'brightness(0.47) saturate(0.62) contrast(0.69)',
};

export const getFilterCSS = (filter) => {
  return FILTERS[filter] || 'none';
};

// Film grain enabled for these filters
export const FILM_GRAIN_FILTERS = ['vintage-polaroid', 'bw-filter'];