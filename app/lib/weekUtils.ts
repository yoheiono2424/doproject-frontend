/**
 * 週表示関連のユーティリティ関数
 */

/**
 * 指定された日付が含まれる週の開始日（日曜日）を取得
 */
export function getWeekStart(date: Date): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - result.getDay()); // 日曜日に調整
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * 指定された日付が含まれる週の終了日（土曜日）を取得
 */
export function getWeekEnd(date: Date): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + (6 - result.getDay())); // 土曜日に調整
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * 週の7日間の日付配列を取得（日曜日〜土曜日）
 */
export function getWeekDays(date: Date): Date[] {
  const weekStart = getWeekStart(date);
  const days: Date[] = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }

  return days;
}

/**
 * 前週の同じ曜日の日付を取得
 */
export function getPreviousWeek(date: Date): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - 7);
  return result;
}

/**
 * 次週の同じ曜日の日付を取得
 */
export function getNextWeek(date: Date): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + 7);
  return result;
}

/**
 * 現在の週の日曜日を取得
 */
export function getCurrentWeekStart(): Date {
  return getWeekStart(new Date());
}

/**
 * 日付を YYYY-MM-DD 形式の文字列に変換
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 週の表示文字列を生成（例: "2025年9月 第1週 (9/1〜9/7)"）
 */
export function getWeekDisplayString(date: Date): string {
  const weekStart = getWeekStart(date);
  const weekEnd = getWeekEnd(date);

  const year = weekStart.getFullYear();
  const month = weekStart.getMonth() + 1;
  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();

  // 週番号を計算（その月の何週目か）
  const firstDayOfMonth = new Date(year, weekStart.getMonth(), 1);
  const weekNumber = Math.ceil((startDay + firstDayOfMonth.getDay()) / 7);

  return `${year}年${month}月 第${weekNumber}週 (${month}/${startDay}〜${month}/${endDay})`;
}
