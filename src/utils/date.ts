import moment from 'moment';
import { leftPad } from './string';

const SATURDAY: number = 6;
const SUNDAY: number = 7;

export const earliestDateByTimeUnit = (dateTimes: moment.Moment[], unit: moment.unitOfTime.All): moment.Moment | undefined =>
  dateTimes.reduce(
    (earliest: moment.Moment | undefined, current: moment.Moment) => earliest == null || current.get(unit) < earliest.get(unit) ? current : earliest,
    undefined,
  );

export const latestDateByTimeUnit = (dateTimes: moment.Moment[], unit: moment.unitOfTime.All): moment.Moment | undefined =>
  dateTimes.reduce(
    (latest: moment.Moment | undefined, current: moment.Moment) => latest == null || current.get(unit) > latest.get(unit) ? current : latest,
    undefined,
  );

export const getThirtyMinuteIntervals = (startingHour: number, endingHour: number): string[] => {
  const numberOfSegments = 2 * (endingHour - startingHour + 1);
  return Array(numberOfSegments)
    .fill(startingHour)
    .map((originalHour, index) => originalHour + Math.floor(index / 2))
    .map((hour, index) => `${leftPad(hour, 2, '0')}:${index % 2 === 0 ? '00' : '30'}`);
}

export const getThirtyMinuteIntervalsAsDateTimes = (date: moment.Moment, startingHour: number, endingHour: number): moment.Moment[] =>
  getThirtyMinuteIntervals(startingHour, endingHour)
    .map((formattedTime) => {
      const [hours, minutes] = formattedTime.split(':').map((num) => parseInt(num, 10));
      return date.clone().set('hours', hours).set('minutes', minutes);
    });

export const getNDays = (startingDate: moment.Moment, count: number): moment.Moment[] =>
  Array(count).fill(startingDate.clone().set('hours', 0).set('minutes', 0)).map(
    (date: moment.Moment, index: number) => date.clone().add(index, 'days'),
  );

export const isWithinRange = (dateTime: moment.Moment, from: moment.Moment, to: moment.Moment): boolean =>
    dateTime.isSameOrAfter(from, 'minutes') && dateTime.isBefore(to, 'minutes');

export const isWorkDay = (date: moment.Moment): boolean =>
  date.isoWeekday() < SATURDAY;

export const isSaturday = (date: moment.Moment): boolean =>
  date.isoWeekday() === SATURDAY;

export const isSunday = (date: moment.Moment): boolean =>
  date.isoWeekday() === SUNDAY;
