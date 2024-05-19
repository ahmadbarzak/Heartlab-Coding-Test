import { DateObjectUnits, DateTime } from "luxon";
import { expect, it } from "vitest";
import { exampleClinicOpeningHours } from "../data/example-clinic-opening-hours";
import { getOpenClinics, parseClinicOpeningHours } from "./open-clinics";

const parseResult = parseClinicOpeningHours(exampleClinicOpeningHours);

// Test helper that returns those clinics open on a specific weekday and hour
// of the day. Monday is weekday === 1, and Sunday is weekday === 7.
function getClinicsOpenAt(weekdayAndHour: { weekday: number; hour: number }) {
  return getOpenClinics(
    parseResult,
    DateTime.fromObject({
      weekday: weekdayAndHour.weekday as DateObjectUnits["weekday"],
      hour: weekdayAndHour.hour,
    })
  );
}

it("Reports no open clinics on Sunday at 5am", () => {
  expect(getClinicsOpenAt({ weekday: 7, hour: 5 })).toEqual([]);
});

it("Reports only the Mayo Clinic open on Monday at 8am", () => {
  expect(getClinicsOpenAt({ weekday: 1, hour: 8 })).toEqual(["Mayo Clinic"]);
});

it("Reports all except Angios R Us open on Monday at 12pm", () => {
  expect(getClinicsOpenAt({ weekday: 1, hour: 12 })).toEqual([
    "Mayo Clinic",
    "Auckland Cardiology",
    "The Heart Team",
    "Atrium Analysts",
  ]);
});

it("Reports all clinics except Angios R Us open on Friday at 8pm", () => {
  expect(getClinicsOpenAt({ weekday: 5, hour: 20 })).toEqual([
    "Mayo Clinic",
    "Auckland Cardiology",
    "The Heart Team",
    "Atrium Analysts",
  ]);
});

it("Reports only The Heart Team open on Sunday at 1am", () => {
  expect(getClinicsOpenAt({ weekday: 7, hour: 1 })).toEqual(["The Heart Team"]);
});

it("Reports Mayo Clinic and Angios R Us open on Sunday at 11am", () => {
  expect(getClinicsOpenAt({ weekday: 7, hour: 11 })).toEqual([
    "Mayo Clinic",
    "Auckland Cardiology",
    "Angios R Us",
  ]);
});

it("Reports only Angios R Us open on Tuesday at 10pm", () => {
  expect(getClinicsOpenAt({ weekday: 2, hour: 22 })).toEqual([
    "Auckland Cardiology",
    "The Heart Team",
  ]);
});
