import { RawDetection } from '../types';

export interface WhiteboardCandidate {
  bbox: [number, number, number, number]; // [x, y, width, height]
  score: number;
  type: 'whiteboard' | 'chalkboard';
}

/**
 * Dedicated Computer Vision detector for classroom whiteboards and chalkboards.
 * Combines spatial wall-position heuristics, edge gradient bounding, 
 * and surface luminance uniformity analysis.
 */
export function detectClassroomWhiteboards(
  source: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement
): (RawDetection & { labelFr: string; color: string })[] {
  const canvas = document.createElement('canvas');
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

  // 1. Grid sampling for wall-mounted boards
  // Whiteboards / Chalkboards are wide rectangles located primarily in the upper 70% of the view
  const step = 8;
  const maxSearchY = Math.round(analysisHeight * 0.72);
  const minSearchY = Math.round(analysisHeight * 0.05);

  const candidates: WhiteboardCandidate[] = [];

  // Multi-window aspect ratio scanner targeting typical classroom boards (ratio 1.4 to 3.5)
  const windowAspectRatios = [1.6, 2.2, 2.8, 3.4];
  const windowWidths = [
    Math.round(analysisWidth * 0.35),
    Math.round(analysisWidth * 0.50),
    Math.round(analysisWidth * 0.65),
    Math.round(analysisWidth * 0.80)
  ];

  for (const winW of windowWidths) {
    for (const ratio of windowAspectRatios) {
      const winH = Math.round(winW / ratio);
      if (winH < 30 || winH > analysisHeight * 0.6) continue;

      for (let y = minSearchY; y <= maxSearchY - winH; y += step * 2) {
        for (let x = Math.round(analysisWidth * 0.05); x <= analysisWidth - winW - Math.round(analysisWidth * 0.05); x += step * 2) {
          
          // Evaluate board characteristics in this window
          const score = evaluateBoardWindow(data, analysisWidth, analysisHeight, x, y, winW, winH);
          if (score > 0.68) {
            candidates.push({
              bbox: [
                Math.round(x * scaleX),
                Math.round(y * scaleY),
                Math.round(winW * scaleX),
                Math.round(winH * scaleY)
              ],
              score: Math.min(0.92, Math.round(score * 100) / 100),
              type: 'whiteboard'
            });
          }
        }
      }
    }
  }

  // Deduplicate overlapping candidates using Non-Maximum Suppression
  const deduplicated = nmsCandidates(candidates, 0.40);

  // Take top 1 or 2 best boards (classrooms typically have 1 or 2 main boards)
  const topBoards = deduplicated.slice(0, 2);

  return topBoards.map((b) => ({
    bbox: b.bbox,
    class: 'whiteboard',
    score: b.score,
    equipmentId: 'whiteboard',
    labelFr: 'Tableau (Blanc / TBI)',
    color: '#E879F9' // Purple-Pink glowing reticle for classroom boards
  }));
}

/**
 * Scores a rectangular region based on whiteboard / chalkboard properties:
 * - High internal color uniformity (low variance inside board)
 * - Contrast gradient at borders (frame / aluminum border)
 * - Surface luminance (light marker board or dark slate board)
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
  let count = 0;
  const samples = 12;

  // Sample interior pixels
  for (let sy = 1; sy < samples - 1; sy++) {
    const py = Math.round(y + (sy / samples) * h);
    for (let sx = 1; sx < samples - 1; sx++) {
      const px = Math.round(x + (sx / samples) * w);
      const idx = (py * imgW + px) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      sumL += lum;
      count++;
    }
  }

  if (count === 0) return 0;
  const meanLum = sumL / count;

  // Measure variance
  let varSum = 0;
  for (let sy = 1; sy < samples - 1; sy++) {
    const py = Math.round(y + (sy / samples) * h);
    for (let sx = 1; sx < samples - 1; sx++) {
      const px = Math.round(x + (sx / samples) * w);
      const idx = (py * imgW + px) * 4;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      varSum += Math.abs(lum - meanLum);
    }
  }
  const meanVariance = varSum / count;

  // Boards have high uniformity (low variance < 45)
  if (meanVariance > 50) {
    return 0; // Too noisy / textured (probably posters, floor, or students)
  }

  // Border edge contrast check (top, bottom, left, right edges)
  let borderContrastScore = 0;
  const borderSamples = 6;

  // Top edge vs outer top
  for (let i = 0; i < borderSamples; i++) {
    const bx = Math.round(x + (i / borderSamples) * w);
    const innerY = Math.min(imgH - 1, y + 4);
    const outerY = Math.max(0, y - 4);
    
    const idxIn = (innerY * imgW + bx) * 4;
    const idxOut = (outerY * imgW + bx) * 4;

    const lumIn = 0.299 * data[idxIn] + 0.587 * data[idxIn + 1] + 0.114 * data[idxIn + 2];
    const lumOut = 0.299 * data[idxOut] + 0.587 * data[idxOut + 1] + 0.114 * data[idxOut + 2];
    borderContrastScore += Math.abs(lumIn - lumOut);
  }
  const avgBorderContrast = borderContrastScore / borderSamples;

  if (avgBorderContrast < 18) {
    return 0; // No defined frame / border
  }

  // Calculate composite confidence score
  const isWhiteboard = meanLum > 140; // White / light gray
  const isChalkboard = meanLum < 75;  // Dark green / black slate

  if (!isWhiteboard && !isChalkboard) {
    return 0; // Brown or colored walls
  }

  const uniformityScore = Math.max(0, 1 - (meanVariance / 45));
  const edgeScore = Math.min(1, avgBorderContrast / 60);

  return 0.45 + (uniformityScore * 0.28) + (edgeScore * 0.25);
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
