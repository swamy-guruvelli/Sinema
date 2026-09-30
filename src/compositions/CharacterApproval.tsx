import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import characterAssets from '../data/characterAssets.json';
import {COLORS, fontStack, utilityFontStack} from '../components/theme';

export type CharacterApprovalAsset = {
  id: string;
  file: string;
  label: string;
  role: string;
};

export type CharacterApprovalManifest = {
  version: number;
  status: 'pending' | 'approved';
  approvedAt: string | null;
  assets: Array<{id: string; sha256: string}>;
};

export type CharacterApprovalProps = {
  approval: CharacterApprovalManifest;
};

const assets = characterAssets as CharacterApprovalAsset[];
const APPROVAL_PAGE_SIZE = 4;
const APPROVAL_PAGE_DURATION = 30;

export const getCharacterApprovalDuration = () => Math.max(1, Math.ceil(assets.length / APPROVAL_PAGE_SIZE) * APPROVAL_PAGE_DURATION);

const statusCopy = (approval: CharacterApprovalManifest, inventoryMatchesApproval: boolean) => {
  if (approval.status === 'approved' && inventoryMatchesApproval) {
    return {
      label: 'APPROVED FOR RENDER',
      color: COLORS.green,
      detail: `Approved ${approval.approvedAt ?? 'without a timestamp'}`,
    };
  }
  if (approval.status === 'approved' && !inventoryMatchesApproval) {
    return {
      label: 'REVIEW REQUIRED',
      color: COLORS.terracotta,
      detail: 'The visual asset inventory changed since approval. Re-scan and approve the full set again.',
    };
  }
  return {
    label: 'APPROVAL REQUIRED',
    color: COLORS.terracotta,
    detail: 'Inspect every visual asset, then run npm.cmd run approve:characters.',
  };
};

const AssetCard: React.FC<{asset: CharacterApprovalAsset; index: number; approved: boolean}> = ({asset, index, approved}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      minHeight: 0,
      height: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden',
      padding: 14,
      background: COLORS.white,
      border: `3px solid ${approved ? COLORS.green : COLORS.ink}`,
      boxShadow: '8px 9px 0 rgba(22,33,43,0.14)',
      transform: `rotate(${index % 2 === 0 ? -0.5 : 0.6}deg)`,
    }}
  >
    <div style={{position: 'relative', flex: 1, height: 0, minHeight: 0, background: COLORS.paper, overflow: 'hidden'}}>
      <Img
        src={staticFile(asset.file)}
        alt={asset.label}
        style={{width: '100%', height: '100%', objectFit: 'contain', display: 'block'}}
      />
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          padding: '6px 8px',
          color: COLORS.white,
          background: approved ? COLORS.green : COLORS.terracotta,
      fontFamily: utilityFontStack,
          fontWeight: 900,
          fontSize: 12,
          letterSpacing: 1.2,
        }}
      >
        {approved ? 'LOCKED' : 'REVIEW'}
      </div>
    </div>
    <div style={{paddingTop: 12, color: COLORS.ink, fontFamily: fontStack, fontSize: 22, fontWeight: 900}}>{asset.label}</div>
    <div style={{paddingTop: 4, color: COLORS.mutedInk, fontFamily: utilityFontStack, fontSize: 13, fontWeight: 700, letterSpacing: 1}}>{asset.role.toUpperCase()}</div>
  </div>
);

export const CharacterApproval: React.FC<CharacterApprovalProps> = ({approval}) => {
  const frame = useCurrentFrame();
  const pageCount = Math.max(1, Math.ceil(assets.length / APPROVAL_PAGE_SIZE));
  const pageIndex = Math.min(pageCount - 1, Math.floor(frame / APPROVAL_PAGE_DURATION));
  const pageAssets = assets.slice(pageIndex * APPROVAL_PAGE_SIZE, (pageIndex + 1) * APPROVAL_PAGE_SIZE);
  const approvedIds = new Set(approval.assets.map(({id}) => id));
  const inventoryMatchesApproval = approval.assets.length === assets.length && assets.every((asset) => approvedIds.has(asset.id));
  const status = statusCopy(approval, inventoryMatchesApproval);
  const columns = pageAssets.length <= 1 ? '1fr' : pageAssets.length === 2 ? '1fr 1fr' : '1fr 1fr';

  return (
    <AbsoluteFill
      style={{
        boxSizing: 'border-box',
        padding: '34px 54px 30px',
        overflow: 'hidden',
        color: COLORS.ink,
        fontFamily: fontStack,
        backgroundColor: COLORS.cream,
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(22,33,43,0.022) 0 1px, transparent 1px 7px)',
      }}
    >
      <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32}}>
        <div>
          <div style={{color: COLORS.terracotta, fontFamily: utilityFontStack, fontSize: 15, fontWeight: 900, letterSpacing: 3}}>SAMITHGATH / VISUAL ASSET SYSTEM</div>
          <div style={{marginTop: 8, fontSize: 47, lineHeight: 0.98, fontWeight: 900}}>Approve the assets before rendering.</div>
          <div style={{marginTop: 10, color: COLORS.mutedInk, fontFamily: utilityFontStack, fontSize: 16, fontWeight: 700}}>Fresh PNG inventory • deterministic Remotion pipeline • no scene render until locked</div>
        </div>
          <div style={{minWidth: 330, padding: '15px 18px', border: `4px solid ${status.color}`, color: status.color, background: 'rgba(255,253,247,0.8)', transform: 'rotate(1deg)'}}>
          <div style={{fontFamily: utilityFontStack, fontSize: 16, fontWeight: 900, letterSpacing: 1.5}}>{status.label}</div>
          <div style={{marginTop: 8, color: COLORS.ink, fontFamily: utilityFontStack, fontSize: 13, lineHeight: 1.35, fontWeight: 700}}>{status.detail}</div>
          {assets.length > 0 && <div style={{marginTop: 7, color: status.color, fontFamily: utilityFontStack, fontSize: 12, fontWeight: 900, letterSpacing: 1}}>PAGE {pageIndex + 1} / {pageCount}</div>}
        </div>
      </div>

      {assets.length === 0 ? (
        <div style={{display: 'grid', placeItems: 'center', flex: 1, marginTop: 30, border: `4px dashed ${COLORS.terracotta}`, background: 'rgba(255,253,247,0.65)'}}>
          <div style={{textAlign: 'center', maxWidth: 760}}>
            <div style={{fontSize: 42, fontWeight: 900}}>No visual assets registered yet.</div>
            <div style={{marginTop: 16, color: COLORS.mutedInk, fontFamily: utilityFontStack, fontSize: 19, lineHeight: 1.45, fontWeight: 700}}>Place fresh images under <code>public/assets</code>, then run <code>npm.cmd run assets:scan</code> and render this board again.</div>
          </div>
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: columns, gridTemplateRows: pageAssets.length > 2 ? '1fr 1fr' : '1fr', gap: 22, flex: 1, minHeight: 0, marginTop: 28}}>
          {pageAssets.map((asset, index) => <AssetCard key={asset.id} asset={asset} index={index} approved={approvedIds.has(asset.id)} />)}
        </div>
      )}

      <div style={{display: 'flex', justifyContent: 'space-between', gap: 20, marginTop: 20, color: COLORS.mutedInk, fontFamily: utilityFontStack, fontSize: 13, fontWeight: 900, letterSpacing: 1.2}}>
        <span>{assets.length} VISUAL ASSET{assets.length === 1 ? '' : 'S'} REGISTERED</span>
        <span>REVIEW BOARD ONLY / LONG RENDERS ARE GATED</span>
      </div>
    </AbsoluteFill>
  );
};
