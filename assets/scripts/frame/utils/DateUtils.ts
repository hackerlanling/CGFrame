export class DateUtils {
    /**
     * 获取当前时间的时间戳 (毫秒)
     * @returns 当前时间戳
     */
    static getNowTimestamp(): number {
        return Date.now();
    }

    /**
     * 将时间戳格式化为指定格式的日期字符串 (默认: yyyy-MM-dd HH:mm:ss)
     * @param timestamp 要格式化的时间戳（毫秒）
     * @param format 格式化字符串，例如 'yyyy-MM-dd HH:mm:ss'
     * @returns 格式化后的日期字符串
     */
    static format(timestamp: number, format: string = 'yyyy-MM-dd HH:mm:ss'): string {
        const date = new Date(timestamp);

        const year = date.getFullYear();
        const month = this.zeroPad(date.getMonth() + 1); // 月份从 0 开始
        const day = this.zeroPad(date.getDate());
        const hours = this.zeroPad(date.getHours());
        const minutes = this.zeroPad(date.getMinutes());
        const seconds = this.zeroPad(date.getSeconds());

        const map: { [key: string]: string | number } = {
            'yyyy': year,
            'MM': month,
            'dd': day,
            'HH': hours,
            'mm': minutes,
            'ss': seconds,
        };

        return format.replace(/yyyy|MM|dd|HH|mm|ss/g, (match) => String(map[match]));
    }

    /**
     * 补零函数：确保数字是两位数
     * @param num 要处理的数字
     * @returns 补零后的字符串
     */
    private static zeroPad(num: number): string {
        return num < 10 ? '0' + num : String(num);
    }

    /**
     * 计算两个时间戳之间的天数差
     * @param startTimestamp 开始时间戳（毫秒）
     * @param endTimestamp 结束时间戳（毫秒）
     * @returns 两个时间戳之间的天数差
     */
    static diffInDays(startTimestamp: number, endTimestamp: number): number {
        const msInDay = 24 * 60 * 60 * 1000;
        return Math.floor((endTimestamp - startTimestamp) / msInDay);
    }

    /**
     * 判断某年是否为闰年
     * @param year 要检查的年份
     * @returns 如果是闰年返回 true，否则返回 false
     */
    static isLeapYear(year: number): boolean {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    /**
     * 获取某个月的天数
     * @param year 年份
     * @param month 月份 (1-12)
     * @returns 该月的天数
     */
    static getDaysInMonth(year: number, month: number): number {
        return new Date(year, month, 0).getDate();
    }

    /**
     * 获取某时间戳对应日期的开始时间 (00:00:00) 的时间戳
     * @param timestamp 要处理的时间戳（毫秒）
     * @returns 该日期开始时间的时间戳（毫秒）
     */
    static getStartOfDayTimestamp(timestamp: number): number {
        const date = new Date(timestamp);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    }

    /**
     * 获取某时间戳对应日期的结束时间 (23:59:59.999) 的时间戳
     * @param timestamp 要处理的时间戳（毫秒）
     * @returns 该日期结束时间的时间戳（毫秒）
     */
    static getEndOfDayTimestamp(timestamp: number): number {
        const date = new Date(timestamp);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();
    }
}
