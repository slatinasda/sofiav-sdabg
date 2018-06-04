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
   * How it applies - Spring forward, fall back.
   */
  applyDSTChange(time: moment.Moment): moment.Moment {
    if (this.isDaylightSaving()) {
      return time.add(1, 'hours');
    }

    return time;
  }

  calculate(
    start: [number, number],
    end: [number, number],
    shouldApplyDST: boolean = true
  ): { [key: string]: moment.Moment } {
    const serviceTimes = {
      startHour: moment().set({ hour: start[0], minute: start[1] }).startOf('minutes'),
      endHour: moment().set({ hour: end[0], minute: end[1] }).startOf('minutes')
    };

    Object.keys(serviceTimes).forEach((key: string) => {
      const time: moment.Moment = serviceTimes[key];
      serviceTimes[key] = shouldApplyDST ? this.applyDSTChange(time) : time;
    });

    return serviceTimes;
  }

  formatServiceTimes(
    serviceTimes: { [key: string]: moment.Moment },
    format: string = 'HH:mm'
  ): { [key: string]: string } {
    const formattedTimes = {};

    Object.keys(serviceTimes).forEach((key: string) => {
      formattedTimes[key] = serviceTimes[key].format(format);
    });

    return formattedTimes;
  }
}
