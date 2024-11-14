import { instantiate, Node, NodePool, Prefab } from "cc";
import { CommonPoolData } from "./PoolType";

/**通用对象池基类 */
export default class PoolBase  {

    private nodePool: NodePool;
    private perfab: Prefab;

    public get size() {
        return this.nodePool.size();
    }

    public async init(data: CommonPoolData) {
        if (typeof data.prefab === "string") {//参数归一化
            data.prefab = await this.initPrefab(data.prefab);
        }
        this.perfab = data.prefab;
        this.nodePool = new NodePool(data.handlerComp);
        this.initCount(data.count ?? 5);
    }

    private async initPrefab(url: string) {
        return await XF.asset.getPrefab("ui", url);
    }

    private initCount(count: number) {
        for (let index = 0; index < count; index++) {
            this.nodePool.put(instantiate(this.perfab));
        }
    }

    public getN() {
        return this.nodePool.get() || instantiate(this.perfab);
    }

    public putN(node: Node) {
        this.nodePool.put(node);
    }

    public clear() {
        this.nodePool.clear();
    }

}