/**
 * Options for initializing RaceColumns
 */
export interface RaceColumnsOptions {
  [key: string]: any;
}

/**
 * Column relationship configuration
 */
export interface ColRel {
  /** Column name containing labels/categories */
  labels: string;
  /** Array of column names containing values for animation frames */
  values: string[];
  /** Optional column name containing image paths */
  images?: string;
}

/**
 * Chart configuration options
 */
export interface ChartConfigOptions {
  /** Color palette configuration */
  palette?: {
    colors: string[];
  };
  [key: string]: any;
}

/**
 * Legend item interface
 */
export interface LegendItem {
  label: string;
  color: string;
}

/**
 * Callback function for chart events
 */
export interface EventCallback {
  (event: { 
    event: "seek" | "play"; 
    value: number | boolean 
  }): void;
}

/**
 * Image loader function for Node.js environments
 */
export interface ImageLoader {
  (imagePath: string): Promise<any>;
}

/**
 * Canvas-like interface that works with both HTML Canvas and node-canvas
 */
export interface CanvasLike {
  width: number;
  height: number;
  getContext(contextId: '2d'): CanvasRenderingContext2D | null;
  addEventListener?(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions): void;
}

/**
 * Data row interface for race columns data
 */
export interface DataRow {
  [key: string]: any;
  // Internal properties added by the library
  _imagesrc?: any;
  rank?: number;
  currentRank?: number;
  destinationRank?: number;
  transitionSpeed?: number;
}

/**
 * Main RaceColumns class for creating animated racing bar/column charts
 * 
 * @example
 * ```typescript
 * import { RaceColumns } from '@proai/canvas-receipts';
 * 
 * const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
 * const raceChart = new RaceColumns(canvas, {});
 * 
 * // Configure data relationships
 * raceChart.changeColRel({
 *   labels: 'name',
 *   values: ['2020', '2021', '2022', '2023']
 * });
 * 
 * // Load your data
 * const data = [
 *   { name: 'Company A', '2020': 100, '2021': 150, '2022': 200, '2023': 250 },
 *   { name: 'Company B', '2020': 80, '2021': 120, '2022': 180, '2023': 220 }
 * ];
 * 
 * raceChart.changeData(data);
 * 
 * // Render frame by frame
 * raceChart.redner(0); // Render first frame
 * ```
 */
export declare class RaceColumns {
  /** The canvas element */
  canvas: CanvasLike;
  /** Chart options */
  options: RaceColumnsOptions;
  /** Animation state flag */
  aniamationState: boolean;

  /**
   * Create a new RaceColumns instance
   * @param canvas Canvas element (HTML Canvas or node-canvas)
   * @param options Optional configuration
   */
  constructor(canvas: CanvasLike, options?: RaceColumnsOptions);

  /**
   * Initialize the race columns chart
   */
  init(): void;

  /**
   * Handle click events on the canvas (browser only)
   * @param event Mouse event
   */
  clickHandler(event: MouseEvent): void;

  /**
   * Set callback function for chart events (seek/play)
   * @param callback Function to handle events
   */
  setEventsCallback(callback: EventCallback): void;

  /**
   * Change the data for the chart
   * @param newData Array of data objects
   */
  changeData(newData: DataRow[]): void;

  /**
   * Load images asynchronously for Node.js environment
   * @param loader Function that loads images from paths
   */
  loadImages(loader: ImageLoader): Promise<void>;

  /**
   * Configure column relationships
   * @param col_rel Column relationship configuration
   */
  changeColRel(col_rel: ColRel): void;

  /**
   * Update chart configuration
   * @param newConfig New configuration options
   */
  changeConfig(newConfig: ChartConfigOptions): void;

  /**
   * Update canvas dimensions
   * @param w New width
   * @param h New height
   */
  changeSize(w: number, h: number): void;

  /**
   * Initialize chart axis (internal method)
   */
  initAxis(): void;

  /**
   * Render a specific animation frame
   * @param frameIndex Frame index to render (0 to totalFrames-1)
   */
  redner(frameIndex: number): Promise<void>;
}

// Re-export internal types for advanced usage
export * from './types/internal';

export default RaceColumns; 