import { Component } from "cc";
import MyAsset from "./asset/MyAsset";
import MyCache from "./cache/MyCache";
import { EventEmitter } from "./event/EventEmitter";
import { RedDotMgr } from "./red/RedDotMgr";
import { DateUtils } from "./utils/DateUtils";
import { LogUtils } from "./utils/LogUtils";

class _XF {
    /**
     * 全局资源管理器
     */
    public static asset: MyAsset;
    /**
     * 全局缓存类
     */
    public static cache: MyCache;
    /**
    * 全局事件
    */
    public static event = new EventEmitter();

    public static main: Component;

    /**当前时间 */
    public static get time() {
        return DateUtils.getNowTimestamp();
    }

    public static async init(main: Component) {
        LogUtils.xf("init");
        this.main = main;
        this.asset = new MyAsset();
        this.cache = new MyCache();
        await RedDotMgr.instance().init("ui/RedItem");
    }


}

export default class XF extends _XF {

}

declare global {
    var XF: typeof _XF;
}

window["XF"] = XF;