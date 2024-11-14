
import { sys } from "cc";
import { DateUtils } from "../utils/DateUtils";

export default class MyCache {
    data = {};
    isInit = false;
    init() {
        this.data = {};
        this.isInit = true;
    }

    /**
     * 获取记录到缓存的key
     * @param key key
     * @param uid 唯一id
     * @returns 
     */
    private getKey(key: string, uid?: string) {
        let _uid = uid || "unlogin";
        return `${key}_${_uid}`;
    }

    /**
     * 获取一个缓存
     * @param key 唯一ID
     * @param uid 谁的数据？默认是当前登陆用户
     * @returns 缓存的数据，不存在时返回null
     */
    get(key: string, uid?: string) {
        //拼接uid
        var _key = this.getKey(key, uid);

        var val = null;
        var data = this.data[key] || sys.localStorage.getItem(_key);
        if (data !== null && data != "") {
            //判断是否过期了
            var dataJson = JSON.parse(data);
            if (dataJson.timeto == 0 || (dataJson.timeto > 0 && dataJson.timeto >= XF.time)) {
                val = dataJson.value;
            }
        }
        return val;
    }
    /**
     * 设置一个本地缓存
     * @param key 唯一ID
     * @param val 缓存的值
     * @param timeout 可选，0=永不过期  today=今日内有效 数字=缓存秒数
     * @param uid 谁的数据？默认是当前登陆用户
     * @param saveData 是否保存g123
     * @returns void
     */
    set(key: string, val: any, timeout?: any, uid?: string, saveData = true) {
        var _timeto = 0; //默认用不过期
        if (timeout == 0) {
            //缓存今日内有效
            _timeto = timeout;
        } else if (timeout == "today") {
            //缓存今日内有效
            _timeto = DateUtils.getEndOfDayTimestamp(XF.time);
        } else if (!isNaN(timeout)) {
            //缓存指定秒数
            _timeto = XF.time + timeout * 1;
        }
        var _val = {
            value: val,
            timeto: _timeto,
        };

        var _key = this.getKey(key, uid);
        this.data[key] = JSON.stringify(_val);
        return sys.localStorage.setItem(_key, JSON.stringify(_val));
    }

    /**
     * 删除缓存
     * @param key 唯一ID
     * @param uid 谁的数据？默认是当前登陆用户
     */
    remove(key: string, uid?: string) {
        var _key = this.getKey(key, uid);
        if (this.data[key]) {
            delete this.data[key];
        }
        sys.localStorage.removeItem(_key);
    }

    /**
     * 清空所有缓存
     */
    clear() {
        sys.localStorage.clear();
    }
}
