
import { Prefab, Component } from 'cc';

interface IPoolHandlerComponent extends Component {
    unuse(): void;
    reuse(args: any): void;
}

type PoolConstructor<T = {}> = new (...args: any[]) => T;

/** 公共数据结构 */
export type CommonPoolData = {
    /** 初始数量 不填默认5个 */
    count?: number;
    /** 预制体或其路径 */
    prefab: Prefab | string;
    /** 处理节点类 */
    handlerComp?: PoolConstructor<IPoolHandlerComponent> | string;
};


/** 缓存池数据（支持预制体路径加载） */
export type PoolData = CommonPoolData & {
    /** 缓存唯一key */
    type: PoolType;
};


/**对象池类型，唯一 */
export enum PoolType {
    bag = "bag",

}