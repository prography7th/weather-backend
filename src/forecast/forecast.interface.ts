import { IFinedustSummary } from '@app/finedust/finedust.interface';

export interface ShortInfo {
  baseDate: string;
  baseTime: string;
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
  nx: number;
  ny: number;
}

export interface Report {
  maxTmp?: number;
  minTmp?: number;
  maxPop?: {
    value: number;
    time: string;
  };
  fineDust?: IFinedustSummary;
}

export interface WeatherMetadata {
  date?: string;
  pop?: string;
  diff?: number;
  maxTmp?: number;
  minTmp?: number;
  time: string;
  sky: string;
  tmp: string;
  pty: string;
}

export interface Day {
  report: Report;
  timeline: WeatherMetadata[];
}

export interface TodayInfo {
  [key: string]: {
    report: Report;
    timeline: WeatherMetadata[];
  };
}
