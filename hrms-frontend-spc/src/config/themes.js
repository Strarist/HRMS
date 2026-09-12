// Theme configurations with color palettes
export const themes = {
  light: {
    name: 'Light',
    description: 'Clean and bright',
    colors: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      background: '#ffffff',
      surface: '#f8fafc',
      surfaceHover: '#f1f5f9',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      accent: '#3b82f6',
    },
    preview: 'bg-gradient-to-br from-blue-50 to-slate-100',
  },
  dark: {
    name: 'Dark',
    description: 'Easy on the eyes',
    colors: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      background: '#0f172a',
      surface: '#1e293b',
      surfaceHover: '#334155',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      border: '#334155',
      accent: '#3b82f6',
    },
    preview: 'bg-gradient-to-br from-slate-900 to-slate-800',
  },
  blue: {
    name: 'Ocean Blue',
    description: 'Professional and calm',
    colors: {
      primary: '#0ea5e9',
      primaryHover: '#0284c7',
      background: '#051923',
      surface: '#0a2540',
      surfaceHover: '#0f3554',
      text: '#e0f2fe',
      textSecondary: '#7dd3fc',
      border: '#1e3a5f',
      accent: '#38bdf8',
    },
    preview: 'bg-gradient-to-br from-blue-900 to-cyan-900',
  },
  green: {
    name: 'Forest Green',
    description: 'Natural and refreshing',
    colors: {
      primary: '#10b981',
      primaryHover: '#059669',
      background: '#041a0f',
      surface: '#0d2818',
      surfaceHover: '#1a3d28',
      text: '#d1fae5',
      textSecondary: '#6ee7b7',
      border: '#1e4d2b',
      accent: '#34d399',
    },
    preview: 'bg-gradient-to-br from-green-900 to-emerald-900',
  },
  purple: {
    name: 'Royal Purple',
    description: 'Creative and elegant',
    colors: {
      primary: '#a855f7',
      primaryHover: '#9333ea',
      background: '#0f0520',
      surface: '#1e0f3d',
      surfaceHover: '#2d1b5a',
      text: '#f3e8ff',
      textSecondary: '#d8b4fe',
      border: '#4c1d95',
      accent: '#c084fc',
    },
    preview: 'bg-gradient-to-br from-purple-900 to-violet-900',
  },
  orange: {
    name: 'Sunset Orange',
    description: 'Warm and energetic',
    colors: {
      primary: '#f97316',
      primaryHover: '#ea580c',
      background: '#1a0a03',
      surface: '#331508',
      surfaceHover: '#4d2410',
      text: '#fed7aa',
      textSecondary: '#fdba74',
      border: '#7c2d12',
      accent: '#fb923c',
    },
    preview: 'bg-gradient-to-br from-orange-900 to-amber-900',
  },
  red: {
    name: 'Ruby Red',
    description: 'Bold and powerful',
    colors: {
      primary: '#ef4444',
      primaryHover: '#dc2626',
      background: '#1a0404',
      surface: '#330a0a',
      surfaceHover: '#4d1010',
      text: '#fee2e2',
      textSecondary: '#fca5a5',
      border: '#7f1d1d',
      accent: '#f87171',
    },
    preview: 'bg-gradient-to-br from-red-900 to-rose-900',
  },
  teal: {
    name: 'Teal Wave',
    description: 'Modern and balanced',
    colors: {
      primary: '#14b8a6',
      primaryHover: '#0d9488',
      background: '#041614',
      surface: '#0a2826',
      surfaceHover: '#103d38',
      text: '#ccfbf1',
      textSecondary: '#5eead4',
      border: '#134e4a',
      accent: '#2dd4bf',
    },
    preview: 'bg-gradient-to-br from-teal-900 to-cyan-900',
  },
  grey: {
    name: 'Monochrome',
    description: 'Minimalist and focused',
    colors: {
      primary: '#6b7280',
      primaryHover: '#4b5563',
      background: '#111827',
      surface: '#1f2937',
      surfaceHover: '#374151',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      border: '#374151',
      accent: '#9ca3af',
    },
    preview: 'bg-gradient-to-br from-gray-900 to-slate-800',
  },
  custom: {
    name: 'Custom',
    description: 'Your personalized theme',
    colors: {
      primary: '#8b5cf6',
      primaryHover: '#7c3aed',
      background: '#0f0a1f',
      surface: '#1a1333',
      surfaceHover: '#251c47',
      text: '#ede9fe',
      textSecondary: '#c4b5fd',
      border: '#2e1f5a',
      accent: '#a78bfa',
    },
    preview: 'bg-gradient-to-br from-indigo-900 to-purple-900',
  },
};

// Get theme configuration
export const getTheme = (themeName) => {
  if (themeName === 'custom') {
    // Load custom colors from localStorage
    const customColorsJson = localStorage.getItem('customThemeColors');
    if (customColorsJson) {
      try {
        const customColors = JSON.parse(customColorsJson);
        return {
          ...themes.custom,
          colors: customColors
        };
      } catch (e) {
        console.error('Failed to parse custom theme colors', e);
      }
    }
  }
  return themes[themeName] || themes.dark;
};

// Apply theme to document
export const applyTheme = (themeName) => {
  const theme = getTheme(themeName);
  const root = document.documentElement;
  const body = document.body;

  // Apply CSS variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });

  // Apply theme class
  root.setAttribute('data-theme', themeName);
  
  // Directly apply background color to body for immediate effect
  body.style.backgroundColor = theme.colors.background;
  body.style.color = theme.colors.text;
  
  // Handle dark mode class for compatibility
  if (themeName === 'light') {
    root.classList.remove('dark');
    body.classList.remove('dark');
  } else {
    root.classList.add('dark');
    body.classList.add('dark');
  }
};

// Get all theme names
export const getThemeNames = () => Object.keys(themes);

// Get theme list for UI
export const getThemeList = () => {
  return Object.entries(themes).map(([key, value]) => ({
    id: key,
    name: value.name,
    description: value.description,
    preview: value.preview,
  }));
};
