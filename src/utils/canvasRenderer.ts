import { RawDetection } from '../types';

export function renderBoundingBoxes(
  canvas: HTMLCanvasElement,
  imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  detections: (RawDetection & { labelFr: string; color: string })[],
  scaleToDisplay: boolean = true
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Determine native source dimensions
  let srcWidth = 0;
  let srcHeight = 0;

  if (imageSource instanceof HTMLVideoElement) {
    srcWidth = imageSource.videoWidth;
    srcHeight = imageSource.videoHeight;
  } else if (imageSource instanceof HTMLImageElement) {
    srcWidth = imageSource.naturalWidth;
    srcHeight = imageSource.naturalHeight;
  } else if (imageSource instanceof HTMLCanvasElement) {
    srcWidth = imageSource.width;
    srcHeight = imageSource.height;
  }

  if (!srcWidth || !srcHeight) {
    srcWidth = canvas.width || 640;
    srcHeight = canvas.height || 480;
  }

  // Set canvas internal resolution to source resolution
  canvas.width = srcWidth;
  canvas.height = srcHeight;

  // Clear canvas
  ctx.clearRect(0, 0, srcWidth, srcHeight);

  // Draw base image
  ctx.drawImage(imageSource, 0, 0, srcWidth, srcHeight);

  // Optical dark vignette around edges for focus
  const gradient = ctx.createRadialGradient(
    srcWidth / 2, srcHeight / 2, Math.min(srcWidth, srcHeight) * 0.4,
    srcWidth / 2, srcHeight / 2, Math.max(srcWidth, srcHeight) * 0.7
  );
  gradient.addColorStop(0, 'rgba(11, 16, 32, 0)');
  gradient.addColorStop(1, 'rgba(11, 16, 32, 0.4)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, srcWidth, srcHeight);

  // Render each bounding box
  detections.forEach((det, idx) => {
    const [x, y, width, height] = det.bbox;
    const color = det.color || '#38D9E6';
    const scorePct = Math.round(det.score * 100);

    // Box stroke
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, Math.round(srcWidth / 350));
    ctx.strokeRect(x, y, width, height);

    // Semi-transparent box background fill
    ctx.fillStyle = hexToRgba(color, 0.08);
    ctx.fillRect(x, y, width, height);

    // Corner brackets (reticle optic style)
    const cornerLen = Math.min(width, height) * 0.2;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(3, Math.round(srcWidth / 250));

    // Top-left
    ctx.beginPath();
    ctx.moveTo(x, y + cornerLen);
    ctx.lineTo(x, y);
    ctx.lineTo(x + cornerLen, y);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(x + width - cornerLen, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + cornerLen);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(x, y + height - cornerLen);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x + cornerLen, y + height);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(x + width - cornerLen, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width, y + height - cornerLen);
    ctx.stroke();

    // Badge label at top of box
    const labelText = `${det.labelFr} · ${scorePct}%`;
    const fontSize = Math.max(12, Math.round(srcWidth / 55));
    ctx.font = `600 ${fontSize}px Inter, sans-serif`;

    const textMetrics = ctx.measureText(labelText);
    const badgePaddingX = 8;
    const badgeHeight = fontSize + 10;
    const badgeWidth = textMetrics.width + badgePaddingX * 2;

    const badgeX = x;
    const badgeY = y > badgeHeight + 4 ? y - badgeHeight - 2 : y + 2;

    // Badge background
    ctx.fillStyle = '#0B1020';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 4);
    ctx.fill();

    // Badge border
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Indicator dot
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(badgeX + 8, badgeY + badgeHeight / 2, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Text
    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, badgeX + 16, badgeY + badgeHeight / 2);

    ctx.restore();
  });
}

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
