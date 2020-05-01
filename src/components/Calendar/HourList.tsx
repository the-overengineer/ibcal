import React from 'react';

import { getThirtyMinuteIntervals } from 'utils/date';

import styles from './HourList.module.css';

interface IHourList {
  startingHour: number;
  endingHour: number;
}

export const HourList: React.FC<IHourList> = ({ startingHour, endingHour }) => {
  // Create two segments for each hour (half-hour blocks), with nice string formatting
  return (
    <div className={styles.HourList}>
      <div className={styles.HourHeader} />
      {
        getThirtyMinuteIntervals(startingHour, endingHour).map((hour) => (
          <div
            key={hour}
            className={styles.Hour}
          >
            {hour}
          </div>
        ))
      }
    </div>
  );
}