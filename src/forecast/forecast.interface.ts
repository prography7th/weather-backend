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

export interface Time {
  date: string;
  time: string;
  sky: number;
  tmp: number;
  pop: number;
}

export interface Day {
  report: Report;
  timeline: Time[];
}

export interface Weather {
  [key: string]: {
    report: Report;
    timeline: Time[];
  };
}
