import moment from 'moment';
import _ from 'lodash';

export default function formatDate(toDate, sourceFormatMask) {
  // to prevent from returning negative duration
  const countdownMillisecond = Math.max(0, getDelta(toDate, sourceFormatMask));
  const duration = moment.duration(countdownMillisecond);

  //to correctly display the countdown from the most granular unit
  const countdownString = moment.utc(duration.as('milliseconds'));

  const timeObj = {
    count_days: _.toSafeInteger(countdownString.format('D')) - 1,
    count_hours: _.toSafeInteger(countdownString.format('HH')),
    count_minutes: _.toSafeInteger(countdownString.format('mm')),
    count_seconds: _.toSafeInteger(countdownString.format('ss')),
  };

  return timeObj;
}

export function getDelta(toDate, sourceFormatMask) {
  if (!moment.isMoment(toDate)) {
    const convert = moment.isDate(toDate)
      ? moment(toDate)
      : moment(toDate, sourceFormatMask);

    return convert.diff(moment());
  }

  return toDate.diff(moment());
}
