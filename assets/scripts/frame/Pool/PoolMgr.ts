import InstanceBase from "../base/InstanceBase";
import { PoolBase } from "./PoolBase";
import { PoolConfig, PoolConfigType, PoolKey, PoolLoadType } from "./PoolConfig";

/**
 * 对象池管理类
 */
export class PoolMgr extends InstanceBase {

    private _poolMap: Map<string, PoolBase>;

    constructor() {
        super();
        this._poolMap = new Map<string, PoolBase>();
    }

    /**预加载一般是在Loading加载进度条时调用使用 */
    async preload() {
        for (let key in PoolConfig) {
            let config = PoolConfig[key] as PoolConfigType;
            if (config.type != PoolLoadType.COMMON) continue;
            this.initPoolByConfig(key as PoolKey, config);
        }
    }

    /**
     * 初始化对象池
     * @param keys 
     */
    async initPool(key: PoolKey) {
        let conf = PoolConfig[key];
        if (!conf) {
            console.error("pool config not found:" + key);
            return;
        }
        return this.initPoolByConfig(key, conf);
    }

    /**
     * 通过配置初始化对象池
     * @param key 唯一key
     * @param config 配置
     * @returns 
     */
    async initPoolByConfig(key: PoolKey, config: PoolConfigType) {
        if (this._poolMap.has(key)) return;
        let nodePool = new PoolBase(config.comp);
        await nodePool.init(config.path, config.count);
        this._poolMap.set(key, nodePool);
        return nodePool;
    }

    /**
     * 获取一个对象池
     * @param key 
     * @returns 
     */
    getPool(key: PoolKey) {
        return this._poolMap.get(key);
    }

    /**
     * 清理掉一个对象池
     * @param key 
     */
    clearPool(key: PoolKey) {
        this._poolMap.delete(key);
    }


}

// 业务层模块示例1 如果这个是通用类型的，在进入到loading的时候一定是初始化过了，不需要在功能模块中在初始化了
// class UIClass {

//     private _pool: PoolBase;

//     async init() {
//         this._pool = NodePoolMgr.instance().getPool("key");
//         this.initUI();
//     }

//     initUI() {
//         let showItem = this._pool.get();
//     }

// }


// 业务层模块示例2 如果这个是模块类型的
// 需要在业务层异步初始化对象池，在业务层销毁的时候需要清空掉对象池，这种类型的对象池只是为了某个功能使用
// class UIClass {

//     private _pool: PoolBase;

//     async init() {
//         this._pool = await NodePoolMgr.instance().initPool("key");
//         this.initUI();
//     }

//     initUI() {
//         let showItem = this._pool.get();
//     }

        // onDestroy() {
        //     NodePoolMgr.instance().clearPool("key");
        // }

// }