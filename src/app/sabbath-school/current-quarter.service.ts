import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CurrentQuarterService {
  /**
   * Returns the current quarter ID, e.g., "2026-02".
   *
   * Quarters are:
   *  Q1 (01): January - March
   *  Q2 (02): April - June
   *  Q3 (03): July - September
   *  Q4 (04): October - December
   */
  yearAndQuarter(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const quarter = Math.floor((month - 1) / 3) + 1;

    return `${year}-${quarter.toString().padStart(2, '0')}`;
  }
}
