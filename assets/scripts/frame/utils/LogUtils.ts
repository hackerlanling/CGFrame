const Debug = true;

/**
 * 日志打印工具类
 *  1.主要用于后期线上日志显示不显示，等等一些特殊的情况，
 */
export class LogUtils {

    /** 框架打印 */
    static xf(...data: any[]) {
        // 使用 %c 为 [XF] 加上绿色样式
        const prefix = '%c[XF]';
        const prefixStyle = 'color: green; font-weight: bold;';
        this.logWithStyle(prefix, prefixStyle, ...data);
    }

    /** 普通日志 */
    static log(...data: any[]) {
        Debug && console.log(...data);
    }

    /** 警告日志 */
    static warning(...data: any[]) {
        Debug && console.warn(...data);
    }

    /** 错误日志 */
    static error(...data: any[]) {
        Debug && console.error(...data);
    }

    /** 封装带样式的日志输出 */
    private static logWithStyle(prefix: string, style: string, ...data: any[]) {
        if (Debug) {
            // 使用拼接的方式打印前缀和后面的数据
            console.log(prefix, style, ...data);
        }
    }
}
