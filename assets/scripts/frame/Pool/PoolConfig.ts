/** 对象池加载类型 */
export enum PoolLoadType {
    /** 通用：任何功能模块都可能使用，且会在场景加载前自动初始化 */
    COMMON,
    /** 功能模块：仅特定功能模块会使用，自行在相关模块初始化 */
    MODULE,
}

/** 对象池状态 */
export enum PoolState {
    /** 默认状态，表示池没有执行任何操作 */
    NONE,
    /** 初始化已开始 */
    INIT_START,
    /** 初始化完成 */
    INIT_END
}

/** 对象池唯一标识符 */
export enum PoolKey {
    /** 红点对象池 */
    RED = "Red",
}

/** 对象池配置类型*/
export type PoolConfigType = {
    /** 预制体路径 */
    path: string;
    /** 加载类型，决定对象池的初始化时机 */
    type: PoolLoadType;
    /** 初始化对象池的数量 */
    count: number;
    /** 控件名，指向节点中挂载的组件 */
    comp?: string;
}

/** 对象池配置 */
export const PoolConfig: { [key in PoolKey]: PoolConfigType } = {
    [PoolKey.RED]: {
        path: "red/RedDotItem",        // 预制体路径
        comp: "RedDotItem",           // 控件名
        count: 5,                   // 初始数量
        type: PoolLoadType.COMMON,  // 加载类型
    },
};
