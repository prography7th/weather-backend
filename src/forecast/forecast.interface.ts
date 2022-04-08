import { IFinedustSummary } from '@app/finedust/finedust.interface';

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
