declare module 'japanese-holidays' {
  interface Holiday {
    name: string;
    month: number;
    date: number;
  }

  function isHoliday(date: Date): boolean;
  function getHolidaysOf(year: number): Holiday[];
  function getHolidayName(date: Date): string | null;

  export default {
    isHoliday,
    getHolidaysOf,
    getHolidayName,
  };
}
