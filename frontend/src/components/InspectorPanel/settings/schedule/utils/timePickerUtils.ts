import {
  parse as dfParse,
  addMinutes as dfAddMinutes,
  isBefore as dfIsBefore,
  set as dfSet,
  getHours as dfGetHours,
  getMinutes as dfGetMinutes,
  startOfDay as dfStartOfDay,
  isValid as dfIsValid,
  isSameDay as dfIsSameDay,
} from "date-fns";

export interface TimeParts {
  hour: string;
  minute: string;
  period: string;
}

export const calculateInitialTimeParts = (
  timeString24: string | undefined,
  dateContextStr?: string,
): TimeParts => {
  let initialDateToProcess: Date;
  const systemNow = new Date();
  const systemTodayStart = dfStartOfDay(systemNow);

  let contextDateIsToday = true;
  if (dateContextStr) {
    const parsedContextDate = dfParse(dateContextStr, "yyyy-MM-dd", systemNow);
    if (dfIsValid(parsedContextDate)) {
      contextDateIsToday = dfIsSameDay(
        dfStartOfDay(parsedContextDate),
        systemTodayStart,
      );
    }
  }

  if (timeString24) {
    const parsedTimeInput = dfParse(timeString24, "HH:mm", new Date());
    if (dfIsValid(parsedTimeInput)) {
      initialDateToProcess = parsedTimeInput;
    } else {
      initialDateToProcess = dfSet(new Date(), { hours: 0, minutes: 0 });
    }
  } else {
    if (contextDateIsToday) {
      let tempDate = dfAddMinutes(systemNow, 15);
      const currentMinute = dfGetMinutes(tempDate);
      tempDate = dfSet(tempDate, {
        minutes: Math.ceil(currentMinute / 15) * 15,
        seconds: 0,
        milliseconds: 0,
      });

      const minAllowedFromNow = dfAddMinutes(systemNow, 15);
      if (dfIsBefore(tempDate, minAllowedFromNow)) {
        tempDate = dfSet(minAllowedFromNow, {
          minutes: Math.ceil(dfGetMinutes(minAllowedFromNow) / 15) * 15,
          seconds: 0,
          milliseconds: 0,
        });
        if (dfIsBefore(tempDate, minAllowedFromNow)) {
          tempDate = dfAddMinutes(tempDate, 15);
        }
      }
      initialDateToProcess = tempDate;
    } else {
      initialDateToProcess = dfSet(new Date(), {
        hours: 9,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      });
    }
  }

  const h24 = dfGetHours(initialDateToProcess);
  const m = dfGetMinutes(initialDateToProcess);
  const currentPeriod = h24 >= 12 ? "PM" : "AM";
  let currentHour12 = h24 % 12;
  if (currentHour12 === 0) currentHour12 = 12;

  return {
    hour: currentHour12.toString().padStart(2, "0"),
    minute: (Math.floor(m / 15) * 15).toString().padStart(2, "0"),
    period: currentPeriod,
  };
};

export const checkTimeSlotDisabled = (
  h12Str: string,
  mStr: string,
  pStr: string,
  selectedDateString?: string,
): boolean => {
  const systemNow = new Date();
  const systemTodayStart = dfStartOfDay(systemNow);

  if (!selectedDateString) {
    //
  } else {
    const parsedSelectedDate = dfParse(
      selectedDateString,
      "yyyy-MM-dd",
      new Date(),
    );

    if (!dfIsValid(parsedSelectedDate)) {
      return true;
    }

    const selectedDateStart = dfStartOfDay(parsedSelectedDate);

    if (dfIsBefore(selectedDateStart, systemTodayStart)) {
      return true;
    } else if (dfIsBefore(systemTodayStart, selectedDateStart)) {
      return false;
    }
  }

  const minAllowedDateTime = dfAddMinutes(systemNow, 15);
  let h24 = parseInt(h12Str, 10);
  if (pStr === "AM" && h24 === 12) h24 = 0;
  else if (pStr === "PM" && h24 < 12) h24 += 12;

  const prospectiveDateTimeOnToday = dfSet(systemTodayStart, {
    hours: h24,
    minutes: parseInt(mStr, 10),
    seconds: 0,
    milliseconds: 0,
  });

  return dfIsBefore(prospectiveDateTimeOnToday, minAllowedDateTime);
};
