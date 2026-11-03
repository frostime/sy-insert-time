/**
 * 时间格式化。占位符与 README 中列出的保持一致。
 */

const WEEKDAYS_IN_CHINESE = ["日", "一", "二", "三", "四", "五", "六"];
const WEEKDAYS_IN_ENGLISH_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS_IN_ENGLISH_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** 长的占位符必须排在前面，否则 E 会先吃掉 EEEE 的一部分 */
const TOKEN_PATTERN = /yyyy|EEEE|ECN|yy|MM|dd|HH|mm|ss|E|e/g;

export const KNOWN_TOKENS = ["yyyy", "yy", "MM", "dd", "HH", "mm", "ss", "e", "E", "EEEE", "ECN"];

const KNOWN_TOKEN_SET = new Set(KNOWN_TOKENS);

const pad = (value: number) => String(value).padStart(2, "0");

export const formatDateTime = (template: string, now: Date = new Date()): string => {
    const weekday = now.getDay();
    const values: Record<string, string> = {
        yyyy: String(now.getFullYear()),
        yy: String(now.getFullYear()).slice(-2),
        MM: pad(now.getMonth() + 1),
        dd: pad(now.getDate()),
        HH: pad(now.getHours()),
        mm: pad(now.getMinutes()),
        ss: pad(now.getSeconds()),
        e: String(weekday === 0 ? 7 : weekday),
        E: WEEKDAYS_IN_ENGLISH_SHORT[weekday],
        EEEE: WEEKDAYS_IN_ENGLISH_FULL[weekday],
        ECN: WEEKDAYS_IN_CHINESE[weekday],
    };
    return template.replace(TOKEN_PATTERN, token => values[token]);
};

/**
 * 找出「看起来像占位符但没定义」的片段，例如 hh、yyyyy、MMM。
 * 这样做不会把模板里的普通英文（如 "at"）误判成错误。
 */
export const unknownTokens = (template: string): string[] => {
    const runs = template.match(/[A-Za-z]+/g) ?? [];
    const unknown = runs.filter(run => !KNOWN_TOKEN_SET.has(run) && /^([A-Za-z])\1+$/.test(run));
    return Array.from(new Set(unknown));
};
