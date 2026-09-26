// Parses "hatırlat:" / "remind:" commands into a reminder object
// Returns { remind_at: ISO string, message: string, repeat_rule: string } or null

const DAYS_TR = ['pazar', 'pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma', 'cumartesi'];
const DAYS_EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MONTHS_TR = ['ocak', 'şubat', 'mart', 'nisan', 'mayıs', 'haziran', 'temmuz', 'ağustos', 'eylül', 'ekim', 'kasım', 'aralık'];
const MONTHS_EN = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

export function isReminderCommand(text, lang) {
  const lower = (text || '').toLowerCase().trim();
  if (lang === 'en') return /^remind\s*[:\s]/i.test(lower);
  return /^hatırlat\s*[:\s]/i.test(lower);
}

export function parseReminder(text, lang = 'tr') {
  if (!text) return null;
  const lower = text.toLowerCase().trim();

  const prefix = lang === 'en' ? /^remind\s*[:\s]+/i : /^hatırlat\s*[:\s]+/i;
  if (!prefix.test(lower)) return null;

  const body = text.replace(prefix, '').trim();
  if (!body) return null;

  const now = new Date();
  let date = new Date(now);
  let hasDate = false;

  const lowerBody = body.toLowerCase();

  // Bugün / today
  if (/\b(bugün|today)\b/i.test(lowerBody)) {
    hasDate = true;
  }
  // Yarın / tomorrow
  else if (/\b(yarın|tomorrow)\b/i.test(lowerBody)) {
    date.setDate(date.getDate() + 1);
    hasDate = true;
  }
  // Day names
  else {
    const days = lang === 'en' ? DAYS_EN : DAYS_TR;
    for (let i = 0; i < days.length; i++) {
      if (lowerBody.includes(days[i])) {
        const currentDay = date.getDay();
        let diff = i - currentDay;
        if (diff <= 0) diff += 7;
        date.setDate(date.getDate() + diff);
        hasDate = true;
        break;
      }
    }
  }

  // Specific date: "25 Eylül" / "25 September"
  const monthMatch = body.match(new RegExp('(\\d{1,2})\\s*(' + (lang === 'en' ? MONTHS_EN : MONTHS_TR).join('|') + ')', 'i'));
  if (monthMatch) {
    const day = parseInt(monthMatch[1]);
    const months = lang === 'en' ? MONTHS_EN : MONTHS_TR;
    const month = months.indexOf(monthMatch[2].toLowerCase());
    if (month >= 0) {
      date.setMonth(month, day);
      hasDate = true;
    }
  }

  // Numeric date: "25/09" or "25.09" or "2026-09-25"
  const numericDate = body.match(/(\d{4})-(\d{1,2})-(\d{1,2})/) || body.match(/(\d{1,2})[/.](\d{1,2})[/.](\d{4})/) || body.match(/(\d{1,2})[/.](\d{1,2})(?!\d)/);
  if (numericDate) {
    if (numericDate.length === 4 && numericDate[1]?.length === 4) {
      // YYYY-MM-DD
      date.setFullYear(parseInt(numericDate[1]), parseInt(numericDate[2]) - 1, parseInt(numericDate[3]));
      hasDate = true;
    } else if (numericDate.length === 5) {
      // DD/MM/YYYY
      date.setFullYear(parseInt(numericDate[3]), parseInt(numericDate[2]) - 1, parseInt(numericDate[1]));
      hasDate = true;
    } else {
      // DD/MM
      date.setDate(parseInt(numericDate[1]));
      date.setMonth(parseInt(numericDate[2]) - 1);
      hasDate = true;
    }
  }

  // Parse time: "18:00", "18.00", "6 pm"
  const timeMatch = body.match(/(\d{1,2})[.:](\d{2})/) || body.match(/(\d{1,2})\s*(am|pm)/i);
  let hours = null, minutes = 0;
  if (timeMatch) {
    hours = parseInt(timeMatch[1]);
    if (timeMatch[2] && isNaN(parseInt(timeMatch[2]))) {
      // am/pm
      const ampm = timeMatch[2].toLowerCase();
      if (ampm === 'pm' && hours < 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
    } else {
      minutes = parseInt(timeMatch[2]);
    }
  }

  if (hours !== null) {
    date.setHours(hours, minutes, 0, 0);
  } else if (hasDate) {
    // No time specified but date found — default to 09:00
    date.setHours(9, 0, 0, 0);
  } else {
    // No date or time — default to 1 hour from now
    date = new Date(now.getTime() + 60 * 60 * 1000);
  }

  // If date is in the past, push to tomorrow
  if (date <= now) {
    date = new Date(now.getTime() + 60 * 60 * 1000);
  }

  // Extract message: remove date/time/keywords
  let message = body
    .replace(/(\d{1,2})[.:](\d{2})/g, '')
    .replace(/(\d{1,2})\s*(am|pm)/gi, '')
    .replace(/\b(bugün|today|yarın|tomorrow)\b/gi, '')
    .replace(new RegExp('\\b(' + DAYS_TR.join('|') + '|' + DAYS_EN.join('|') + ')\\b', 'gi'), '')
    .replace(new RegExp('(\\d{1,2})\\s*(' + MONTHS_TR.join('|') + '|' + MONTHS_EN.join('|') + ')', 'gi'), '')
    .replace(/\d{4}-\d{1,2}-\d{1,2}/g, '')
    .replace(/\d{1,2}[/.]\d{1,2}[/.]\d{4}/g, '')
    .replace(/\b\d{1,2}[/.]\d{1,2}\b/g, '')
    .replace(/\b(saat|at|de|da|'de|'da|on|in)\b/gi, '')
    .replace(/[-:,]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!message || message.length < 2) return null;

  // Detect repeat
  let repeat_rule = 'none';
  if (/\b(her gün|daily|every day)\b/i.test(lowerBody)) repeat_rule = 'daily';
  else if (/\b(her hafta|weekly|every week)\b/i.test(lowerBody)) repeat_rule = 'weekly';

  return {
    remind_at: date.toISOString(),
    message,
    repeat_rule,
  };
}