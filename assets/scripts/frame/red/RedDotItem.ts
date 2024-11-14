import { _decorator, Component, Node, Label, Enum, Widget } from 'cc';
import { DEV } from 'cc/env';
const { ccclass, property } = _decorator;

/**把wight可能会使用的提取出来暴露出去 */
type UsableProperties = Pick<Widget,
    'left' | 'right' | 'top' | 'bottom' |
    'isAlignBottom' | 'isAlignTop' | 'isAlignLeft' | 'isAlignRight'
>;

@ccclass('RedDotItem')
export class RedDotItem extends Component {

    @property({
        type: Node,
        tooltip: DEV && "红点父节点"
    })
    private dotNode: Node = null;

    /**是否执行对齐操作，外部如果设置使用外部的，如果没有设置使用默认的 */
    private _isInitAlign: boolean = true;

    start() {
        if (!this._isInitAlign) return;
        this.setAlign({ right: -10, top: -10 });
    }

    private reset() {
        //重置数据
        this._isInitAlign = true;
    }


    /**
     * 设置节点数量
     * @param dotCount 数量
     */
    public setDotState(dotCount: number = -1) {
        this.dotNode.active = dotCount > 0;
    }


    /**
     * 设置对齐方式
     * @param updates 
     * @returns 
     */
    public setAlign(updates: Partial<Record<keyof UsableProperties, UsableProperties[keyof UsableProperties]>>) {
        this._isInitAlign = false;

        const widget = this.node.getComponent(Widget);

        if (!widget) {
            console.error("Widget component not found on the node.");
            return;
        }

        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                widget[key] = updates[key];
            }
        }

        return widget;
    }

    /**当使用 put() 回收节点后 会调用里的 unuse 方法*/
    unuse() {
        this.reset();
    }

    /**get() 获取节点后，就会调用 reuse 方法 */
    reuse() {

    }

}