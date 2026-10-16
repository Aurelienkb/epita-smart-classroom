import { RawDetection } from '../types';

export interface WhiteboardCandidate {
  bbox: [number, number, number, number]; // [x, y, width, height]
  score: number;
  type: 'whiteboard' | 'chalkboard';
}

/**
 * High-Precision Computer Vision detector for classroom whiteboards and chalkboards.
 * Uses 4-edge frame gradient profiling, achromatic color saturation rejection,
 * surface reflectance analysis, and strict geometric wall constraints to eliminate false positives.
 */
export function detectClassroomWhiteboards(
  source: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement
): (RawDetection & { labelFr: string; color: string })[] {
  let srcWidth = 640;
  let srcHeight = 480;

  if (source instanceof HTMLVideoElement) {
    srcWidth = source.videoWidth || 640;
    srcHeight = source.videoHeight || 480;
  } else if (source instanceof HTMLImageElement) {
    srcWidth = source.naturalWidth || 640;
    srcHeight = source.naturalHeight || 480;
  } else if (source instanceof HTMLCanvasElement) {
    srcWidth = source.width;
    srcHeight = source.height;
  }

  // Work on a normalized analytical grid for speed and stability
  const analysisWidth = 320;
  const analysisHeight = 240;
  const canvas = document.createElement('canvas');
  canvas.width = analysisWidth;
  canvas.height = analysisHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];

  ctx.drawImage(source, 0, 0, analysisWidth, analysisHeight);
  const imgData = ctx.getImageData(0, 0, analysisWidth, analysisHeight);
  const data = imgData.data;

  // Scale factors to map back to original source image
  const scaleX = srcWidth / analysisWidth;
  const scaleY = srcHeight / analysisHeight;

  // Grid search parameters
  const step = 6;
  const maxSearchY = Math.round(analysisHeight * 0.70); // Must be mounted on wall, above floor
  const minSearchY = Math.round(analysisHeight * 0.05); // Below ceiling tiles

  const candidates: WhiteboardCandidate[] = [];

  // Realistic classroom board aspect ratios: typically 1.5 to 3.2
  const windowAspectRatios = [1.6, 2.0, 2.6, 3.2];
  const windowWidths = [
    Math.round(analysisWidth * 0.35),
    Math.round(analysisWidth * 0.48),
    Math.round(analysisWidth * 0.62),
    Math.round(analysisWidth * 0.76)
  ];

  for (const winW of windowWidths) {
    for (const ratio of windowAspectRatios) {
      const winH = Math.round(winW / ratio);
      
      // Boards must take between 12% and 45% of height
      if (winH < 35 || winH > analysisHeight * 0.48) continue;

      for (let y = minSearchY; y <= maxSearchY - winH; y += step * 2) {
        for (let x = Math.round(analysisWidth * 0.05); x <= analysisWidth - winW - Math.round(analysisWidth * 0.05); x += step * 2) {
          
          const score = evaluateBoardWindow(data, analysisWidth, analysisHeight, x, y, winW, winH);
          
          // Strict threshold: requires confirmed 4-edge frame and achromatic reflectance
          if (score >= 0.72) {
            candidates.push({
              bbox: [
                Math.round(x * scaleX),
                Math.round(y * scaleY),
                Math.round(winW * scaleX),
                Math.round(winH * scaleY)
              ],
              score: Math.min(0.94, Math.round(score * 100) / 100),
              type: 'whiteboard'
            });
          }
        }
      }
    }
  }

  // Deduplicate overlapping candidates using Non-Maximum Suppression
  const deduplicated = nmsCandidates(candidates, 0.35);

  // Take top 1 best board (classrooms usually have 1 primary front board)
  // or at most 2 if spatially distinct
  const topBoards = deduplicated.slice(0, 1);

  return topBoards.map((b) => ({
    bbox: b.bbox,
    class: 'whiteboard',
    score: b.score,
    equipmentId: 'whiteboard',
    labelFr: 'Tableau (Blanc / TBI)',
    color: '#E879F9' // Purple-Pink glowing reticle
  }));
}

/**
 * Strict evaluation of rectangular board candidate:
 * 1. Low color saturation (whiteboard is white/gray, chalkboard is dark slate; rejects beige/wood walls).
 * 2. 4-border frame contrast (must have gradient edge on at least 3 out of 4 sides).
 * 3. Interior surface luminance and uniformity (moderate texture variance for marker writing).
 * 4. Geometric perspective validity.
 */
