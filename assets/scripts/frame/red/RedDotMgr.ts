import { _decorator, Component, Node, Prefab, NodePool } from 'cc';
import InstanceBase from '../base/InstanceBase';
import { PoolBase } from '../Pool/PoolBase';
import { PoolKey } from '../Pool/PoolConfig';
import { PoolMgr } from '../Pool/PoolMgr';
import { RedCallInfo } from '../type';
import { RedPool } from './RedPool';
import { TreeNode } from './TreeNode';
const { ccclass, property } = _decorator;

/**
 * 红点管理器
 */
export class RedDotMgr extends InstanceBase {

    /**所有节点集合 */
    private m_AllNodes: Map<string, TreeNode>;
    /**脏节点集合 */
    private m_DirtyNodes: Set<TreeNode>;
    /**临时脏节点集合 */
    private m_TempDirtyNodes: Array<TreeNode>;

    /**路径分隔字符 */
    public splitChar: string;
    /**红点树根节点 */
    public root: TreeNode;
    /**红点对象池 */
    public redPool: PoolBase;

    constructor() {
        super();
        this.splitChar = '|';
        this.m_AllNodes = new Map<string, TreeNode>();
        this.root = new TreeNode("root");
        this.m_DirtyNodes = new Set<TreeNode>();
        this.m_TempDirtyNodes = new Array<TreeNode>();
    }

    init(){
        this.redPool = PoolMgr.instance().getPool(PoolKey.RED);
        G.main.schedule(this.update.bind(this));
    }

  
    /**
     * 添加红点到某个节点上面
     * @param node 父节点
     * @param path 路径
     * @param callback 回调函数
     * @param target 绑定回调的this
     */
    public addRedDot(node: Node, path: string, callInfo?: RedCallInfo) {
        if (!node || !node.isValid) return;
        let treeNode = this.addListener(path, callInfo);
        treeNode.setRedParent(node);
        return treeNode;
    }

    /**
     * 回收红点节点
     * @param path 路径
     * @returns 
     */
    public removeRedDot(path: string): void;
    public removeRedDot(path: string[]): void
    public removeRedDot(path: string | string[]) {
        if (typeof path === "string") {
            path = [path];
        }
        for (let val of path) {
            this.removeTreeNode(val);
        }
    }


    /**
     * 添加节点值监听
     * @param path 路径
     * @param callback 改变或者更新的回调函数
     * @returns 
     */
    public addListener(path: string, callInfo?: RedCallInfo) {
        if (!callInfo) return null;
        let treeNode = this.getTreeNode(path);
        treeNode.addListener(callInfo);
        return treeNode;
    }

    /**
     * 移除节点值监听
     * @param path 
     * @param callback 
     * @returns 
     */
    public removeListener(path: string, callInfo?: RedCallInfo) {
        if (!callInfo) return;
        let node = this.getTreeNode(path);
        node.removeListener(callInfo);
    }

    /**
     * 移除所有节点值监听
     * @param path 
     */
    public removeAllListener(path: string) {
        let node = this.getTreeNode(path);
        node.removeAllListener();
    }

    /**
     * 改变节点值
     * @param path 
     * @param newValue 
     */
    public changeValue(path: string, newValue: number) {
        let node = this.getTreeNode(path);
        node.changeValue(newValue);
    }

    /**
     * 获取节点值
     * @param path 
     * @returns 
     */
    public getValue(path: string) {
        let node = this.getTreeNode(path);
        if (node == null) {
            return 0;
        }
        return node.value;
    }

    /**
     * 获取节点
     * @param path 
     * @returns 
     */
    public getTreeNode(path: string) {
        if (!path) {
            console.error("路径不合法，不能为空");
            return;
        }

        let node = this.m_AllNodes.get(path);
        if (node) {
            return node;
        }

        let cur = this.root;
        let length = path.length;

        let startIndex = 0;

        for (let i = 0; i < length; i++) {
            if (path[i] == this.splitChar) {
                if (i == length - 1) {
                    console.error("路径不合法，不能以路径分隔符结尾：" + path);
                    return;
                }

                let endIndex = i - 1;
                if (endIndex < startIndex) {
                    console.error("路径不合法，不能存在连续的路径分隔符或以路径分隔符开头：" + path);
                    return;
                }

                let child = cur.getOrAddChild(this.getPrefix(path, startIndex, endIndex));

                //更新startIndex
                startIndex = i + 1;

                cur = child;
            }
        }

        //最后一个节点 直接用length - 1作为endIndex
        let target = cur.getOrAddChild(this.getPrefix(path, startIndex, length - 1));

        this.m_AllNodes.set(path, target);

        return target;


    }

    /**
     * 移除节点
     * @param path 
     * @returns 
     */
    public removeTreeNode(path: string) {
        if (!this.m_AllNodes.has(path)) {
            return false;
        }
        let node = this.getTreeNode(path);
        node.putRed();
        this.m_AllNodes.delete(path);
        return node.parent.removeChild(this.getPrefix(node.name, 0, node.name.length - 1));
    }

    /**
     * 移除所有节点
     */
    public removeAllTreeNode() {
        this.root.removeAllChild();
        this.m_AllNodes.clear();
    }

    /**
     * 管理器轮询
     * @returns 
     */
    public update() {
        if (this.m_DirtyNodes.size == 0) {
            return;
        }

        this.m_TempDirtyNodes.length = 0;

        for (let node of this.m_DirtyNodes) {
            this.m_TempDirtyNodes.push(node);
        }

        this.m_DirtyNodes.clear();

        //处理所有脏节点
        for (let i = 0; i < this.m_TempDirtyNodes.length; i++) {
            this.m_TempDirtyNodes[i].changeValue();
        }
    }

    /**
     * 标记脏节点
     * @param node 
     * @returns 
     */
    public markDirtyNode(node: TreeNode) {
        if (node == null || node.name == this.root.name) {
            return;
        }
        this.m_DirtyNodes.add(node);
    }

    /**
     * 获取前缀
     * @param source 
     * @param startIndex 
     * @param endIndex 
     * @returns 
     */
    private getPrefix(source: string, startIndex: number, endIndex: number) {
        let str = "";
        for (let i = startIndex; i <= endIndex; i++) {
            str += source[i];
        }
        return str;
    }

    /**
     * 打印红点树——>调试使用
     * @param path 
     * @returns 
     */
    public printTree(path: string) {
        if (!path) {
            console.error("路径不能为空!!");
            return;
        }
        let item = this.getTreeNode(path);
        if (!item) {
            console.error("路径中不存在树:=" + path);
            return;
        }
        function traverse(node): void {
            console.group(`${node.FullPath} - 节点值: ${node.value} - 子节点数: ${node.childrenCount}`);
            if (node.childrenCount > 0) {
                for (let child of node.children) {
                    console.groupEnd();
                    traverse(child);
                }
            }
        }
        traverse(item);
    }

}