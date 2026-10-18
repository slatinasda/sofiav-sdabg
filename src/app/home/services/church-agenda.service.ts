import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import moment from 'moment-timezone';

import { CurrentQuarterService } from '../../sabbath-school/current-quarter.service';
import { CHURCH_TIME_ZONE } from '../../shared/constants/church-time';
import { IChurchServiceAgenda } from '../interfaces/church-service-agenda.interface';
import serviceTimesJson from '../agenda/service-times.json';
import serviceTimesDSTJson from '../agenda/service-times-dst.json';
import { WorshipTimeService } from './worship-time.service';

type ServiceTimeKey =
  | 'fridayEveningSermonStart'
  | 'fridayEveningSermonEnd'
  | 'saturdayMorningSchoolStart'
  | 'saturdayMorningSchoolEnd'
  | 'saturdayMorningSermonStart'
  | 'saturdayMorningSermonEnd'
  | 'saturdayMorningStreamStart'
  | 'saturdayMorningStreamEnd'
  | 'saturdayEveningSermonStart'
  | 'saturdayEveningSermonEnd';

type ServiceTimes = Record<ServiceTimeKey, number[]>;

const serviceTimes = serviceTimesJson as ServiceTimes;
const serviceTimesDST = serviceTimesDSTJson as ServiceTimes;

@Injectable()
export class ChurchAgendaService {
  private readonly worshipTimeService = inject(WorshipTimeService);
  private readonly quarterService = inject(CurrentQuarterService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly isDaylightSaving = this.worshipTimeService.isDaylightSaving();

  private readonly agenda = this.buildAgenda();

  readonly saturdayMorningStreamStartTime = this.agenda.saturdayMorningStreamStart.format('HH:mm');

  readonly sabbathSchoolStartTime = this.agenda.saturdayMorningSchoolStart.format('HH:mm');

  readonly centralServiceStartTime = this.agenda.saturdayMorningSermonStart.format('HH:mm');

  readonly churchServiceAgenda = this.buildChurchServiceAgenda();

  isLiveNow(now: moment.Moment = moment().tz(CHURCH_TIME_ZONE)): boolean {
    if (now.day() !== 6) {
      return false;
    }

    const start = this.atAgendaTime(now, this.agenda.saturdayMorningStreamStart);
    const end = this.atAgendaTime(now, this.agenda.saturdayMorningStreamEnd);

    return now.isBetween(start, end, null, '[]');
  }

  private atAgendaTime(now: moment.Moment, time: moment.Moment): moment.Moment {
    return now.clone().startOf('day').hour(time.hour()).minute(time.minute());
  }

  private buildAgenda(): Record<ServiceTimeKey, moment.Moment> {
    const times = this.isDaylightSaving ? serviceTimesDST : serviceTimes;
    return Object.fromEntries(
      (Object.keys(times) as ServiceTimeKey[]).map((key) => [
        key,
        this.worshipTimeService.getTime(times[key][0], times[key][1]),
      ]),
    ) as Record<ServiceTimeKey, moment.Moment>;
  }

  private buildChurchServiceAgenda(): IChurchServiceAgenda[] {
    return [
      this.agendaItem(
        'Петък вечер',
        'Богослужение и молитвен час',
        this.agenda.fridayEveningSermonStart,
        this.agenda.fridayEveningSermonEnd,
        'fas fa-book',
      ),
      this.agendaItem(
        'Събота сутрин',
        this.sanitizer.bypassSecurityTrustHtml(
          `Групова дискусия върху <a href="/sabbath-school/${this.quarterService.yearAndQuarter()}">съботно училищния урок</a>`,
        ),
        this.agenda.saturdayMorningSchoolStart,
        this.agenda.saturdayMorningSchoolEnd,
        'fas fa-comments',
      ),
      this.agendaItem(
        'Събота сутрин',
        'Централно богослужение',
        this.agenda.saturdayMorningSermonStart,
        this.agenda.saturdayMorningSermonEnd,
        'fas fa-book-open',
      ),
      this.agendaItem(
        'Събота вечер',
        'Богослужение и молитвен час',
        this.agenda.saturdayEveningSermonStart,
        this.agenda.saturdayEveningSermonEnd,
        'fas fa-user-friends',
      ),
    ];
  }

  private agendaItem(
    day: string,
    label: string | SafeHtml,
    start: moment.Moment,
    end: moment.Moment,
    icon: string,
  ): IChurchServiceAgenda {
    return {
      day,
      label,
      time: { startHour: start.format('HH:mm'), endHour: end.format('HH:mm') },
      icon,
    };
  }
}
