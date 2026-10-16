import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { RawDetection, EquipmentId } from '../types';
import { mapCocoClassToEquipmentId, EQUIPMENT_CATALOG } from '../data/equipmentCatalog';
import { detectClassroomWhiteboards } from './whiteboardDetector';

export interface DetectionOutput {
  detections: (RawDetection & { labelFr: string; color: string })[];
  counts: Record<EquipmentId, number>;
  averageConfidenceByEquipment: Record<EquipmentId, number>;
  totalCount: number;
  filteredPersonsCount: number;
  inferenceTimeMs: number;
  sahiEnabled?: boolean;
}

export type ModelStatus = 'unloaded' | 'loading' | 'ready' | 'error';

interface RawPredictionBox {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

class VisionAIService {
  private model: cocoSsd.ObjectDetection | null = null;
  private status: ModelStatus = 'unloaded';
  private errorMessage: string = '';
  private loadingPromise: Promise<void> | null = null;

  public getStatus(): ModelStatus {
    return this.status;
  }

  public getErrorMessage(): string {
    return this.errorMessage;
  }

  /**
   * Initializes TensorFlow.js and loads the pre-trained COCO-SSD model.
   * Leverages WebGL acceleration with fallback to CPU.
   */
  public async loadModel(): Promise<void> {
    if (this.status === 'ready' && this.model) {
      return;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.status = 'loading';
    this.errorMessage = '';

    this.loadingPromise = (async () => {
      try {
        await tf.ready();
        console.log(`[EPITA SmartScan] TensorFlow backend active: ${tf.getBackend()}`);

        // Load COCO-SSD with mobilenet_v2
        this.model = await cocoSsd.load({
          base: 'mobilenet_v2'
        });

        this.status = 'ready';
        console.log('[EPITA SmartScan] COCO-SSD model loaded successfully.');
      } catch (err: unknown) {
        console.error('[EPITA SmartScan] Failed to load COCO-SSD model:', err);
        this.status = 'error';
        this.errorMessage = err instanceof Error 
          ? err.message 
          : 'Erreur inconnue lors du chargement du modèle de vision artificielle.';
        throw err;
      } finally {
        this.loadingPromise = null;
      }
    })();

    return this.loadingPromise;
  }

  /**
   * Preprocesses image with adaptive lighting & edge enhancement
   * to maximize neural network activations in low-contrast classroom settings.
   */
  private preprocessImage(
    source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    boost: boolean
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    let width = 640;
    let height = 480;

    if (source instanceof HTMLVideoElement) {
      width = source.videoWidth || 640;
      height = source.videoHeight || 480;
    } else if (source instanceof HTMLImageElement) {
      width = source.naturalWidth || 640;
      height = source.naturalHeight || 480;
    } else if (source instanceof HTMLCanvasElement) {
      width = source.width;
      height = source.height;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    if (boost) {
      // Apply contrast, brightness and sharpness enhancement
      ctx.filter = 'contrast(1.20) brightness(1.06) saturate(1.10)';
    }

    ctx.drawImage(source, 0, 0, width, height);
    return canvas;
  }

  /**
   * Computes Intersection over Union (IoU) between two bounding boxes
   */
  private calculateIoU(
    boxA: [number, number, number, number],
    boxB: [number, number, number, number]
  ): number {
    const [xA1, yA1, wA, hA] = boxA;
    const [xB1, yB1, wB, hB] = boxB;

    const xA2 = xA1 + wA;
    const yA2 = yA1 + hA;
    const xB2 = xB1 + wB;
    const yB2 = yB1 + hB;

    const xInter1 = Math.max(xA1, xB1);
    const yInter1 = Math.max(yA1, yB1);
    const xInter2 = Math.min(xA2, xB2);
    const yInter2 = Math.min(yA2, yB2);

    const interW = Math.max(0, xInter2 - xInter1);
    const interH = Math.max(0, yInter2 - yInter1);
    const interArea = interW * interH;

    const areaA = wA * hA;
    const areaB = wB * hB;
    const unionArea = areaA + areaB - interArea;

    return unionArea > 0 ? interArea / unionArea : 0;
  }

  /**
   * Non-Maximum Suppression (NMS) to eliminate duplicate boxes across global & slice passes
   */
  private applyNMS(predictions: RawPredictionBox[], iouThreshold: number = 0.45): RawPredictionBox[] {
    // Sort descending by score
    const sorted = [...predictions].sort((a, b) => b.score - a.score);
    const selected: RawPredictionBox[] = [];

    for (const candidate of sorted) {
      let isDuplicate = false;
      for (const existing of selected) {
        if (existing.class.toLowerCase() === candidate.class.toLowerCase()) {
          const iou = this.calculateIoU(candidate.bbox, existing.bbox);
          if (iou > iouThreshold) {
            isDuplicate = true;
            break;
          }
        }
      }
      if (!isDuplicate) {
        selected.push(candidate);
      }
    }

    return selected;
  }

  /**
   * Executes Slicing Aided Hyper Inference (SAHI) on high-resolution classroom photos.
   * Divides the image into overlapping quadrants to allow small distant furniture
   * to be analyzed at 4x resolution by the neural network.
   */
  private async runSahiInference(
    source: HTMLCanvasElement,
    minConfidence: number
  ): Promise<{ predictions: RawPredictionBox[]; filteredPersons: number }> {
    if (!this.model) throw new Error('Model not initialized');

    const width = source.width;
    const height = source.height;
    let filteredPersons = 0;
    const allPredictions: RawPredictionBox[] = [];

    // Pass 1: Global inference on full image (for large foreground items)
    const globalPreds = await this.model.detect(source, 60, minConfidence);
    for (const p of globalPreds) {
      if (p.class.toLowerCase() === 'person') {
        filteredPersons++;
      } else {
        allPredictions.push(p);
      }
    }

    // Pass 2: Define 4 overlapping quadrants (58% width/height to ensure 16% central overlap)
    const sliceWidth = Math.round(width * 0.58);
    const sliceHeight = Math.round(height * 0.58);

    const slices = [
      { x: 0, y: 0, w: sliceWidth, h: sliceHeight }, // Top-Left
      { x: width - sliceWidth, y: 0, w: sliceWidth, h: sliceHeight }, // Top-Right
      { x: 0, y: height - sliceHeight, w: sliceWidth, h: sliceHeight }, // Bottom-Left
      { x: width - sliceWidth, y: height - sliceHeight, w: sliceWidth, h: sliceHeight }, // Bottom-Right
    ];

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = sliceWidth;
    sliceCanvas.height = sliceHeight;
    const sliceCtx = sliceCanvas.getContext('2d');

    if (sliceCtx) {
      for (const slice of slices) {
        sliceCtx.clearRect(0, 0, sliceWidth, sliceHeight);
        sliceCtx.drawImage(
          source,
          slice.x, slice.y, slice.w, slice.h,
          0, 0, sliceWidth, sliceHeight
        );

        // Run inference on zoomed tile
        const tilePreds = await this.model.detect(sliceCanvas, 50, minConfidence);
        for (const p of tilePreds) {
          if (p.class.toLowerCase() === 'person') {
            filteredPersons++;
          } else {
            // Translate coordinates back to full image canvas
            const [localX, localY, boxW, boxH] = p.bbox;
            allPredictions.push({
              class: p.class,
              score: p.score,
              bbox: [localX + slice.x, localY + slice.y, boxW, boxH]
            });
          }
        }
      }
    }

    // Apply Non-Maximum Suppression to deduplicate
    const deduplicated = this.applyNMS(allPredictions, 0.42);

    return {
      predictions: deduplicated,
      filteredPersons
    };
  }

  /**
   * Executes object detection on an image, canvas, or video element.
   * Supports both Standard and High-Resolution SAHI (Tiled) detection.
   */
  public async detect(
    imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    minConfidence: number = 0.28,
    boostEnhancement: boolean = true,
    enableSahi: boolean = true
  ): Promise<DetectionOutput> {
    if (!this.model) {
      await this.loadModel();
    }

    if (!this.model) {
      throw new Error('Le modèle de détection d\'objets n\'est pas disponible.');
    }

    const startTime = performance.now();

    // Prepare preprocessed canvas
    const inputCanvas = this.preprocessImage(imageSource, boostEnhancement);

    let rawPredictions: RawPredictionBox[] = [];
    let filteredPersonsCount = 0;

    if (enableSahi) {
      // Execute multi-quadrant SAHI inference for massive recall boost on distant chairs
      const sahiResult = await this.runSahiInference(inputCanvas, minConfidence);
      rawPredictions = sahiResult.predictions;
      filteredPersonsCount = sahiResult.filteredPersons;
    } else {
      // Standard single-pass inference
      const basePreds = await this.model.detect(inputCanvas, 100, minConfidence);
      for (const p of basePreds) {
        if (p.class.toLowerCase() === 'person') {
          filteredPersonsCount++;
        } else {
          rawPredictions.push(p);
        }
      }
    }

    const endTime = performance.now();
    const inferenceTimeMs = Math.round(endTime - startTime);

    const detections: (RawDetection & { labelFr: string; color: string })[] = [];
    const counts: Record<EquipmentId, number> = {
      chair: 0,
      table: 0,
      laptop: 0,
      screen: 0,
      keyboard: 0,
      mouse: 0,
      book: 0,
      whiteboard: 0,
      window: 0,
      projector: 0
    };

    const confidenceSum: Record<EquipmentId, number> = {
      chair: 0,
      table: 0,
      laptop: 0,
      screen: 0,
      keyboard: 0,
      mouse: 0,
      book: 0,
      whiteboard: 0,
      window: 0,
      projector: 0
    };

    for (const pred of rawPredictions) {
      const className = pred.class.toLowerCase();

      // Ethical safeguard
      if (className === 'person') {
        continue;
      }

      const eqId = mapCocoClassToEquipmentId(className) as EquipmentId | null;
      if (!eqId) {
        continue;
      }

      const catalogItem = EQUIPMENT_CATALOG[eqId];
      const color = eqId === 'chair' ? '#38D9E6' 
                  : eqId === 'table' ? '#60A5FA' 
                  : eqId === 'laptop' ? '#34D399' 
                  : eqId === 'screen' ? '#A78BFA' 
                  : '#FBBF24';

      detections.push({
        bbox: pred.bbox,
        class: pred.class,
        score: pred.score,
        equipmentId: eqId,
        labelFr: catalogItem ? catalogItem.labelFr : pred.class,
        color
      });

      counts[eqId] = (counts[eqId] || 0) + 1;
      confidenceSum[eqId] = (confidenceSum[eqId] || 0) + pred.score;
    }

    // Integrate specialized classroom whiteboard detector (wall contour & reflectance)
    const detectedWhiteboards = detectClassroomWhiteboards(inputCanvas);
    for (const wb of detectedWhiteboards) {
      detections.push(wb);
      counts.whiteboard = (counts.whiteboard || 0) + 1;
      confidenceSum.whiteboard = (confidenceSum.whiteboard || 0) + wb.score;
    }

    const averageConfidenceByEquipment: Record<EquipmentId, number> = {} as any;
    for (const key of Object.keys(counts) as EquipmentId[]) {
      averageConfidenceByEquipment[key] = counts[key] > 0 
        ? Math.round((confidenceSum[key] / counts[key]) * 100) 
        : 0;
    }

    return {
      detections,
      counts,
      averageConfidenceByEquipment,
      totalCount: detections.length,
      filteredPersonsCount,
      inferenceTimeMs,
      sahiEnabled: enableSahi
    };
  }

  public dispose(): void {
    if (this.model) {
      this.model = null;
      this.status = 'unloaded';
    }
  }
}

export const visionAIService = new VisionAIService();
