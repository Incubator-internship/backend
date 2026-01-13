export class DateHelper {
  // transformation in Date. We received date in format - 07.07.1997.
  // change to parsedDate format - 1997-07-07T00:00:00.000Z
  static getDate({ date }: { date: string }) {
    const partsOfDate = date.split('.');

    const formattedDateString = `${partsOfDate[2]}-${partsOfDate[1]}-${partsOfDate[0]}`;

    const parsedDate = new Date(formattedDateString);

    return { parsedDate };
  }

  //check for maximum date difference
  static checkMaxDate({ date, years }: { date: Date; years: number }) {
    // get current date
    const currentDate = new Date();

    // getting the date to compare
    const yearsAgo = new Date(
      currentDate.getFullYear() - years,
      currentDate.getMonth(),
      currentDate.getDate(),
    );

    // check dates
    if (date < yearsAgo) return false;

    return true;
  }

  // проверка на минимальную разницу в датах
  static checkMinDate({ date, years }: { date: Date; years: number }) {
    // получение текущей даты
    const currentDate = new Date();

    // получение даты, с которой будет происходить сравнение
    const yearsAgo = new Date(
      currentDate.getFullYear() - years,
      currentDate.getMonth(),
      currentDate.getDate(),
    );

    // сверка дат
    if (date > yearsAgo) return false;

    return true;
  }
}
