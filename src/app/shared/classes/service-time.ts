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
  ): { [key: string]: string } {
    const serviceTimes = {
      startHour: moment().set({ hour: start[0], minute: start[1] }).startOf('minutes'),
      endHour: moment().set({ hour: end[0], minute: end[1] }).startOf('minutes')
    };

    const formattedServiceTimes: { [key: string]: string } = {};
    for (const key of Object.keys(serviceTimes)) {
      let value: moment.Moment = serviceTimes[key];
      if (shouldApplyDST) {
        value = this.applyDSTChange(value);
      }

      formattedServiceTimes[key] = value.format('HH:mm');
    }

    return formattedServiceTimes;
  }
}
