import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCw, Volume2, ShieldCheck, Check } from 'lucide-react';

interface GovCaptchaProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  onCodeGenerated?: (code: string) => void;
  error?: string | null;
  className?: string;
  theme?: 'emerald' | 'beige' | 'cream' | 'slate';
  inputPlaceholder?: string;
  autoFocus?: boolean;
}

// Generate an authentic 5-character alphanumeric captcha
// Excludes confusing characters like 0/O, 1/I/l for better accessibility
const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';

export function generateCaptchaCode(length = 5): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CAPTCHA_CHARS.charAt(Math.floor(Math.random() * CAPTCHA_CHARS.length));
  }
  return result;
}

export const GovCaptcha: React.FC<GovCaptchaProps> = ({
  id = 'gov-captcha',
  value,
  onChange,
  onCodeGenerated,
  error,
  className = '',
  theme = 'emerald',
  inputPlaceholder = 'Enter Captcha code',
}) => {
  const [captchaCode, setCaptchaCode] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onCodeGeneratedRef = useRef(onCodeGenerated);

  useEffect(() => {
    onCodeGeneratedRef.current = onCodeGenerated;
  }, [onCodeGenerated]);

  // Colors based on theme for noise and text
  const getThemePalette = () => {
    switch (theme) {
      case 'beige':
        return ['#78350f', '#92400e', '#b45309', '#065f46', '#292524'];
      case 'cream':
        return ['#065f46', '#047857', '#854d0e', '#44403c', '#14532d'];
      case 'slate':
        return ['#292524', '#44403c', '#57534e', '#065f46', '#1c1917'];
      case 'emerald':
      default:
        return ['#065f46', '#047857', '#0f766e', '#15803d', '#166534'];
    }
  };

  // Draw captcha on HTML5 Canvas
  const drawCaptcha = useCallback((code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Warm cream / beige background gradient with subtle security pattern
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#fefdfa');
    grad.addColorStop(0.5, '#fbf7ee');
    grad.addColorStop(1, '#f3ede0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Draw background security grid/mesh
    ctx.strokeStyle = '#e7decb';
    ctx.lineWidth = 0.6;
    for (let x = 10; x < width; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 8; y < height; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw random noise dots
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#a8a29e' : '#78716c';
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 1.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Palette for characters
    const palette = getThemePalette();

    // Render characters with individual rotation and positioning
    const charCount = code.length;
    const charSpacing = width / (charCount + 1);

    for (let i = 0; i < charCount; i++) {
      const char = code[i];
      ctx.save();

      // Random slight tilt (-18 to +18 degrees)
      const angle = (Math.random() - 0.5) * 0.45;
      const x = (i + 0.8) * charSpacing;
      const y = height / 2 + (Math.random() - 0.5) * 6 + 6;

      ctx.translate(x, y);
      ctx.rotate(angle);

      // Distinct styling per letter
      ctx.font = `bold ${Math.floor(20 + Math.random() * 4)}px monospace, sans-serif`;
      ctx.fillStyle = palette[i % palette.length];
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 1;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    // Draw 2-3 wavy noise lines across
    for (let l = 0; l < 2; l++) {
      ctx.strokeStyle = palette[(l * 2) % palette.length];
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * height);
      ctx.bezierCurveTo(
        width * 0.3,
        Math.random() * height,
        width * 0.7,
        Math.random() * height,
        width,
        Math.random() * height
      );
      ctx.stroke();
    }
  }, [theme]);

  // Refresh and generate new code
  const refreshCaptcha = useCallback(() => {
    const newCode = generateCaptchaCode(5);
    setCaptchaCode(newCode);
    if (onCodeGeneratedRef.current) {
      onCodeGeneratedRef.current(newCode);
    }
    // Redraw on canvas
    setTimeout(() => {
      drawCaptcha(newCode);
    }, 10);
  }, [drawCaptcha]);

  // Initialize on mount
  useEffect(() => {
    refreshCaptcha();
  }, []);

  // Text-to-Speech audio accessibility
  const handlePlayAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    // Speak character by character with case specification
    const speechSpelling = captchaCode
      .split('')
      .map((c) => {
        if (/[A-Z]/.test(c)) return `Capital ${c}`;
        if (/[a-z]/.test(c)) return `Small ${c}`;
        return c;
      })
      .join(', ');

    const utterance = new SpeechSynthesisUtterance(`Captcha verification code is: ${speechSpelling}`);
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const isMatched = value.trim() !== '' && value.trim() === captchaCode;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-xs font-bold text-stone-700 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Security Captcha Verification / कैप्चा कोड *</span>
        </label>
        <span className="text-[10px] text-stone-500">Case-sensitive</span>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Visual Captcha Canvas & Actions */}
        <div className="flex items-center gap-1.5 bg-[#fbf8f2] p-1.5 rounded-lg border border-[#e5dcce] shadow-xs flex-shrink-0">
          <div className="relative rounded overflow-hidden border border-[#ded5c5] bg-white">
            <canvas
              ref={canvasRef}
              width={140}
              height={38}
              className="block cursor-pointer select-none"
              title="Click to refresh captcha"
              onClick={refreshCaptcha}
            />
          </div>

          <div className="flex flex-col gap-1">
            {/* Refresh Button */}
            <button
              type="button"
              onClick={refreshCaptcha}
              className="p-1 text-stone-600 hover:text-emerald-800 hover:bg-white rounded transition-colors cursor-pointer border border-transparent hover:border-stone-300"
              title="Generate new Captcha / नया कैप्चा बनाएं"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Audio Speech Button */}
            <button
              type="button"
              onClick={handlePlayAudio}
              className={`p-1 rounded transition-colors cursor-pointer border border-transparent hover:border-stone-300 ${
                isSpeaking ? 'text-amber-700 bg-amber-50' : 'text-stone-600 hover:text-emerald-800 hover:bg-white'
              }`}
              title="Listen to Captcha Audio / ऑडियो सुनें"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Captcha Input Box */}
        <div className="relative flex-1">
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={inputPlaceholder}
            autoComplete="off"
            spellCheck="false"
            maxLength={6}
            className={`w-full text-xs px-3 py-2 border rounded font-mono tracking-wider transition-colors ${
              error
                ? 'border-red-400 bg-red-50/40 text-red-900 focus:ring-2 focus:ring-red-500'
                : isMatched
                ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 focus:ring-2 focus:ring-emerald-600'
                : 'border-stone-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600'
            }`}
            required
          />
          {isMatched && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none">
              <Check className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-[11px] text-red-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};
