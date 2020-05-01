import moment from 'moment';

import {
  IBooking,
  IWorkSchedule,
  IDaySchedule,
} from 'model/schedule';

import {
  isSaturday,
  isSunday,
  isWithinTimeSlot,
  getThirtyMinuteIntervalsAsDateTimes,
} from './date';
import { pickOneAtRandom } from './random';

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

/**
 * Finds all 30-minute interval that are within working hours of a schedule,
 * do not fall within a break, and do not collide with any existing booking.
 * @param day The day's existing schedule
 */
const getAvailableSlotTimes = (day: IDaySchedule): moment.Moment[] => {
  if (day.schedule == null) {
    return [];
  }

  return getThirtyMinuteIntervalsAsDateTimes(
    day.date, day.schedule.workDayFrom.hour(), day.schedule.workDayTo.hours()
  ).filter(
    (slot) => !isWithinTimeSlot(slot, day.schedule!.breakFrom, day.schedule!.breakTo),
  ).filter(
    (slot) => !day.bookings.some((booking) => booking.from.isSame(slot, 'minute')),
  );
}

/**
 * Fills a calendar schedule with random bookings by "not current user".
 * It will throw an exception if it is impossible to find a booking.
 * Respects previous bookings and breaks.
 *
 * Does not mutate the original, and works recursively, since it's much easier to filter
 * available slots that way than via nested loops :)
 * @param days Schedule for some number of days
 * @param count How many bookings do we wish to have.
 */
export const fillWithRandomBookings = (daySchedules: IDaySchedule[], count: number): IDaySchedule[] => {
  if (count <= 0) {
    return daySchedules;
  }

  const candidates = daySchedules.flatMap((daySchedule) => getAvailableSlotTimes(daySchedule));

  if (candidates.length === 0) {
    throw new Error('No available slots left to generate random booking!');
  }

  const bookingDate = pickOneAtRandom(candidates);
  const booking: IBooking = {
    from: bookingDate.clone(),
    isByCurrentUser: false,
    to: bookingDate.clone().add(30, 'minutes'),
  };

  // Update the day for which the schedule was selected with a new booking
  const updatedSchedules = daySchedules.map((schedule) => {
    if (schedule.date.isSame(booking.from, 'date')) {
      console.log('updating for', booking.from.format('ddd HH:mm'));
      return {
        ...schedule,
        bookings: [...schedule.bookings, booking],
      };
    }

    return schedule;
  });

  return fillWithRandomBookings(updatedSchedules, count - 1);
}