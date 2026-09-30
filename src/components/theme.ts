import styleSystem from '../../brand/style-system.json';

export const COLORS = {
  ...styleSystem.colors,
};

export const fontStack = styleSystem.typography.body;
export const utilityFontStack = styleSystem.typography.utility;
export const STYLE_SYSTEM_VERSION = styleSystem.version;
export const SAFE_MARGIN = styleSystem.safeMargin;
export const MOTION = styleSystem.motion;
export const BOARD_STYLES = styleSystem.boards;
