import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getThemeList, applyTheme } from '../../config/themes';
import { Palette, Check, RotateCcw, Sparkles, X } from 'lucide-react';
import toast from '../../utils/toast';

const ThemeSettings = () => {
  const { theme: currentTheme, setTheme, isChanging } = useTheme();
  const themes = getThemeList();
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customColors, setCustomColors] = useState({
    primary: '#8b5cf6',
    background: '#0f0a1f',
    surface: '#1a1333',
    text: '#ede9fe',
  });

  // Load saved custom colors when modal opens
  useEffect(() => {
    if (showCustomPicker) {
      const savedColors = localStorage.getItem('customThemeColors');
      if (savedColors) {
        try {
          const parsed = JSON.parse(savedColors);
          setCustomColors({
            primary: parsed.primary || '#8b5cf6',
            background: parsed.background || '#0f0a1f',
            surface: parsed.surface || '#1a1333',
            text: parsed.text || '#ede9fe',
          });
        } catch (e) {
          console.error('Failed to load custom colors', e);
        }
      }
    }
  }, [showCustomPicker]);

  const handleThemeSelect = async (themeId) => {
    if (themeId === 'custom') {
      setShowCustomPicker(true);
      return;
    }
    try {
      await setTheme(themeId);
      toast.success(`Theme changed to ${themes.find(t => t.id === themeId)?.name}`);
    } catch (error) {
      toast.error('Failed to change theme');
    }
  };

  const handleCustomColorChange = (colorKey, value) => {
    setCustomColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
  };

  const applyCustomTheme = async () => {
    try {
      // Update the custom theme in localStorage
      const customTheme = {
        primary: customColors.primary,
        primaryHover: adjustColor(customColors.primary, -20),
        background: customColors.background,
        surface: customColors.surface,
        surfaceHover: adjustColor(customColors.surface, 10),
        text: customColors.text,
        textSecondary: adjustColor(customColors.text, -30),
        border: adjustColor(customColors.surface, 20),
        accent: customColors.primary,
      };
      
      // Save to localStorage first
      localStorage.setItem('customThemeColors', JSON.stringify(customTheme));
      
      // Small delay to ensure localStorage is written
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Apply theme immediately
      applyTheme('custom');
      
      // Then update context
      await setTheme('custom');
      
      setShowCustomPicker(false);
      toast.success('Custom theme applied!');
    } catch (error) {
      console.error('Custom theme error:', error);
      toast.error('Failed to apply custom theme');
    }
  };

  // Helper function to adjust color brightness
  const adjustColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  };

  const handleResetToDefault = async () => {
    try {
      await setTheme('dark');
      toast.success('Theme reset to default');
    } catch (error) {
      toast.error('Failed to reset theme');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <Palette className="w-8 h-8 text-primary-500" />
            <h1 className="text-2xl font-bold text-white">Theme Settings</h1>
          </div>
          <p className="text-gray-400 mt-1">
            Customize your workspace appearance with beautiful themes
          </p>
        </div>
        <button
          onClick={handleResetToDefault}
          className="flex items-center px-4 py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Default
        </button>
      </div>

      {/* Current Theme Info */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Current Theme</h3>
            <p className="text-gray-400">
              {themes.find(t => t.id === currentTheme)?.name} - {themes.find(t => t.id === currentTheme)?.description}
            </p>
          </div>
          <div className={`w-16 h-16 rounded-lg ${themes.find(t => t.id === currentTheme)?.preview} shadow-lg`} />
        </div>
      </div>

      {/* Theme Grid */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Available Themes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {themes.map((themeItem) => (
            <div
              key={themeItem.id}
              className={`relative group cursor-pointer rounded-xl border-2 transition-all duration-300 ${
                currentTheme === themeItem.id
                  ? 'border-primary-500 shadow-lg shadow-primary-500/20'
                  : 'border-dark-700 hover:border-dark-600'
              } ${isChanging ? 'pointer-events-none opacity-50' : ''}`}
              onClick={() => handleThemeSelect(themeItem.id)}
            >
              {/* Theme Preview */}
              <div className={`h-32 rounded-t-lg ${themeItem.preview} relative overflow-hidden`}>
                {/* Decorative elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 flex space-x-1">
                  <div className="h-2 w-8 bg-white/20 rounded-full" />
                  <div className="h-2 w-12 bg-white/20 rounded-full" />
                  <div className="h-2 w-6 bg-white/20 rounded-full" />
                </div>
              </div>

              {/* Theme Info */}
              <div className="p-4 bg-dark-800 rounded-b-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{themeItem.name}</h4>
                    <p className="text-sm text-gray-400">{themeItem.description}</p>
                  </div>
                  {currentTheme === themeItem.id && (
                    <div className="ml-2 flex-shrink-0">
                      <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Hover Overlay */}
              {currentTheme !== themeItem.id && (
                <div className="absolute inset-0 bg-primary-600/0 group-hover:bg-primary-600/5 rounded-xl transition-colors duration-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Theme Tips */}
      <div className="card bg-gradient-to-br from-primary-600/10 to-purple-600/10 border-primary-600/20">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-6 h-6 text-primary-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Theme Tips</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <span className="text-primary-400 mr-2">•</span>
                <span>Click any theme to apply it instantly</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-400 mr-2">•</span>
                <span>Your theme preference is saved automatically and syncs across all your devices</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-400 mr-2">•</span>
                <span>Themes apply globally to dashboard, navbar, sidebar, and all components</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-400 mr-2">•</span>
                <span>All themes are optimized for both desktop and mobile devices</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Custom Color Picker Modal */}
      {showCustomPicker && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-xl border border-dark-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-dark-700">
              <div className="flex items-center space-x-3">
                <Palette className="w-6 h-6 text-primary-500" />
                <h2 className="text-xl font-bold text-white">Custom Theme Builder</h2>
              </div>
              <button
                onClick={() => setShowCustomPicker(false)}
                className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <p className="text-gray-400 text-sm">
                Create your personalized theme by choosing colors for different elements.
                The system will automatically generate complementary shades.
              </p>

              {/* Color Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Primary Color */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white">
                    Primary Color
                  </label>
                  <p className="text-xs text-gray-400">
                    Used for buttons, links, and highlights
                  </p>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={customColors.primary}
                      onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                      className="w-16 h-16 rounded-lg cursor-pointer border-2 border-dark-700"
                    />
                    <input
                      type="text"
                      value={customColors.primary}
                      onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                      className="flex-1 bg-dark-800 border border-dark-700 text-white rounded-lg px-4 py-2 font-mono text-sm"
                      placeholder="#8b5cf6"
                    />
                  </div>
                </div>

                {/* Background Color */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white">
                    Background Color
                  </label>
                  <p className="text-xs text-gray-400">
                    Main page background (should be very dark)
                  </p>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={customColors.background}
                      onChange={(e) => handleCustomColorChange('background', e.target.value)}
                      className="w-16 h-16 rounded-lg cursor-pointer border-2 border-dark-700"
                    />
                    <input
                      type="text"
                      value={customColors.background}
                      onChange={(e) => handleCustomColorChange('background', e.target.value)}
                      className="flex-1 bg-dark-800 border border-dark-700 text-white rounded-lg px-4 py-2 font-mono text-sm"
                      placeholder="#0f0a1f"
                    />
                  </div>
                </div>

                {/* Surface Color */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white">
                    Surface Color
                  </label>
                  <p className="text-xs text-gray-400">
                    Cards, sidebar, and header background
                  </p>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={customColors.surface}
                      onChange={(e) => handleCustomColorChange('surface', e.target.value)}
                      className="w-16 h-16 rounded-lg cursor-pointer border-2 border-dark-700"
                    />
                    <input
                      type="text"
                      value={customColors.surface}
                      onChange={(e) => handleCustomColorChange('surface', e.target.value)}
                      className="flex-1 bg-dark-800 border border-dark-700 text-white rounded-lg px-4 py-2 font-mono text-sm"
                      placeholder="#1a1333"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white">
                    Text Color
                  </label>
                  <p className="text-xs text-gray-400">
                    Main text color (should be light)
                  </p>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={customColors.text}
                      onChange={(e) => handleCustomColorChange('text', e.target.value)}
                      className="w-16 h-16 rounded-lg cursor-pointer border-2 border-dark-700"
                    />
                    <input
                      type="text"
                      value={customColors.text}
                      onChange={(e) => handleCustomColorChange('text', e.target.value)}
                      className="flex-1 bg-dark-800 border border-dark-700 text-white rounded-lg px-4 py-2 font-mono text-sm"
                      placeholder="#ede9fe"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white">
                  Preview
                </label>
                <div 
                  className="rounded-lg p-6 border-2"
                  style={{ 
                    backgroundColor: customColors.background,
                    borderColor: customColors.surface
                  }}
                >
                  <div 
                    className="rounded-lg p-4 mb-4"
                    style={{ backgroundColor: customColors.surface }}
                  >
                    <h3 className="font-semibold mb-2" style={{ color: customColors.text }}>
                      Sample Card
                    </h3>
                    <p className="text-sm mb-3" style={{ color: customColors.text, opacity: 0.7 }}>
                      This is how your custom theme will look
                    </p>
                    <button
                      className="px-4 py-2 rounded-lg text-white font-medium"
                      style={{ backgroundColor: customColors.primary }}
                    >
                      Primary Button
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-dark-700">
              <button
                onClick={() => setShowCustomPicker(false)}
                className="px-6 py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyCustomTheme}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Apply Custom Theme</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSettings;
