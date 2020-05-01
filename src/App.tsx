import React from 'react';
import moment from 'moment';
import { toast } from 'react-toastify';

import { WeekCalendar } from 'components/Calendar/WeekCalendar';
import {
  Availability,
  IBooking,
  IDaySchedule,
} from 'model/schedule';
import { getNDays } from 'utils/date';
import {
  fillWithRandomBookings,
  getSchedule,
  createBooking,
  updateWithBooking,
} from 'utils/schedule';

import styles from './App.module.css';

const SHOW_DAYS: number = 7;
const NUMBER_OF_PREMADE_BOOKINGS: number = 15;
const MAX_BOOKINGS_PER_WEEK: number = 2;
const MAX_BOOKINGS_PER_DAY: number = 1;

interface IAppState {
  schedules: IDaySchedule[];
}

toast.configure(); // Initialise notifications

export class App extends React.PureComponent<{}, IAppState> {
  public state: IAppState = {
    schedules: [],
  }

  public componentDidMount() {
    this.setState({
      schedules: this.getWeeklySchedule(),
    });
  }

  public render() {
    return (
      <div className={styles.App}>
        <WeekCalendar
          className={styles.Calendar}
          startsFrom={this.getTomorrow()}
          showsDays={SHOW_DAYS}
          title='Schedule Your Appointment'
          onSegmentClick={this.onReserve}
          schedules={this.state.schedules}
        />
      </div>
    );
  }

  private getTomorrow = (): moment.Moment =>
    moment().add(1, 'days');

  private getWeeklySchedule = (): IDaySchedule[] => {
    const dates = getNDays(this.getTomorrow(), SHOW_DAYS)
    const emptySchedules =  dates.map((date: moment.Moment): IDaySchedule =>({
      bookings: [],
      date,
      schedule: getSchedule(date),
    }));

    return fillWithRandomBookings(emptySchedules, NUMBER_OF_PREMADE_BOOKINGS);
  }

  private onReserve = (bookingTime: moment.Moment, availability: Availability) => {
    if (availability === Availability.Available) {
      const userBookings = this.getUserBookings();
      const userBookingsToday = userBookings.filter((booking) => booking.from.isSame(bookingTime, 'day'));

      if (userBookings.length >= MAX_BOOKINGS_PER_WEEK) {
        toast(
          `You cannot make more than ${MAX_BOOKINGS_PER_WEEK} booking(s) a week. Please schedule your appointment on another week!`,
          { type: 'warning' },
        );
      } else if (userBookingsToday.length >= MAX_BOOKINGS_PER_DAY) {
        toast(
          `You cannot make more than ${MAX_BOOKINGS_PER_DAY} booking(s) a day. Please schedule your appointment on another day`,
          { type: 'warning' },
        );
      } else {
        const booking: IBooking = createBooking(bookingTime, true);
        this.addBooking(booking);
      }
    } else {
      toast('This time slot is not available!', { type: 'info' });
    }
  }

  private addBooking = (booking: IBooking) => {
    const schedules = updateWithBooking(this.state.schedules, booking);

    this.setState({ schedules });
  }

  private getUserBookings = (): IBooking[] =>
    this.state.schedules.flatMap(_ => _.bookings).filter((it) => it.isByCurrentUser);
}
