import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

interface CaptchaProps {
  length?: number;
  onChange: (text: string) => void;
}

const Captcha = forwardRef(({ length = 6, onChange }: CaptchaProps, ref) => {
  const [captchaText, setCaptchaText] = useState('');

  const generateCaptcha = (len: number): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const refresh = () => {
    const newCaptcha = generateCaptcha(length);
    setCaptchaText(newCaptcha);
    onChange(newCaptcha);
  };

  useImperativeHandle(ref, () => ({
    refresh
  }));

  useEffect(() => {
    refresh();
  }, [length]);

  return (
    <div className="flex items-center justify-center h-16 bg-white relative overflow-hidden">
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background: `repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #e6e6e6 10px, #e6e6e6 20px)`,
        }}
      >
        {captchaText.split('').map((char, index) => (
          <span
            key={index}
            className="text-2xl font-bold tracking-wider"
            style={{
              color: `hsl(${Math.random() * 360}, 70%, 40%)`,
              transform: `rotate(${Math.random() * 20 - 10}deg) translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`,
              textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
              fontFamily: index % 2 === 0 ? 'serif' : 'monospace',
            }}
          >
            {char}
          </span>
        ))}
      </div>
      
      {/* Noise lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: '100%',
            height: `${Math.random() * 1 + 0.5}px`,
            background: `rgba(0,0,0,${Math.random() * 0.3 + 0.1})`,
            top: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 20 - 10}deg)`,
          }}
        />
      ))}
      
      {/* Dots */}
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={`dot-${i}`}
          className="absolute rounded-full"
          style={{
            width: `${Math.random() * 4 + 1}px`,
            height: `${Math.random() * 4 + 1}px`,
            background: `rgba(0,0,0,${Math.random() * 0.3 + 0.1})`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
});

Captcha.displayName = 'Captcha';

export default Captcha;