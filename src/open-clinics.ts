import { DateObjectUnits, DateTime, Interval } from "luxon";
import { type ClinicOpeningHours } from "../data/example-clinic-opening-hours";

type ParsedClinicOpeningHours = {
  [day: string]: {
    [clinicName: string]: Interval[];
  };
};

/**
 * Parses a set of clinic opening hours and returns a data structure that can be
 * queried to find which clinics are open at a specified date and time. The
 * querying is done using the getOpenClinics() function.
 *
 * Notes:
 *
 * - The format of the opening hours data to be parsed can be seen in the
 *   "data/example-clinic-opening-hours.ts" file.
 *
 * - The input data can be assumed to be correctly formatted, i.e. there is no
 *   requirement to validate it or handle any errors it may contain.
 */

export function parseClinicOpeningHours(
  clinicOpeningHours: ClinicOpeningHours
): ParsedClinicOpeningHours {
  const parsed: ParsedClinicOpeningHours = {};

  const initialiseDay = (day: string, clinicName: string) => {
    parsed[day] = parsed[day] || {};
    parsed[day][clinicName] = parsed[day][clinicName] || [];
  };

  clinicOpeningHours.forEach((clinic) => {
    clinic.openingHours.forEach((openingHour) => {
      const [days, ...timeParts]: string[] = openingHour.split(" ");
      const [startDay, endDay]: string[] = days.split("-");
      const startDayIndex: number = DateTime.fromFormat(
        startDay,
        "ccc"
      ).weekday;
      const endDayIndex: number = endDay
        ? DateTime.fromFormat(endDay, "ccc").weekday
        : startDayIndex;

      for (let dayIndex = startDayIndex; dayIndex <= endDayIndex; dayIndex++) {
        let day: string = DateTime.fromObject({
          weekday: dayIndex as DateObjectUnits["weekday"],
        }).toFormat("ccc");

        initialiseDay(day, clinic.name);

        const startDateTime: DateTime = DateTime.fromFormat(
          `${day} ${timeParts[0]}`,
          "ccc ha"
        );
        let endDateTime: DateTime = DateTime.fromFormat(
          `${day} ${timeParts[2]}`,
          "ccc ha"
        );

        if (endDateTime < startDateTime) {
          const endOfDay: DateTime = startDateTime.endOf("day");
          parsed[day][clinic.name].push(
            Interval.fromDateTimes(startDateTime, endOfDay)
          );

          day = DateTime.fromObject({
            weekday: (dayIndex + 1) as DateObjectUnits["weekday"],
          }).toFormat("ccc");
          initialiseDay(day, clinic.name);
          endDateTime = endDateTime.plus({ days: 1 });
          const startOfDay: DateTime = endDateTime.startOf("day");
          parsed[day][clinic.name].push(
            Interval.fromDateTimes(startOfDay, endDateTime)
          );
        } else {
          parsed[day][clinic.name].push(
            Interval.fromDateTimes(startDateTime, endDateTime)
          );
        }
      }
    });
  });
  return parsed;
}

/**
 * Takes a set of parsed clinic opening hours and returns an array containing
 * the names of those clinics which are open at the specified date and time,
 * sorted alphabetically.
 */
export function getOpenClinics(
  parsedClinicOpeningHours: ParsedClinicOpeningHours,
  queryTime: DateTime
): string[] {
  const queryDay = queryTime.toFormat("ccc");
  const possibleClinics = parsedClinicOpeningHours[queryDay] || {};
  const openClinics = Object.keys(possibleClinics).filter((clinic) =>
    possibleClinics[clinic].some((interval) => interval.contains(queryTime))
  );

  return openClinics.sort();
}
