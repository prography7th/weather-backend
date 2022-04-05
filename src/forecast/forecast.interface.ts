export interface Report {
  maxTmp?: number;
  minTmp?: number;
}

export interface Time {
  date: string;
  time: string;
  sky: number;
  tmp: number;
  pop: number;
}

export interface WeatherData {
  report: Report;
  timeline: Time[];
}
