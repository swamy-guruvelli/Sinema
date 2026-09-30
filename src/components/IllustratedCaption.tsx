import React from 'react';

type IllustratedCaptionProps = {
  eyebrow?: string;
  children: React.ReactNode;
  progress?: number;
  width?: number | string;
  style?: React.CSSProperties;
};

export const IllustratedCaption: React.FC<IllustratedCaptionProps> = ({
  eyebrow,
  children,
  progress = 1,
  width = 820,
  style,
}) => {
  const safeProgress = Math.max(0, Math.min(1, progress));
  return (
    <div
      style={{
        width,
        opacity: safeProgress,
        transform: `translateY(${(1 - safeProgress) * 24}px)`,
        color: '#fff7e6',
        textShadow: '0 3px 10px rgba(26, 12, 8, 0.58)',
        ...style,
      }}
    >
      {eyebrow && (
        <div
          style={{
            marginBottom: 16,
            color: '#ffd083',
            fontFamily: 'Arial, sans-serif',
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </div>
      )}
      <div
        style={{
          fontFamily: 'Georgia, Times New Roman, serif',
          fontSize: 64,
          lineHeight: 0.98,
          fontWeight: 700,
          letterSpacing: -1.5,
        }}
      >
        {children}
      </div>
    </div>
  );
};
