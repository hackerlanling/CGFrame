
import { instantiate, isValid, log } from "cc";

import { UIClass, UIStatus, UIType, popQueueInfo } from "./UIClass";
import { each } from "../utils/FunUtils";

export default class UIManager {
    //ui集合
    public static ui: Partial<any> = {};
    //节点池
    public static maskValue: Record<string, { uiClass: UIClass; parentTaggle?: string }> = {};

    private static _timer;
    /**
     * 注册窗体
     * @param uiClass 窗体UIclass
     */
    public static register(uiClass: UIClass) {
        var _id = uiClass.uiConfig.ID;
        this.ui[_id] = uiClass;
    }

    /**
     * 获取一个窗口
     * @param ID 窗口ID
     * @returns
     */
    public static get(ID: string) {
        return this.ui[ID];
    }

    /**
     * 将窗口设置到顶部
     * @param ID 窗口ID
     * @returns
     */
    public static toTop(ID: string) {
        var maxZindex = 0;
        if (!this.ui[ID]?.node?.isValid) return;

        for (let id in this.ui) {
            let _uiclass = this.ui[id];
            if (_uiclass.uiConfig.ID != ID && _uiclass.uiConfig.autoZindex && _uiclass.node?.isValid && _uiclass.node.zIndex > maxZindex) {
                maxZindex = _uiclass.node.zIndex;
            }
        }
        this.ui[ID].node.zIndex = maxZindex + 10;
    }

    /**
     * 当任意UI被关闭时，触发该方法
     * @param uiClass 由该uiClass关闭引起的
     */
    public static onUIRemove(uiClass: UIClass) {
        if (uiClass.uiConfig.fullScreen) {
            //UI被关闭时，如果设置了fullScreen，则找到最顶上的一个fullScreen UI显示出来
            var topFullScreenUI: UIClass;
            var topFullScreenZindex = -1;

            for (let id in this.ui) {
                let _uiclass = this.ui[id];
                if (_uiclass.uiConfig.ID != uiClass.uiConfig.ID && _uiclass.uiConfig.fullScreen && _uiclass.node?.isValid && _uiclass.node.zIndex > topFullScreenZindex && _uiclass.status != UIStatus.REMOVED && _uiclass.status != UIStatus.REMOVING) {
                    topFullScreenZindex = _uiclass.node.zIndex;
                    topFullScreenUI = _uiclass;
                }
            }

            if (topFullScreenUI?.node?.isValid) {
                log(`关闭了全屏窗口${uiClass.uiConfig.ID}，自动显示${topFullScreenUI.uiConfig.ID}`);
                topFullScreenUI.onOpen();
            }
        }
        if (uiClass.uiConfig.uiType == UIType.Window) {
            this.emitWindowFocusAndBlur();
        }
        this.onUIRemoveFun && this.onUIRemoveFun(uiClass);
        G.event.emit("onUI", "hide", uiClass);
        // this.setMask("hide", uiClass);
    }
    public static getTop() {
        let top: UIClass = null;
        each(this.ui, (_uiclass) => {
            if (_uiclass.node?.isValid) {
                if (_uiclass.uiConfig.uiType == UIType.SubFrame || _uiclass.uiConfig.function == "guide") return;
                if (!_uiclass.node) return;
                if (_uiclass.status == UIStatus.REMOVED || _uiclass.status == UIStatus.REMOVING) {
                    return;
                }
                if (!top) {
                    top = _uiclass;
                }
                if (_uiclass.node?.zIndex > top.node?.zIndex) {
                    top = _uiclass;
                }
            }
        });
        return top;
    }

    private static onUIRemoveFun = null;
    /**一个界面添加getTop事件 */
    public static onGetTop(ID: string, callback?) {
        let top = UIManager.getTop();
        if (top && top.uiConfig.ID == ID) {
            callback && callback();
        } else {
            UIManager.ui.xsMain.once("getTop", function () {
                callback && callback();
                callback = null;
                this.onUIRemoveFun = null;
            });
            this.onUIRemoveFun = () => {
                let top = UIManager.getTop();
                if (top && top.uiConfig.ID == ID) {
                    callback && callback();
                    callback = null;
                    if (UIManager.ui.xsMain.event) UIManager.ui.xsMain.event.off("getTop");
                    this.onUIRemoveFun = null;
                }
            };
        }
    }

    /**
     * 关闭符合filter规则的UI
     * @param filter 回调方法，将class传入该方法，如果返回true，则该class被关闭
     */
    public static removeUI(filter, event = true) {
        let all = Object.keys(this.ui);
        all.sort((a, b) => {
            let _uiclass = this.ui[a];
            if (_uiclass.node?.isValid && _uiclass.node?.active == false) {
                return -1;
            }
            return a == "xsMain" ? -1 : 1;
        });
        each(all, (id) => {
            let _uiclass = this.ui[id];
            if (_uiclass.node?.isValid && filter(_uiclass) === true) {
                if (event === false) {
                    _uiclass.event?.off("remove");
                }
                _uiclass.remove();
            }
        });
    }

    public static updateUi(filter) {
        for (let id in this.ui) {
            let _uiclass = this.ui[id];
            if (_uiclass.node?.isValid && filter(_uiclass) === true) {
                _uiclass.updateUi();
            }
        }
    }

