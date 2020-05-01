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

export const BOOKING_DURATION_MINUTES: number = 30;
export const BREAK_DURATION_MINUTES: number = 30;
export const SHIFT_DURATION_HOURS: number = 6;

const getEvenDaySchedule = (date: moment.Moment): IWorkSchedule => {
  const shiftStart = date.clone().set('hours', 8).set('minutes', 0);
  const breakStart = date.clone().set('hours', 11).set('minutes', 0);

  return {
    workDayFrom: shiftStart,
    workDayTo: shiftStart.clone().add(SHIFT_DURATION_HOURS, 'hours'),
    breakFrom: breakStart,
    breakTo: breakStart.clone().add(BREAK_DURATION_MINUTES, 'minutes'),
  };
}

const getOddDaySchedule = (date: moment.Moment): IWorkSchedule => {
  const shiftStart = date.clone().set('hours', 13).set('minutes', 0);
  const breakStart = date.clone().set('hours', 16).set('minutes', 0);

  return {
    workDayFrom: shiftStart,
    workDayTo: shiftStart.clone().add(SHIFT_DURATION_HOURS, 'hours'),
    breakFrom: breakStart,
    breakTo: breakStart.clone().add(BREAK_DURATION_MINUTES, 'minutes'),
  };
};

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
    (slot) => isWithinTimeSlot(slot, day.schedule!.workDayFrom, day.schedule!.workDayTo)
  ).filter(
    (slot) => !isWithinTimeSlot(slot, day.schedule!.breakFrom, day.schedule!.breakTo),
  ).filter(
    (slot) => !day.bookings.some((booking) => booking.from.isSame(slot, 'minute')),
  );
}

export const createBooking = (at: moment.Moment, isByCurrentUser: boolean): IBooking => ({
  from: at.clone(),
  isByCurrentUser,
  to: at.clone().add(BOOKING_DURATION_MINUTES, 'minutes'),
});

/**
 * Update existing multi-day schedule by inserting a booking.
 * Does not mutate the original, returning a copy instead.
 * Does not validate for collision, the responsibility for that is on the caller.
 *
 * @param schedules Existing schedules for some number of days.
 * @param booking New booking
 */
export const updateWithBooking = (schedules: IDaySchedule[], booking: IBooking): IDaySchedule[] =>
  schedules.map((schedule) => {
    if (schedule.date.isSame(booking.from, 'date')) {
      return {
        ...schedule,
        bookings: [...schedule.bookings, booking],
      };
    }

    return schedule;
  });

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
  const booking = createBooking(bookingDate, false);
  const updatedSchedules = updateWithBooking(daySchedules, booking);

  return fillWithRandomBookings(updatedSchedules, count - 1);
}