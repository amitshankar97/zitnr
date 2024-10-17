import { DateTime } from "luxon";
import { CalendarEntry, TimeArray } from "../types";
import { MILLER_PARK_COURT_ID, BAKER_PARK_COURT_ID } from "../utils/constants";
import { courtsById } from "./courtsById";

export const computeCalendar = (date: string, unreservedData: TimeArray, securedData: TimeArray, courtId: string) : CalendarEntry[] => {
  const entries: CalendarEntry[] = [];
  const seen = {};

  if (unreservedData.times) {
    unreservedData.times.forEach((time) => {
      if (seen[time.startTime]) {
        return;
      }
      seen[time.startTime] = true;

      entries.push({
        icon: "green check",
        description: "not reserved",
        startTime: `${time.startTime}`,
        endTime: `${time.endTime}`,
        sortKey: `${time.startTime}`,
      })
    });
  }

  if (securedData.times) {
    securedData.times.forEach((time) => {
      if (seen[time.startTime]) {
        return;
      }
      seen[time.startTime] = true;

      entries.push({
        icon: "green check",
        description: "open play - z.i.t.n.r.",
        startTime: `${time.startTime}`,
        endTime: `${time.endTime}`,
        sortKey: `${time.startTime}`,
      })
    })
  }

  const dayOfWeek = DateTime.fromISO(date).weekday;
  if (courtId == MILLER_PARK_COURT_ID && (dayOfWeek == 1 || dayOfWeek == 3 || dayOfWeek == 5)) {
    entries.push({
      icon: "green check",
      description: "open play - LifeLong Recreation",
      startTime: `10:00:00`,
      endTime: `12:00:00`,
      sortKey: `10:00:00`,
    })
  } else if (courtId == BAKER_PARK_COURT_ID && (dayOfWeek == 2 || dayOfWeek == 4)) {
    entries.push({
      icon: "green check",
      description: "open play - LifeLong Recreation",
      startTime: `10:00:00`,
      endTime: `12:00:00`,
      sortKey: `10:00:00`,
    })
  }

  entries.sort((a, b) => {
    if (a.sortKey < b.sortKey) {
      return -1;
    } else {
      return 1;
    }
  });

  const finalEntries: CalendarEntry[] = [];
const finalEndTime = courtsById[courtId].endTime;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (i == 0) {
      if (courtsById[courtId]) {
        // There is a reservation before
        if (entry.startTime != courtsById[courtId].startTime) {
          finalEntries.push({
            icon: "red x",
            description: "other reservation(s)",
            startTime: courtsById[courtId].startTime,
            endTime: entry.startTime,
            sortKey: "n/a",
          })
        }
      } else {
        console.error("courtsById for park ${park} is not found");
      }

      finalEntries.push(entry)
    } else {
      const previousEntry = entries[i - 1];
      if (previousEntry.endTime != entry.startTime) {
        // There is a gap, probably a reservation
        finalEntries.push({
          icon: "red x",
          description: "other reservation(s)",
          startTime: previousEntry.endTime,
          endTime: entry.startTime,
          sortKey: "n/a",
        });
      }

      finalEntries.push(entry);
    }

    if (i == entries.length - 1) {
      if (entry.endTime != finalEndTime) {
        finalEntries.push({
          icon: "red x",
          description: "other reservation(s)",
          startTime: entry.endTime,
          endTime: finalEndTime,
          sortKey: "n/a"
        });
      }
    }
  }

  return finalEntries;
};
