/*
日志工具类
*/
export class LogUtils {

    private static _isShow: boolean = true
    private static _logManagers: { [key: string]: Function } = {};


    private static _createLogManager(prefix: string, style: string): Function {
        if (!this._isShow) return function () { };

        if (!prefix || !style) {
            return function () { };
        }
        // 缓存已创建的日志管理器
        let key = `${prefix}-${style}`;
        if (this._logManagers[key]) {
            return this._logManagers[key];
        }

        // 确保 window.console 存在
        if (typeof window === 'undefined' || !window.console || typeof window.console.log !== 'function') {
            return function () { };
        }

        let logFunction = window.console.log.bind(window.console, `%c【${prefix}】`, style);
        this._logManagers[key] = logFunction;
        return logFunction;

    };

    /**
     * 用于输出请求服务端数据信息
     */
    static get sendServer() {
        return this._createLogManager('请求数据', 'color: white; background-color: #007BFF; font-weight: bold; font-size: 18px;');
    }
    /**
       * 用于输出服务端回调数据信息
       */
    static get receiveServer() {
        return this._createLogManager('数据回调', 'color: white; background-color: #804B08; font-weight: bold; font-size: 18px;');
    }

    /**
     * 用于输出服务端推送数据信息
     */

    static get chageServer() {
        return this._createLogManager('数据推送', 'color: white; background-color: #087680; font-weight: bold; font-size: 18px;');
    }

    /**
     * 用于输出一般信息
     */

    static get info() {
        return this._createLogManager('信息', 'color: white; background-color: #28A745; font-weight: bold; font-size: 14px;');
    }

    /**
     * 用于输出警告信息
     */

    static get warn() {
        return this._createLogManager('警告', 'color: white; background-color: #FFC107; font-weight: bold; font-size: 14px;');
    }



    /**
     * 用于输出错误信息
     */

    static get err() {
        return this._createLogManager('错误', 'color: white; background-color: #DC3545; font-weight: bold; font-size: 14px;');
    }

        /**
     * 用于输出bingo指令
     */
    static get bingoDoc() {
        return this._createLogManager('binGo指令', 'color: white; background-color: #FF83C3; font-weight: bold; font-size: 18px;');
    }

    /**
     * 用于输出战斗日志
     */
    static get fightLog() {
        return this._createLogManager('战斗日志', 'color: black; background-color: #28F800; font-weight: bold; font-size: 22px;');
    }

}
