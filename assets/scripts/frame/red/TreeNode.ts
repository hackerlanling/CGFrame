import { _decorator, Component, Node } from 'cc';
import { RedCallInfo } from '../type';
import { RedDotItem } from './RedDotItem';
import { RedDotMgr } from './RedDotMgr';
const { ccclass, property } = _decorator;

/**
 * 树节点
 */
export class TreeNode {

    /**子节点 */
    private m_Children: Map<string, TreeNode>;
    /**节点值改变回调 */
    private m_ChangeCallback: RedCallInfo[];

    private _name: string;
    /**节点名 */
    public get name() {
        return this._name;
    }

    private _value: number;
    /**节点值 */
    public get value() {
        return this._value;
    }

    private _parent: TreeNode;
    /**父节点 */
    public get parent() {
        return this._parent;
    }

    private m_FullPath: string;
    /**完整路径 */
    public get FullPath() {
        if (!this.m_FullPath) {
            if (!this.parent || this.parent == RedDotMgr.instance().root) {
                this.m_FullPath = this.name;
            }
            else {
                this.m_FullPath = this.parent.FullPath + RedDotMgr.instance().splitChar + this.name;
            }
        }
        return this.m_FullPath;
    }

    /**子节点数组 */
    public get children() {
        return this.m_Children?.values();
    }

    /**子节点数量 */
    public get childrenCount() {
        if (this.m_Children == null) {
            return 0;
        }
        let sum = this.m_Children.size;
        for (let node of this.m_Children.values()) {
            sum += node.childrenCount;
        }
        return sum;
    }

    /**红点Item */
    private redItem: RedDotItem = null;
    /**红点item设置的父节点 */
    private redParent: Node = null;

    constructor(name: string)
    constructor(name: string, parent: TreeNode)
    constructor(name: string, parent?: TreeNode) {
        this._name = name;
        this._value = 0;
        this.m_ChangeCallback = [];
        if (parent) this._parent = parent;
    }

    /**
     * 添加节点值监听
     * @param callback 
     */
    public addListener(data: RedCallInfo) {
        this.m_ChangeCallback.push(data);
    }

    /**
     * 移除节点值监听
     * @param callback 
     */
    public removeListener(data: RedCallInfo) {
        let index = this.m_ChangeCallback.findIndex(v => v.callback === data.callback && v.target === data.target);
        if (index >= 0) {
            this.m_ChangeCallback.splice(index, 1);
        }
    }

    /**
     * 移除所有节点值监听
     */
    public removeAllListener() {
        this.m_ChangeCallback = null;
    }

    /**
     * 改变节点值（使用传入的新值，只能在叶子节点上调用）
     * @param newValue 
     */
    public changeValue(newValue: number): void;
    /**
     * 改变节点值（根据子节点值计算新值，只对非叶子节点有效）
     */
    public changeValue(): void;
    public changeValue(newValue?: number) {
        if (newValue != null) {
            if (this.m_Children != null && this.m_Children.size != 0) {
                console.error("不允许直接改变非叶子节点的值：" + this.FullPath);
                return;
            }
            this.internalChangeValue(newValue);
        }
        else {
            let sum = 0;
            if (this.m_Children != null && this.m_Children.size != 0) {
                this.m_Children.forEach((v) => {
                    sum += v.value;
                })
            }
            this.internalChangeValue(sum);
        }
    }

    /**
     * 获取子节点，如果不存在则添加
     * @param key 
     * @returns 
     */
    public getOrAddChild(key: string) {
        let child = this.getChild(key);
        if (child == null) {
            child = this.addChild(key);
        }
        return child;
    }

    /**
     * 获取子节点
     * @param key 
     * @returns 
     */
    public getChild(key: string) {
        if (this.m_Children == null) {
            return null;
        }
        let child = this.m_Children.get(key);
        return child;
    }

    /**
     * 添加子节点
     * @param key 
     * @returns 
     */
    public addChild(key: string) {
        if (this.m_Children == null) {
            this.m_Children = new Map<string, TreeNode>();
        }
        else if (this.m_Children.has(key)) {
            console.error("子节点添加失败，不允许重复添加：" + this.FullPath);
            return;
        }

        let child = new TreeNode(key, this);
        this.m_Children.set(key, child);
        return child;
    }

    /**
     * 移除子节点
     * @param key 
     * @returns 
     */
    public removeChild(key: string) {
        if (!this.m_Children == null || this.m_Children.size == 0) {
            return false;
        }

        let child = this.getChild(key);

        if (child != null) {
            //子节点被删除 需要进行一次父节点刷新
            RedDotMgr.instance().markDirtyNode(this);
            this.m_Children.delete(key);
            return true;
        }

        return false;
    }

    /**
     * 移除所有子节点
     * @returns 
     */
    public removeAllChild() {
        if (!this.m_Children == null || this.m_Children.size == 0) {
            return;
        }
        this.m_Children.clear();
        RedDotMgr.instance().markDirtyNode(this);
    }

    /**
     * 改变节点值
     */
    private internalChangeValue(newValue: number) {
        if (this.value == newValue) return;
        this._value = newValue;
        this.updateRed(newValue);

        if (this.m_ChangeCallback) {
            for (let info of this.m_ChangeCallback) {
                if (info.target) {
                    info.callback.call(info.target, newValue, this.redItem);
                } else {
                    info.callback(newValue, this.redItem);
                }
            }
        }
        //标记父节点为脏节点
        RedDotMgr.instance().markDirtyNode(this.parent);
    }

    /**
     * 设置红点父节点
     * @param parent 
     */
    public setRedParent(parent: Node) {
        this.redParent = parent;
    }

    /**
     * 更新红点
     * @param newValue 
     */
    private updateRed(newValue: number) {
        let redItem = this.redItem;
        if (!redItem) {
            const redNode = RedDotMgr.instance().redPool.get();
            redNode.parent = this.redParent;
            redItem = redNode.getComponent(RedDotItem);
            this.redItem = redItem;
        }
        redItem.setDotState(newValue);
    }

    /**
     * 回收item
     */
    public putRed() {
        if (this.redItem) {
            RedDotMgr.instance().redPool.put(this.redItem.node);
            this.redItem = null;
        }
        this.redParent = null;
    }


}