import { instantiate, NodePool, Prefab, Node } from "cc";

/**
 * 红点对象池
 */
export class RedPool extends NodePool {

    private redPrefab: Prefab;
    private readonly count: number = 5;

    public init(prefab: Prefab): void;
    public async init(prefab: string): Promise<void>;

    public async init(prefab: Prefab | string) {
        if (typeof prefab === "string") {
            this.redPrefab = await XF.asset.getPrefab("ui", prefab);
        } else {
            this.redPrefab = prefab;
        }
        for (let i = 0; i < this.count; i++) {
            this.put(instantiate(this.redPrefab));
        }
    }

    /**
     * 获取一个节点 对象池没有会创建一个
     * @param args 
     * @returns 
     */
    public getItem(...args: any[]) {
        let item = this.get(args);
        if (!item) item = instantiate(this.redPrefab);
        return item;
    }
}