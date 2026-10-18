import { Injectable } from '@angular/core';
import moment from 'moment-timezone';

import { CHURCH_TIME_ZONE } from '../../shared/constants/church-time';

/**
 * Calculates the start and end times for church services,
 * taking into account Daylight Saving
 */
@Injectable({ providedIn: 'root' })
export class WorshipTimeService {
  isDaylightSaving(): boolean {
    return moment().tz(CHURCH_TIME_ZONE).isDST();
  }

  getTime(hour: number, minute: number): moment.Moment {
    return moment().set({ hour, minute }).startOf('minutes');
  }
}
