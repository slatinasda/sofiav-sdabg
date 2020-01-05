import * as moment from 'moment-timezone';

/**
 * Calculates the start and end times for church services,
 * taking into account Daylight Saving
 */
export class ServiceTime {
  timeZone: string;

  constructor(timeZone = 'Europe/Sofia') {
    this.timeZone = timeZone;
  }

  isDaylightSaving(): boolean {
    return moment().tz(this.timeZone).isDST();
  }

  /**
   * Daylight Saving Time - Summer Time
   * How it applies - Spring forward, Fall back.
   */
  applyDSTChange(time: moment.Moment): moment.Moment {
    if (this.isDaylightSaving()) {
      return time.add(1, 'hours');
    }

    return time;
  }

  getTime(hour: number, minute: number): moment.Moment {
    return moment().set({ hour: hour, minute: minute }).startOf('minutes');
  }

  getTimeDST(hour: number, minute: number): moment.Moment {
    return this.applyDSTChange(this.getTime(hour, minute));
  }
}
