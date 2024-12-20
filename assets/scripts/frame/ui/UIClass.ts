import { Animation, AnimationClip, BlockInputEvents, Component, error, EventTarget, find, instantiate, Layers, log, Node, screen, tween, Tween, _decorator } from "cc";

import { isValid } from "cc";
import { view } from "cc";
import { each } from "../utils/FunUtils";
import { PoolMgr } from "../Pool/PoolMgr";
import { PoolKey } from "../Pool/PoolConfig";
import UILogic from "./UILogic";
import UIManager from "./UIManager";


const { ccclass, property } = _decorator;

export enum UIType {
    Window, //独立窗体，会接受blur，focus事件，通常直接加入到Canvas/viewRoot
    SubFrame, //子窗体，不接受blur，focus事件，通常加入到主window的某个Node下
}
/**弹窗队列类型 */
export interface popQueueInfo {
    /**队列名 */
    queueName: string;
    /**权重值  0-100*/
    weight: number;
}
//窗口属性配置
export type UIConfig = {
    /**
     * UI唯一标识
     */
    ID: string;
    /**
     * prefab预置体所在的bundle名
     */
    bundleName?: string;
    /**
     * prefab预置体的路径
     */
    prefabPath?: string;
    uiLogic?: typeof UILogic;
    uiType: UIType; //UI类型
    fullScreen?: boolean; //是否全屏窗口，全屏窗口会在显示时，将其他自动排序的窗体隐藏
    autoZindex?: boolean; //是否自动设置层级关系
    fillSize?: boolean; //是否最外框节点的尺寸为winsize
    needDown?: boolean; //是否存在底栏
    needTop?: boolean; //是否存在顶栏
    group?: string; //互斥标记
    inAnim?: boolean; //弹出播放ui_in动画
    ui_mask?: boolean; //自带mask层
    is_block?: boolean; //是否需要穿透 默认true 需要
    isSelfShow?: boolean;
    function?: string; //功能附属（用于关闭事件判断）
    extData?: any;

    popQueue?: popQueueInfo[],//弹窗分组，用于多个弹窗同时调用的话，进行排队处理
};

//窗口状态枚举
export enum UIStatus {
    INIT,
    OPENING, // 打开中
    OPENED, // 打开完成
    REMOVING, // 关闭中
    REMOVED, // 关闭完成
}

//UI生命周期，用于当UI被非正常remove时，能处理对应的onRemove逻辑
class UILifeCycle extends Component {
    start() {
        // log("UI界面被加载=>", this.node.name);
        console.log("UI Show", this.node.name);
    }
    onDestroy() {
        // log("UI界面被销毁=>", this.node.name);
        console.log("UI Hide", this.node.name);
        if (UIManager.get(this.node.name)) {
            UIManager.get(this.node.name)._onRemove();
        }
    }
}


@ccclass
export class UIClass<D = any> {
    public status = UIStatus.INIT;
    /**
     * 界面配置
     */
    public uiConfig: UIConfig;
    /**
     * 实例化后的node节点
     */
    public node: Node;
    /**
     * 实例化后的logic
     */
    public uiLogic: UILogic;
    /**
     * 事件系统
     */
    public event = new EventTarget();
    /**
     * 额外数据
     */
    //@ts-ignore 因需要兼容老版本写法，data需要设置默认值。
    private _data: D = {};
    /**
     * 加入到指定Node里
     */
    private _parentNode: Node;
    /**
     * 是否设置过父节点
     */
    private _isSetParent: boolean;
    private parentUiLogic: UILogic;

    private _isOpen: boolean = false;
    /** 界面是否打开/显示 */
    public get isOpen(): boolean {
        return this._isOpen;
    }

    //构造函数
    constructor(uiConfig: UIConfig) {
        if (uiConfig.uiType == null) {
            error("定义窗口时，需要指定窗口的类型", uiConfig);
            return;
        }
        //默认自动排序
        uiConfig.autoZindex = uiConfig.autoZindex == null ? true : uiConfig.autoZindex;
        uiConfig.fillSize = uiConfig.autoZindex == null ? true : uiConfig.fillSize;
        this.uiConfig = uiConfig;
    }

