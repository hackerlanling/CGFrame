import { instantiate, NodePool, Prefab, Node, Component, Label } from "cc";
import { PoolState } from "./PoolConfig";


/**
 * 扩展NodePool
 */
export class PoolBase extends NodePool {

    private _state: PoolState = PoolState.NONE;
    private set state(v) {
        this._state = v;
    }
    /**节点池状态 */
    public get state() {
        return this._state;
    }

    /**预制体 */
    private preafab: Prefab;

    /**是否初始化完成 */
    public get isEnd() {
        return this._state == PoolState.INIT_END;
    }

    /**
     * 初始化预制体
     */
    private async initPre(path: string) {
        if (this.preafab) return;
        let preafab = await G.asset.getPrefab("ui", path);
        if (!preafab) {
            console.error("预制体未知类型不存在！！！");
            return;
        }
        this.preafab = preafab;
    }

    /**
     * 通过路径初始化
     * @param prefab 
     * @param count 
     * @returns 
     */
    async init(path: string, count?: number): Promise<void> {
        if (this.state == PoolState.INIT_START) {
            console.warn("正在初始化中，请稍后！！！");
            return;
        }
        this.state = PoolState.INIT_START;
        await this.initPre(path);
        this.state = PoolState.INIT_END;
        this.add(count);
    }

    /**
     * 添加多个节点到对象池中
     * @param count 
     */
    add(count: number) {
        if (!count || !this.isEnd) {
            return;
        }
        for (let i = 0; i < count; i++) {
            let node = instantiate(this.preafab);
            this.put(node);
        }
    }


    put(obj: Node): void
    /**
     * 回收多个对象池
     * @param obj 
     */
    put(obj: Node[]): void;
    put(obj: Node | Node[]) {
        if (!obj || !this.isEnd) return;
        obj = Array.isArray(obj) ? obj : [obj];
        for (let i = 0; i < obj.length; i++) {
            let node = obj[i];
            super.put(node);
        }
    }

    /**
     * 获取一个节点，如果没有回实例化一个
     * @param args 
     */
    get(...args: any[]): Node;
    /**
     * 获取一个节点身上的控件
     * @param componentClass 控件
     */
    get<T extends Component>(componentClass?: { new(...args: any[]): T }): T | null;
    get<T extends Component>(componentClass?: { new(...args: any[]): T }): Node | T {
        if (!this.isEnd) {
            return;
        }
        const node = super.get(arguments) || instantiate(this.preafab);
        if (componentClass) {
            return node.getComponent(componentClass);
        }
        return node;
    }


}