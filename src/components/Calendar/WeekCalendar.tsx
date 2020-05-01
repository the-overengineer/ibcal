import classNames from 'classnames';
import moment from 'moment';
import React from 'react';

import {
  IDaySchedule,
  Availability,
} from 'model/schedule';
import { earliestDateTime, latestDateTime, getNDays } from 'utils/date';

import { HourList } from './HourList';
import { Day } from './Day';

import styles from './Calendar.module.css';

// Time padding (in hours) to use before opening and after closing hours for nicer UI
const TIME_PADDING_HOURS: number = 2;

interface IWeekCalendar {
  className?: string;
  startsFrom: moment.Moment;
  showsDays: number;
  schedules: IDaySchedule[];
  title: string;
  onSegmentClick: (dateTime: moment.Moment, availability: Availability) => void;
}

export class WeekCalendar extends React.PureComponent<IWeekCalendar> {
  public render() {
    const {
      className,
      title,
      onSegmentClick,
    } = this.props;

    const weekDates = this.getWeekDates();
    const startingHour = this.getStartingHour();
    const endingHour = this.getEndingHour()

    return (
      <div className={classNames(styles.WeekCalendar, className)}>
        <div className={styles.Title}>{title}</div>
        <div className={styles.Columns}>
          <HourList
            startingHour={startingHour}
            endingHour={endingHour}
          />
          <div className={styles.Days}>
            {
              weekDates.map((date) => (
                <Day
                  key={date.toString()}
                  date={date}
                  fromHour={startingHour}
                  toHour={endingHour}
                  onSegmentClick={onSegmentClick}
                />
              ))
            }
          </div>
        </div>
      </div>
    );
  }

  private getWeekDates = () =>
    getNDays(this.props.startsFrom, this.props.showsDays)

  private getStartingHour = () => {
    const { schedules } = this.props;
    const allStartingHours = schedules
      .map((schedule: IDaySchedule) => schedule.schedule?.workDayFrom)
      .filter((time) => time != null) as moment.Moment[];

    const earliestHour = earliestDateTime(allStartingHours)?.hour() ?? 0;
    return Math.max(earliestHour - TIME_PADDING_HOURS, 0);
  }

  private getEndingHour = () => {
    const { schedules } = this.props;
    const allStartingHours = schedules
      .map((schedule: IDaySchedule) => schedule.schedule?.workDayFrom)
      .filter((time) => time != null) as moment.Moment[];

    const latestHour = latestDateTime(allStartingHours)?.hour() ?? 24;
    return Math.max(latestHour + TIME_PADDING_HOURS, 0);
  }
}