    private _juhuaTurnNode: any = null;
    //ui加载超过1500毫秒，显示菊花，直到UI显示，关闭菊花
    private async openUiLoading(delayTimems: number = 0) {
        let load = find("Canvas/uiLoading");
        this._juhuaTurnNode = load.uiOpacity;
        tween(this._juhuaTurnNode)
            .to(delayTimems / 1000, { opacity: 0 })
            .to(0, { opacity: 255 })
            .start();
    }
    // 关闭加载
    private closeUiLoading() {
        Tween.stopAllByTarget(this._juhuaTurnNode);
        this._juhuaTurnNode.opacity = 0;
    }
    get isShow() {
        return this.status == UIStatus.OPENING || this.status == UIStatus.OPENED;
    }
    /**
     * 显示界面
     * @returns void
     */
    async show() {
        /**判断是否有相同队列弹窗存在，如果有，就拦截 */
        if (this.uiConfig.popQueue && this.uiConfig.popQueue.length > 0) {
            if (!UIManager.checkQueuePopShow(this)) return
        }
        //正在打开中则不处理，避免多次加载
        if (this.status == UIStatus.OPENING || this.status == UIStatus.REMOVING) {
            // console.log("159 遇到拦截 this.status:", this.status);
            return;
        }
        this.removeSameGroup();

        if (!this?.node?.isValid) {
            let delayTimems = !G.asset.ifAssetLoaded(this.uiConfig.bundleName, this.uiConfig.prefabPath, this.uiConfig.ID) ? 1500 : 0;
            //log('============菊花开启时间', delayTimems);
            this.openUiLoading(delayTimems);
            await this._instantiate();
        }

        //@ts-ignore
        if (this.status != UIStatus.OPENED) {
            // console.log("175 遇到拦截");
            return;
        }

        if (this.node.isValid) {
            this.node.active = true;
            if (this.uiConfig.autoZindex) {
                //打开时，自动到最顶端
                this.gotoTop();
            }
            this.event.emit("show");
            UIManager.onUIShow(this);
        }

        if (this.uiConfig.ui_mask) {
            this.setMask();
        }
    }

    /**
     * 页面打开时，自动关闭相同group的其他界面
     * @returns
     */
    removeSameGroup() {
        if (!this.uiConfig.group) return;
        UIManager.removeUI((_uiClass: UIClass<D>) => {
            if (_uiClass.uiConfig.group === this.uiConfig.group && !this.uiConfig.isSelfShow) {
                return true;
            }
        });
        UIManager.updateUi((_uiClass: UIClass<D>) => {
            if (_uiClass.uiConfig.group === this.uiConfig.group && _uiClass.uiConfig.ID === this.uiConfig.ID && this.uiConfig.isSelfShow) {
                return true;
            }
        });
    }
    /**
     * 设置该UI的父，在show之前调用
     * @param parent 父节点
     * @returns
     */
    setParent(parent?: Node): UIClass<D> {
        this._parentNode = parent;
        this._isSetParent = !!parent;
        return this;
    }
    getParent() {
        if (this._parentNode && isValid(this._parentNode)) {
            return this._parentNode;
        }
        return find("Canvas/viewRoot");
    }
    /**
     * 实例化后的mask节点
     */
    private mask: Node;
    /**
     * 遮罩对象池
     */
    private get maskPool() {
        return PoolMgr.instance().getPool(PoolKey.UI_MASK);
    }
    /**设置mask */
    async setMask() {
        if (this.mask) return;
        let mask = this.maskPool.get();
        if (!isValid(this.node)) {
            return this.maskPool.put(mask);
        }
        this.mask = mask;
        this.node.insertChild(mask, 0);
        mask.uiTransform.width = view.getVisibleSize().width / 0.2;
        mask.uiTransform.height = view.getVisibleSize().height / 0.2;
        mask.click(() => {
            if (this.uiConfig.extData?.maskClick === false) {
                return;
            }
            if (this._maskClick) {
                this._maskClick();
            } else {
                this.remove();
            }
        });
        let parentTaggle = "";
        let scor = Object.values(UIManager.maskValue)
            .filter((v) => isValid(v.uiClass.node))
            .sort(function (a, b) {
                return b.uiClass.node.zIndex - a.uiClass.node.zIndex;
            });
        each(scor, (v) => {
            if (v.uiClass.node.zIndex > this.node.zIndex) {
                parentTaggle = v.uiClass.uiConfig.ID;
                return false;
            }
            if (isValid(v.uiClass.mask) && !v.parentTaggle) {
                v.parentTaggle = this.uiConfig.ID;
                v.uiClass.mask.active = false;
            }
        });

        UIManager.maskValue[this.uiConfig.ID] = { uiClass: this, parentTaggle };

        this.mask.active = !parentTaggle;
    }
    removeMsk() {
        if (this.mask) {
            this.maskPool.put(this.mask);
            each(UIManager.maskValue, (v) => {
                if (isValid(v.uiClass.mask) && v.parentTaggle == this.uiConfig.ID) {
                    v.parentTaggle = null;
                    v.uiClass.mask.active = true;
                }
            });
            delete UIManager.maskValue[this.uiConfig.ID];
            this.mask = null;
        }
    }
    /**mask点击事件 */
    _maskClick: () => void;
    /**
     * 打开前设置扩展数据
     * @param val 扩展数据内容
     * @returns
     */
    public setExtData(val: D): UIClass<D> {
        this._data = val;
        return this;
    }
    /**
     * 获取扩展数据
     * @returns 扩展数据值
     */
    public getExtData(): D {
        return this._data;
    }
    /*
     * remove里的destroy，会通过UILifeCycle的onDestroy触发下面的 _onRemove 方法
     * 不直接在remove里调用_onRemove，是为了解决如果业务逻辑里，强制调用了类似 destroyAllChildren 之类的代码时，能正常处理
     */
    /**
     * 关闭界面
     */
    remove() {
        if (this.status != UIStatus.OPENED) {
            // 如果在打开中或者关闭中不重复执行
            // console.log("246 遇到拦截");
            return;
        }

        if (this.uiConfig.ui_mask || this.mask) this.removeMsk();
        this.status = UIStatus.REMOVING;
        this._isOpen = false;

        if (this?.node?.isValid) {
            this.node.destroy();
        }
        this._parentNode = null;
        this._isSetParent = false;
        //@ts-ignore
        this._data = {};

        this.status = UIStatus.REMOVED;

        /**检测当前关闭界面如果有相同队列的，就向下遍历 */
        if (this.uiConfig.popQueue && this.uiConfig.popQueue.length > 0) {
            UIManager.removeSameQueue(this)
        }

    }

