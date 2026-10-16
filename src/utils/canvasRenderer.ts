import { InteractiveDetection } from '../types';
import { EQUIPMENT_CATALOG } from '../data/equipmentCatalog';

export function renderBoundingBoxes(
  canvas: HTMLCanvasElement,
  imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  detections: InteractiveDetection[],
  selectedId?: string | null
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
  gradient.addColorStop(1, 'rgba(11, 16, 32, 0.45)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, srcWidth, srcHeight);

  // Render each bounding box
  detections.forEach((det) => {
    const [x, y, width, height] = det.bbox;
    const isSelected = selectedId === det.id;
    const scorePct = Math.round(det.score * 100);

    // Color and styling based on Interactive Review status
    let color = det.color || '#38D9E6';
    let statusPrefix = '';
    let isDashed = false;
    let opacity = 1.0;

    if (det.status === 'confirmed') {
      color = '#34D399'; // Emerald
      statusPrefix = '✓ Validé · ';
    } else if (det.status === 'rejected') {
      color = '#F87171'; // Red
      statusPrefix = '✕ Rejeté · ';
      isDashed = true;
      opacity = 0.35;
    } else if (det.status === 'reclassified') {
      color = '#FBBF24'; // Amber
      const currentCat = EQUIPMENT_CATALOG[det.currentEquipmentId];
      statusPrefix = `⚡ ${currentCat ? currentCat.labelFr.split('/')[0] : ''} · `;
    }

    if (isSelected) {
      color = '#38D9E6';
      opacity = 1.0;
    }

    ctx.save();
    ctx.globalAlpha = opacity;

    // Selection Glow
    if (isSelected) {
      ctx.shadowColor = '#38D9E6';
      ctx.shadowBlur = 18;
    }

    // Box stroke
    ctx.strokeStyle = color;
    ctx.lineWidth = isSelected ? Math.max(3, Math.round(srcWidth / 250)) : Math.max(2, Math.round(srcWidth / 350));
    
    if (isDashed) {
      ctx.setLineDash([8, 6]);
    } else {
      ctx.setLineDash([]);
    }

    ctx.strokeRect(x, y, width, height);

    // Semi-transparent box background fill
    ctx.fillStyle = hexToRgba(color, isSelected ? 0.16 : 0.08);
    ctx.fillRect(x, y, width, height);

    // Corner brackets (reticle optic style)
    if (!isDashed) {
      const cornerLen = Math.min(width, height) * 0.22;
      ctx.strokeStyle = color;
      ctx.lineWidth = isSelected ? Math.max(4, Math.round(srcWidth / 200)) : Math.max(3, Math.round(srcWidth / 280));

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
    }

    // Badge label at top of box
    const currentCat = EQUIPMENT_CATALOG[det.currentEquipmentId];
    const displayLabel = currentCat ? currentCat.labelFr.split('/')[0] : det.labelFr;
    const labelText = `${statusPrefix}${displayLabel} · ${scorePct}%`;
    const fontSize = Math.max(12, Math.round(srcWidth / 55));
    ctx.font = `${isSelected ? '700' : '600'} ${fontSize}px Inter, sans-serif`;

    const textMetrics = ctx.measureText(labelText);
    const badgePaddingX = 8;
    const badgeHeight = fontSize + 10;
    const badgeWidth = textMetrics.width + badgePaddingX * 2;

    const badgeX = x;
    const badgeY = y > badgeHeight + 4 ? y - badgeHeight - 2 : y + 2;

    // Badge background
    ctx.fillStyle = '#0B1020';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 5);
    ctx.fill();

    // Badge border
    ctx.strokeStyle = color;
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    ctx.stroke();

    // Indicator dot
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(badgeX + 8, badgeY + badgeHeight / 2, isSelected ? 4 : 3, 0, Math.PI * 2);
    ctx.fill();

    // Text
    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, badgeX + 16, badgeY + badgeHeight / 2);

    ctx.restore();
  });
}

/**
 * Finds the detection containing the tapped/clicked (clientX, clientY) point.
 * Accurately translates viewport CSS pixels to canvas internal resolution.
 * Selects the smallest enclosing box if multiple boxes overlap.
 */
export function getDetectionAtPoint(
  canvas: HTMLCanvasElement,
  detections: InteractiveDetection[],
  clientX: number,
  clientY: number
): InteractiveDetection | null {
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;

  // Scale client coordinates to internal canvas resolution
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const clickX = (clientX - rect.left) * scaleX;
  const clickY = (clientY - rect.top) * scaleY;

  // Find all boxes containing this point
  const matching = detections.filter((d) => {
    const [x, y, w, h] = d.bbox;
    return clickX >= x && clickX <= x + w && clickY >= y && clickY <= y + h;
  });

  if (matching.length === 0) return null;

  // Pick the smallest box (most specific nested object)
  matching.sort((a, b) => {
    const areaA = a.bbox[2] * a.bbox[3];
    const areaB = b.bbox[2] * b.bbox[3];
    return areaA - areaB;
  });

  return matching[0];
}

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
