import { Component } from "cc";
import MyAsset from "./asset/MyAsset";
import MyCache from "./cache/MyCache";
import { EventEmitter } from "./event/EventEmitter";
import { RedDotMgr } from "./red/RedDotMgr";
import { DateUtils } from "./utils/DateUtils";

class _G {
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

    public static init(main: Component) {
        this.main = main;
        this.asset = new MyAsset();
        this.cache = new MyCache();
    }

    /**
     * 初始化异步相关的，一般是和业务层绑定初始化的
     */
    public static async initAsync() {
        await RedDotMgr.instance().init("ui/RedItem");
        

    }

}

export default class G extends _G {

}

declare global {
    var G: typeof _G;
}

window["G"] = G;