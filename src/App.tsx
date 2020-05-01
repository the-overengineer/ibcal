import React from 'react';
import moment from 'moment';

import { WeekCalendar } from 'components/Calendar/WeekCalendar';

import styles from './App.module.css';
import { Availability, IDaySchedule } from 'model/schedule';
import { getNDays } from 'utils/date';
import { getSchedule, fillWithRandomBookings } from 'utils/schedule';

const SHOW_DAYS: number = 7;
const NUMBER_OF_PREMADE_BOOKINGS: number = 15;

interface IAppState {
  schedules: IDaySchedule[];
}

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

  private onReserve = (dateTime: moment.Moment, availability: Availability) =>
    console.log(dateTime, availability); // tslint:disable-line no-console
}
