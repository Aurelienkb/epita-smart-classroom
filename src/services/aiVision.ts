import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { RawDetection, EquipmentId } from '../types';
import { mapCocoClassToEquipmentId, EQUIPMENT_CATALOG } from '../data/equipmentCatalog';

export interface DetectionOutput {
  detections: (RawDetection & { labelFr: string; color: string })[];
  counts: Record<EquipmentId, number>;
  averageConfidenceByEquipment: Record<EquipmentId, number>;
  totalCount: number;
  filteredPersonsCount: number;
  inferenceTimeMs: number;
}

export type ModelStatus = 'unloaded' | 'loading' | 'ready' | 'error';

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
        // Try WebGL backend first, fallback to CPU
        await tf.ready();
        console.log(`[EPITA SmartScan] TensorFlow backend active: ${tf.getBackend()}`);

        // Load COCO-SSD with lightweight mobilenet_v2 for fast browser inference
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
   * Executes object detection on an image, canvas, or video element.
   * Strictly filters out human detections for privacy compliance.
   */
  public async detect(
    imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    minConfidence: number = 0.40
  ): Promise<DetectionOutput> {
    if (!this.model) {
      await this.loadModel();
    }

    if (!this.model) {
      throw new Error('Le modèle de détection d\'objets n\'est pas disponible.');
    }

    const startTime = performance.now();
    
    // Execute real COCO-SSD inference
    const rawPredictions = await this.model.detect(imageSource, 30, minConfidence);
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

    let filteredPersonsCount = 0;

    for (const pred of rawPredictions) {
      const className = pred.class.toLowerCase();

      // MANDATORY PRIVACY FILTER:
      // Completely discard any person detection. Do not draw, count, or identify.
      if (className === 'person') {
        filteredPersonsCount++;
        continue;
      }

      const eqId = mapCocoClassToEquipmentId(className) as EquipmentId | null;
      if (!eqId) {
        // Detected object not relevant to classroom equipment (e.g. cup, cell phone outside standard classroom items)
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
      inferenceTimeMs
    };
  }

  /**
   * Release resources if needed
   */
  public dispose(): void {
    if (this.model) {
      this.model = null;
      this.status = 'unloaded';
    }
  }
}

// Singleton instance
export const visionAIService = new VisionAIService();
