import * as moment from 'moment';

export interface IBooking {
  from: moment.Moment;
  to: moment.Moment;
  isByCurrentUser: boolean;
}

export interface IWorkSchedule {
  workDayFrom: moment.Moment;
  workDayTo: moment.Moment;
  breakFrom: moment.Moment;
  breakTo: moment.Moment;
}

export interface IDaySchedule {
  date: moment.Moment; // Redundant, but allows for easier managing of dates
  schedule?: IWorkSchedule;
  bookings: IBooking[];
}

export enum Availability {
  NotWorking,
  OnBreak,
  ReservedByOther,
  ReservedByUser,
  Available,
}
