import { macro } from "cc";

/**
 * 定时器工具类
 */
export class TimeUtils {

    private static _scheduleMap = new Map();

    public static schedule(_schedule_name: string, interval: number, times: number, callback: (count: number) => void) {
        if (this._scheduleMap.has(_schedule_name)) return;
        let count = 0;

        let timer = setInterval(() => {
            // console.log("===ccc=", _schedule_name, interval, count, times);
            count += 1;
            callback(count);
            if (times == macro.REPEAT_FOREVER) {
            } else if (count >= times) {
                // console.log("===dd==", count, times, this._scheduleMap.get(_schedule_name))
                clearInterval(this._scheduleMap.get(_schedule_name));
            }
        }, interval * 1000);
        this._scheduleMap.set(_schedule_name, timer);
    }

    public static unschedule(_schedule_name: string) {
        if (this._scheduleMap.has(_schedule_name) == true) {
            clearInterval(this._scheduleMap.get(_schedule_name))
            this._scheduleMap.delete(_schedule_name)
        }
    }

    public static isSchedule(_schedule_name: string) {
        return this._scheduleMap.has(_schedule_name)
    }
}