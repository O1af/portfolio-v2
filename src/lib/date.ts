const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const LONG_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const MONTH_INDEX: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

export type PublishedDate = string | Date;

export function parsePublishedDate(value: PublishedDate): Date {
  if (value instanceof Date) {
    return value;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return new Date(Number.NaN);
  }

  const [, year, month, day] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

export function formatPublishedDate(
  value: PublishedDate,
  format: "short" | "long" = "short"
): string {
  const date = parsePublishedDate(value);
  return (format === "long" ? LONG_DATE_FORMATTER : SHORT_DATE_FORMATTER).format(date);
}

export function comparePublishedDatesDesc(left: PublishedDate, right: PublishedDate): number {
  return parsePublishedDate(right).getTime() - parsePublishedDate(left).getTime();
}

export function publishedDateToISOString(value: PublishedDate): string {
  return parsePublishedDate(value).toISOString();
}

function parseMonthYear(value: string): Date {
  const match = /^([A-Za-z]+)\s+(\d{4})$/.exec(value.trim());
  if (!match) {
    return new Date(Number.NaN);
  }

  const [, monthLabel, year] = match;
  const monthIndex = MONTH_INDEX[monthLabel.toLowerCase()];
  if (monthIndex === undefined) {
    return new Date(Number.NaN);
  }

  return new Date(Date.UTC(Number(year), monthIndex, 1));
}

export function compareMonthYearDesc(left?: string, right?: string): number {
  const leftTime = left ? parseMonthYear(left).getTime() : 0;
  const rightTime = right ? parseMonthYear(right).getTime() : 0;
  return rightTime - leftTime;
}
