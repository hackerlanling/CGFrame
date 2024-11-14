import InstanceBase from "../base/InstanceBase";
import PoolBase from "./PoolBase";
import { PoolData, PoolType } from "./PoolType";
import { Component, Node } from 'cc';


export class PoolMgr extends InstanceBase {

    private _poolMap: Map<string, PoolBase> = new Map<string, PoolBase>();

    public async init(data: PoolData) {
        if (this._poolMap.has(data.type)) return;
        let poolBase = new PoolBase();
        await poolBase.init(data);
        this._poolMap.set(data.type, poolBase);
        return poolBase;
    }

    public getN(type: PoolType) {
        return this._poolMap.get(type)?.getN();
    }

    public putN(type: PoolType, node: Node) {
        this._poolMap.get(type)?.putN(node);
    }


    public clear(type: PoolType): void {
        let pool = this._poolMap.get(type);
        if (pool) {
            pool.clear();
            this._poolMap.delete(type);
        }
    }
}

// UI业务逻辑用法
// export class TestUI extends Component {

//     bagPool: UIPoolBase;

//     start() {
//         this.init();
//     }

//     async init() {
//         this.bagPool = await PoolMgr.instance().init(
//             {
//                 type: PoolType.bag,
//                 prefab: "bag",
//             }
//         )
//         this.bagPool.getN();
//         this.bagPool.putN(this.node);
//     }

//     onDestroy() {
//         PoolMgr.instance().clear(PoolType.bag);
//     }
// }