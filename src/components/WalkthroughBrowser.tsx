import React from 'react';
import {Img, interpolate, staticFile} from 'remotion';
import type {CaptureStep, TargetRect} from '../data/walkthrough';

type WalkthroughBrowserProps = {step: CaptureStep; localMs: number; domain: string};

const content = {left: 10, top: 68, width: 1480, height: 833};
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const targetStyle = (target: TargetRect, zoom: number, pulse: number): React.CSSProperties => ({
  position: 'absolute',
  left: target.x / 1920 * content.width,
  top: target.y / 1080 * content.height,
  width: target.width / 1920 * content.width,
  height: target.height / 1080 * content.height,
  border: '3px solid #f1c453',
  boxShadow: `0 0 0 5px rgba(241,196,83,${0.16 + pulse * 0.12}), 0 0 32px rgba(241,196,83,${0.22 + pulse * 0.2})`,
  borderRadius: 8,
  transform: `scale(${1 + (zoom - 1) * 0.12 + pulse * 0.012})`,
  transformOrigin: 'center',
});

export const WalkthroughBrowser: React.FC<WalkthroughBrowserProps> = ({step, localMs, domain}) => {
  const afterOpacity = step.screenshotBefore ? clamp01((localMs - 260) / 690) : 1;
  const zoom = interpolate(localMs, [0, 900, 1500], [1, step.zoom ?? 1, step.zoom ?? 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const target = step.targetRect;
  const targetCenter = target ? {x: target.x + target.width / 2, y: target.y + target.height / 2} : {x: 960, y: 540};
  const focusPulse = (Math.sin(localMs / 420) + 1) / 2;

  return (
    <div style={{position: 'absolute', left: 245, top: 38, width: 1500, height: 940, border: '5px solid #16212b', borderRadius: 18, background: '#fffdf8', boxShadow: '14px 16px 0 rgba(22,33,43,.14)', overflow: 'hidden'}}>
      <div style={{height: 58, display: 'flex', alignItems: 'center', gap: 11, padding: '0 22px', background: '#16212b', color: '#fffdf8', fontFamily: 'Consolas, monospace', fontSize: 18}}>
        <span style={{width: 14, height: 14, borderRadius: 99, background: '#c9573e'}} />
        <span style={{width: 14, height: 14, borderRadius: 99, background: '#f1c453'}} />
        <span style={{width: 14, height: 14, borderRadius: 99, background: '#5f8750'}} />
        <span style={{marginLeft: 16, padding: '9px 18px', minWidth: 500, borderRadius: 7, background: 'rgba(255,255,255,.11)', color: '#d9e4e3'}}>{domain}</span>
      </div>
      <div style={{position: 'absolute', left: content.left, top: content.top, width: content.width, height: content.height, overflow: 'hidden', background: '#eef3f1'}}>
        <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${targetCenter.x / 1920 * 100}% ${targetCenter.y / 1080 * 100}%`}}>
          {step.screenshotBefore && <Img src={staticFile(step.screenshotBefore)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill', opacity: 1 - afterOpacity}} />}
          <Img src={staticFile(step.screenshotAfter)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill', opacity: step.screenshotBefore ? afterOpacity : 1}} />
          {target && <div style={targetStyle(target, zoom, focusPulse)} />}
        </div>
      </div>
      <div style={{position: 'absolute', right: 24, bottom: 20, color: '#5a6570', fontFamily: 'Consolas, monospace', fontSize: 14}}>STEP / {step.id}</div>
    </div>
  );
};
