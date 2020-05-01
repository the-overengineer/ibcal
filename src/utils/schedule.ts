import moment from 'moment';

import { IWorkSchedule } from 'model/schedule';
import { isSunday, isSaturday } from './date';

const getEvenDaySchedule = (date: moment.Moment): IWorkSchedule => ({
  workDayFrom: date.clone().set('hours', 8).set('minute', 0),
  workDayTo: date.clone().set('hours', 14).set('minute', 0),
  breakFrom: date.clone().set('hours', 11).set('minute', 0),
  breakTo: date.clone().set('hours', 11).set('minute', 30),
});

const getOddDaySchedule = (date: moment.Moment): IWorkSchedule => ({
  workDayFrom: date.clone().set('hours', 13).set('minute', 0),
  workDayTo: date.clone().set('hours', 19).set('minute', 0),
  breakFrom: date.clone().set('hours', 16).set('minute', 0),
  breakTo: date.clone().set('hours', 16).set('minute', 30),
});

export const getSchedule = (date: moment.Moment): IWorkSchedule | undefined => {
  const dayOfMonth = date.date();
  const isOddDay = dayOfMonth % 2 === 1;

  if (isSunday(date)) {
    return;
  }

  if (isSaturday(date) && isOddDay) {
    return;
  }

  return isOddDay
    ? getOddDaySchedule(date)
    : getEvenDaySchedule(date);
};