    once(funType, fun) {
        this.event && this.event.once(funType, fun);
        return this;
    }

    updateUi() {
        this.uiLogic?.onUpdateUi();
    }
    _onRemove() {
        this.event.emit("remove");
        //@ts-ignore
        this.event.clear(); //TS里提示没有？

        this.status = UIStatus.REMOVED;
        UIManager.onUIRemove(this);

        if (this.parentUiLogic && this.parentUiLogic.node?.isValid) {
            this.parentUiLogic.uiClass.onOpen();
        }
        delete this.parentUiLogic;
        G.asset.decRefByTag(this.uiConfig.ID);
    }

    toggleParent(parentUiLogic: UILogic) {
        this.parentUiLogic = parentUiLogic;
        return this;
    }
    /**
     * 将UI置于最前层
     * @returns
     */
    gotoTop() {
        UIManager.toTop(this.uiConfig.ID);
        this.event.emit("gotoTop");
        return this;
    }

    /**
     * 界面被重现打开
     */
    public onOpen() {
        this.node.uiOpacity.opacity = 255;
        this._isOpen = true;
        G.event.emit("onOpenUI", this);
    }

    /**
     * 界面被隐藏
     */
    public onHide() {
        this.node.uiOpacity.opacity = 0;
        this._isOpen = false;
        G.event.emit("onHideUI", this);
    }

    /**
     * 获取焦点事件
     */
    onFocus() {
        //获得焦点
        //cc.log("窗口获得焦点"+this.uiConfig.ID);
        this.uiLogic?.onFocus();
        this.event.emit("focus");
    }
    /**
     * 失去焦点事件
     */
    onBlur() {
        //cc.log("窗口失去焦点"+this.uiConfig.ID);
        this.uiLogic?.onBlur();
        this.event.emit("blur");
    }

    /**
     * 创建界面
     */
    async _instantiate() {
        this.status = UIStatus.OPENING;
        let ui_in: AnimationClip = null;

        var prefab = await G.asset.getPrefab(this.uiConfig.bundleName, this.uiConfig.prefabPath, this.uiConfig.ID);
        if (this.uiConfig.inAnim) {
            ui_in = (await G.asset.getAsset("ui", "animation/UI-tanchu", this.uiConfig.ID, AnimationClip)) as AnimationClip;
        }
        //@ts-ignore
        if (this.status == UIStatus.REMOVING || this.status == UIStatus.REMOVED) {
            // console.log("327 遇到拦截");
            return;
        }

        //防止外部设置了父节点 然后父节点有被销毁了
        if (this._isSetParent && !isValid(this._parentNode)) {
            this._isSetParent = false;
            this.status = UIStatus.INIT;
            this.closeUiLoading();
            return;
        }

        if (!prefab) {
            log("UI实例化失败");
            return;
        }

        this.node = instantiate(prefab);
        this.node.layer = Layers.BitMask.UI_2D;
        this.node.name = this.uiConfig.ID;
        this.node.parent = this.getParent();

        if (this.uiConfig.inAnim && ui_in) {
            let animation = this.node.getComponent(Animation);
            if (!animation) {
                animation = this.node.addComponent(Animation);
            }
            animation.defaultClip = ui_in;
            animation.play();
        }
        //填充满全屏
        if (this.uiConfig.fillSize) {
            this.node.uiTransform.width = screen.windowSize.width;
            this.node.uiTransform.height = screen.windowSize.height;
        }
        this.node.x = this.node.y = 0;

        this.closeUiLoading();

        //挂载主逻辑
        this.uiLogic = this.node.getComponent(this.uiConfig.uiLogic);
        if (!this.uiLogic) {
            this.uiLogic = this.node.addComponent(this.uiConfig.uiLogic);
        }
        //this.uiLogic = uiLogin as UILogic;
        this.uiLogic.uiClass = this;
        this.uiLogic?.onShow();

        if (this.parentUiLogic && this.parentUiLogic.node?.isValid) {
            this.parentUiLogic.uiClass.onHide();
        }

        //生命周期
        this.node.addComponent(UILifeCycle);

        //挂载BlockInputEvents
        if (this.uiConfig.is_block || this.uiConfig.is_block == null) this.node.addComponent(BlockInputEvents);

        this.status = UIStatus.OPENED;
        this._isOpen = true;
    }
}