    /**
     * 当任意UI被显示时，触发该方法
     * @param uiClass 由该uiClass显示引起的
     */
    public static onUIShow(uiClass: UIClass) {
        if (uiClass.uiConfig.fullScreen) {
            //UI显示时，如果设置了fullScreen，则可以把其他的fullScreenUI隐藏掉，减少消耗
            for (let id in this.ui) {
                let _uiclass = this.ui[id];
                if (_uiclass.uiConfig.ID != uiClass.uiConfig.ID && _uiclass.uiConfig.fullScreen && _uiclass.node?.isValid) {
                    _uiclass.onHide();
                    log(`开启了全屏窗口${uiClass.uiConfig.ID}，自动隐藏${_uiclass.uiConfig.ID}`);
                }
            }
        }
        if (uiClass.uiConfig.uiType == UIType.Window) {
            this.emitWindowFocusAndBlur();
        }
        G.event.emit("onUI", "show", uiClass);
    }

    /**
     * 对打开的所有窗口进行排序
     * @returns [{"key":"xuanfu","order":20},{"key":"login","order":10}]
     */
    public static getUIOrder() {
        var list = [];
        for (let id in this.ui) {
            let _uiclass = this.ui[id];
            if (!_uiclass.node?.isValid) continue;
            list.push({
                key: _uiclass.uiConfig.ID,
                order: _uiclass.node.zIndex,
                needDown: _uiclass.uiConfig.needDown,
                needTop: _uiclass.uiConfig.needTop,
            });
        }

        list.sort(function (a, b) {
            return b.order - a.order;
        });
        return list;
    }
    /**弹窗队列池 */
    private static _popPool: { [queueName: string]: { weight: number, ui: UIClass }[] } = {};


    /**当前是否还有该属性队列的弹窗 */
    public static isQueuePop(queueName: string) {
        return this._popPool[queueName] && Object.values(this._popPool[queueName]).length > 0
    }

    /**判断当前包含队列属性的弹窗是否可以顺利弹出 */
    public static checkQueuePopShow(pop: UIClass) {
        for (let id in this.ui) {
            if (!this.ui[id].uiConfig.popQueue || (id === pop.uiConfig.ID)) continue
            let map = new Map(this.ui[id].uiConfig.popQueue.map(item => [item.queueName, true]));
            let queueInfo = pop.uiConfig.popQueue.find(item => map.has(item.queueName));
            if (queueInfo && this.ui[id].isShow) {
                this._sortQueuePop(pop, queueInfo);
                return false
            }
        }

        return true;
    }

    /**同名队列的弹窗（弹出）数据移除 */
    public static removeSameQueue(pop: UIClass) {
        if (!Object.keys(this._popPool).length) return;

        pop.uiConfig.popQueue.forEach(queueInfo => {
            if (this._popPool[queueInfo.queueName].length) {
                let maxObject = this._popPool[queueInfo.queueName].reduce((acc, curr) =>
                    acc.weight > curr.weight ? acc : curr
                );
                let maxIndex = this._popPool[queueInfo.queueName].indexOf(maxObject);
                if (maxIndex !== -1) {
                    this._popPool[queueInfo.queueName][maxIndex].ui.show();
                    this._popPool[queueInfo.queueName].splice(maxIndex, 1);

                    if (!this._popPool[queueInfo.queueName].length) {
                        delete this._popPool[queueInfo.queueName]
                        return
                    }
                }
            }
        });
    }

    /**相同组弹窗插入排序 */
    private static _sortQueuePop(pop: UIClass, queueInfo: popQueueInfo) {
        if (this._popPool[queueInfo.queueName] && this._popPool[queueInfo.queueName].find(v => { return v.ui.uiConfig.ID === pop.uiConfig.ID })) return
        if (this._popPool[queueInfo.queueName]) {
            let curWeight = queueInfo.weight
            // let sameNum = this._popPool[queueInfo.queueName].filter(v => { return v.ui.uiConfig.ID === pop.uiConfig.ID }).length;
            // if (sameNum) {
            //     curWeight += sameNum;
            // }
            this._popPool[queueInfo.queueName].push({ weight: curWeight, ui: pop })
        } else {
            this._popPool[queueInfo.queueName] = [{ weight: queueInfo.weight, ui: pop }]
        }
    }
    //计算获得和失去焦点
    public static emitWindowFocusAndBlur() {
        //防止同一时间触发N次
        if (this._timer) {
            clearTimeout(this._timer);
            delete this._timer;
        }
        this._timer = setTimeout(() => {
            this._emitWindowFocusAndBlur();
            delete this._timer;
        }, 10);
    }
    public static _emitWindowFocusAndBlur() {
        var order = this.getUIOrder();
        var id;
        var _focusEmited = false;

        for (var i = 0; i < order.length; i++) {
            id = order[i].key;
            if (this.ui[id]?.uiConfig?.uiType == UIType.Window) {
                if (!_focusEmited) {
                    this.ui[id]?.onFocus();
                    _focusEmited = true;
                } else {
                    this.ui[id]?.onBlur();
                }
            }
        }
    }

}