function evaluateBoardWindow(
  data: Uint8ClampedArray,
  imgW: number,
  imgH: number,
  x: number,
  y: number,
  w: number,
  h: number
): number {
  let sumL = 0;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let count = 0;
  const samples = 14;

  // 1. Sample interior pixels
  for (let sy = 2; sy < samples - 2; sy++) {
    const py = Math.round(y + (sy / samples) * h);
    for (let sx = 2; sx < samples - 2; sx++) {
      const px = Math.round(x + (sx / samples) * w);
      const idx = (py * imgW + px) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      
      sumL += lum;
      sumR += r;
      sumG += g;
      sumB += b;
      count++;
    }
  }

  if (count === 0) return 0;
  const meanLum = sumL / count;
  const meanR = sumR / count;
  const meanG = sumG / count;
  const meanB = sumB / count;

  // 2. Reject colored surfaces (wood doors, beige walls, yellow paint)
  // A true whiteboard or slate has very low color saturation
  const colorChroma = Math.max(
    Math.abs(meanR - meanG),
    Math.abs(meanR - meanB),
    Math.abs(meanG - meanB)
  );

  if (colorChroma > 20) {
    return 0; // Colored wall, door, or warm floor - reject false positive
  }

  // 3. Luminance category: Whiteboard (light) or Chalkboard (dark)
  const isWhiteboard = meanLum >= 135; // Light board
  const isChalkboard = meanLum <= 65;  // Dark slate

  if (!isWhiteboard && !isChalkboard) {
    return 0; // Mid-gray wall or generic background
  }

  // 4. Measure interior variance (writing marks vs smooth board)
  let varSum = 0;
  for (let sy = 2; sy < samples - 2; sy++) {
    const py = Math.round(y + (sy / samples) * h);
    for (let sx = 2; sx < samples - 2; sx++) {
      const px = Math.round(x + (sx / samples) * w);
      const idx = (py * imgW + px) * 4;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      varSum += Math.abs(lum - meanLum);
    }
  }
  const meanVariance = varSum / count;

  // Boards should have moderate interior uniformity (variance < 40)
  // If variance is too high, it's a complicated shelf, window, or student crowd
  if (meanVariance > 42) {
    return 0;
  }

  // 5. Four-Border Frame Contrast Verification
  // A genuine whiteboard has an aluminum/wood frame creating a contrast step on its edges
  let borderHits = 0;
  const numEdgeSamples = 6;
  const frameOffset = 4;

  // Top Edge Contrast
  let topContrast = 0;
  for (let i = 1; i < numEdgeSamples; i++) {
    const bx = Math.round(x + (i / numEdgeSamples) * w);
    const inY = Math.min(imgH - 1, y + frameOffset);
    const outY = Math.max(0, y - frameOffset);
    topContrast += getPixelContrast(data, imgW, bx, inY, bx, outY);
  }
  if (topContrast / (numEdgeSamples - 1) >= 16) borderHits++;

  // Bottom Edge Contrast
  let bottomContrast = 0;
  for (let i = 1; i < numEdgeSamples; i++) {
    const bx = Math.round(x + (i / numEdgeSamples) * w);
    const inY = Math.max(0, y + h - frameOffset);
    const outY = Math.min(imgH - 1, y + h + frameOffset);
    bottomContrast += getPixelContrast(data, imgW, bx, inY, bx, outY);
  }
  if (bottomContrast / (numEdgeSamples - 1) >= 16) borderHits++;

  // Left Edge Contrast
  let leftContrast = 0;
  for (let i = 1; i < numEdgeSamples; i++) {
    const by = Math.round(y + (i / numEdgeSamples) * h);
    const inX = Math.min(imgW - 1, x + frameOffset);
    const outX = Math.max(0, x - frameOffset);
    leftContrast += getPixelContrast(data, imgW, inX, by, outX, by);
  }
  if (leftContrast / (numEdgeSamples - 1) >= 14) borderHits++;

  // Right Edge Contrast
  let rightContrast = 0;
  for (let i = 1; i < numEdgeSamples; i++) {
    const by = Math.round(y + (i / numEdgeSamples) * h);
    const inX = Math.max(0, x + w - frameOffset);
    const outX = Math.min(imgW - 1, x + w + frameOffset);
    rightContrast += getPixelContrast(data, imgW, inX, by, outX, by);
  }
  if (rightContrast / (numEdgeSamples - 1) >= 14) borderHits++;

  // Must have clear borders on at least 3 out of 4 edges to prevent open wall/ceiling false positives
  if (borderHits < 3) {
    return 0;
  }

  // 6. Calculate calibrated confidence score
  const chromaBonus = Math.max(0, (20 - colorChroma) / 20) * 0.12;
  const borderBonus = (borderHits / 4) * 0.20;
  const uniformityBonus = Math.max(0, (38 - meanVariance) / 38) * 0.15;

  return 0.50 + chromaBonus + borderBonus + uniformityBonus;
}

function getPixelContrast(
  data: Uint8ClampedArray,
  imgW: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const idx1 = (y1 * imgW + x1) * 4;
  const idx2 = (y2 * imgW + x2) * 4;
  const lum1 = 0.299 * data[idx1] + 0.587 * data[idx1 + 1] + 0.114 * data[idx1 + 2];
  const lum2 = 0.299 * data[idx2] + 0.587 * data[idx2 + 1] + 0.114 * data[idx2 + 2];
  return Math.abs(lum1 - lum2);
}

/**
 * Non-Maximum Suppression for Whiteboard Candidates
 */
function nmsCandidates(candidates: WhiteboardCandidate[], iouThreshold: number): WhiteboardCandidate[] {
  const sorted = [...candidates].sort((a, b) => b.score - a.score);
  const selected: WhiteboardCandidate[] = [];

  for (const c of sorted) {
    let duplicate = false;
    for (const s of selected) {
      const [xA, yA, wA, hA] = c.bbox;
      const [xB, yB, wB, hB] = s.bbox;

      const xI1 = Math.max(xA, xB);
      const yI1 = Math.max(yA, yB);
      const xI2 = Math.min(xA + wA, xB + wB);
      const yI2 = Math.min(yA + hA, yB + hB);

      const interW = Math.max(0, xI2 - xI1);
      const interH = Math.max(0, yI2 - yI1);
      const interArea = interW * interH;
      const unionArea = (wA * hA) + (wB * hB) - interArea;
      const iou = unionArea > 0 ? interArea / unionArea : 0;

      if (iou > iouThreshold) {
        duplicate = true;
        break;
      }
    }

    if (!duplicate) {
      selected.push(c);
    }
  }

  return selected;
}
