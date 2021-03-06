import classNames from 'classnames';
import moment from 'moment';
import React from 'react';

import {
  Availability,
  IDaySchedule,
} from 'model/schedule';
import {
  getThirtyMinuteIntervalsAsDateTimes,
  isWithinTimeSlot,
} from 'utils/date';

import styles from './Calendar.module.css';

interface IDay {
  date: moment.Moment;
  fromHour: number;
  toHour: number;
  schedule?: IDaySchedule;
  onSegmentClick: (dateTime: moment.Moment, availability: Availability) => void;
}

export class Day extends React.PureComponent<IDay> {
  public render() {
    const {
      date,
      fromHour,
      toHour,
    } = this.props;

    const segments = getThirtyMinuteIntervalsAsDateTimes(date, fromHour, toHour);

    return (
      <div className={styles.Day}>
        <div className={styles.DayName}>{date.format('ddd')}</div>
        {
          segments.map((segment) => (
            <div
              key={segment.toString()}
              title={this.getText(segment)}
              className={classNames(styles.DaySegment, this.getAdditionalStyles(segment))}
              onClick={() => this.onClick(segment)}
            />
          ))
        }
      </div>
    );
  }

  private getAvailability = (dateTime: moment.Moment): Availability => {
    const { schedule } = this.props;
    if (schedule == null || schedule.schedule == null) {
      return Availability.NotWorking;
    }

    const workingHours = schedule.schedule!;
    const bookings = schedule.bookings;

    if (!isWithinTimeSlot(dateTime, workingHours.workDayFrom, workingHours.workDayTo)) {
      return Availability.NotWorking;
    }

    if (isWithinTimeSlot(dateTime, workingHours.breakFrom, workingHours.breakTo)) {
      return Availability.OnBreak;
    }

    const existingBooking = bookings.find((booking) => booking.from.isSame(dateTime, 'minutes'));

    if (existingBooking) {
      return existingBooking.isByCurrentUser
        ? Availability.ReservedByUser
        : Availability.ReservedByOther;
    }

    return Availability.Available;
  }

  private getAdditionalStyles = (dateTime: moment.Moment): string => {
    const availability = this.getAvailability(dateTime);

    switch (availability) {
      case Availability.NotWorking: return styles.NotWorking;
      case Availability.OnBreak: return styles.OnBreak;
      case Availability.ReservedByUser: return styles.ReservedByUser;
      case Availability.ReservedByOther: return styles.ReservedByOther;
      default: return styles.Available;
    }
  }

  private getText = (dateTime: moment.Moment): string | undefined => {
    const availability = this.getAvailability(dateTime);

    switch (availability) {
      case Availability.NotWorking: return 'We are not open';
      case Availability.OnBreak: return 'We are on break';
      case Availability.ReservedByOther: return 'Slot already taken';
      case Availability.ReservedByUser: return `Your booking at ${dateTime.format('HH:mm')}`;
      default: return;
    }
  }

  private onClick = (dateTime: moment.Moment) =>
    this.props.onSegmentClick(dateTime, this.getAvailability(dateTime))
}
