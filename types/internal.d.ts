export interface FrameData {
  d1: {
    headerName: string;
    distance: number;
  };
  d2: {
    headerName: string;
    distance: number;
  };
}

export interface InterpolatedDataItem {
  element: any;
  frameIndex: number;
  frameValue: number;
  newRank: number;
  rank: number;
}

export declare class DataFrame {
  index: number;
  data: FrameData;
  transitionFrames: number;
  totalFrames: number;
  sort: boolean;
  idata?: InterpolatedDataItem[];

  constructor(index: number, data: FrameData, totalFrames: number);

  interpolateData(data: any[]): InterpolatedDataItem[];

  static generateAllFrames(
    newData: any[],
    col_relValues: string[],
    totalFrames: number,
    withSort?: boolean
  ): DataFrame[];

  static createFramesFromData(
    dataArray: any[],
    valueHeaders: string[],
    totalFrames: number
  ): DataFrame[];
}

export declare class ChartConfig {
  constructor();
  setConfig(chartConfig: any): void;
  getConfig(): any;
}

export interface TimelineClickResult {
  clicked: boolean;
  changeState: boolean;
  changePosition: boolean;
  seekPosition: number;
}

export interface TimelineOptions {
  width?: number;
  height?: number;
}

export declare class Timeline {
  state: boolean;

  constructor(canvas: any);

  checkClick(x: number, y: number, options?: TimelineOptions): TimelineClickResult;

  draw(progress: number, options?: TimelineOptions): void;
}

export declare class Axis {
  constructor(canvas: any, width: number, height: number, config: any);

  static calculate(config: any, data: any[], col_rel: any, frames: DataFrame[]): void;
} 