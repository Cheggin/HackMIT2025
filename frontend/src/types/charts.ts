export interface PieChartSlice {
    slice: string;
    value: number;
  }
  
export interface PieChartData {
    slices: PieChartSlice[];
}

export interface BarChartBar {
    label: string;
    value: number;
}

export interface BarChartData {
    bars: BarChartBar[];
    x_axis_label?: string;
    y_axis_label?: string;
}

export interface LineChartPoint {
    time: number;
    value: number;
}

export interface LineChartData {
    points: LineChartPoint[];
    x_axis_label?: string;
    y_axis_label?: string;
}

export interface ScatterChartPoint {
    x: number;
    y: number;
}

export interface ScatterChartData {
    points: ScatterChartPoint[];
    x_axis_label?: string;
    y_axis_label?: string;
}

export interface AreaChartPoint {
    time: number;
    value: number;
}

export interface AreaChartData {
    points: AreaChartPoint[];
    x_axis_label?: string;
    y_axis_label?: string;
}

// Discriminated union for typed chart payloads returned from SQL transforms
export type AnyChartData =
  | { kind: 'pie'; data: PieChartData }
  | { kind: 'bar'; data: BarChartData; y_axis_label?: string }
  | { kind: 'line'; data: LineChartData; x_axis_label?: string; y_axis_label?: string }
  | { kind: 'area'; data: AreaChartData; x_axis_label?: string; y_axis_label?: string }
  | { kind: 'scatter'; data: ScatterChartData; x_axis_label?: string; y_axis_label?: string };

export function assertNever(x: never): never {
  throw new Error(`Unhandled chart kind: ${String(x)}`);
}
  