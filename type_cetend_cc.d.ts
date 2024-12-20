import { NodeEventType } from "cc";


//扩展接口
type k_v<T> = {
    [k: string]: T;
    [k: number]: T;
};
type touchConf = {
    /**锁定按钮点击的间隔 Unit: s*/
    touchDelay?: number;
    /**监听事件列表 */
    onTouchTypes?: NodeEventType[];
    /**多少时间后触发长按 Unit: s*/
    longTouchDelay?: number;
    /**长按回调触发longTouchRepeat + 1次，可以传入macro.REPEAT_FOREVER达到无限次 */
    longTouchRepeat?: number;
    /**需要长按时触发的间隔 Unit: s*/
    longTouchInterval?: number;
    /**点击穿透 停止传递当前事件 */
    propagationStopped?: boolean;
    /**设置是否阻止事件被节点吞噬, 默认为 false 。 如果设置为 true，则事件允许派发给渲染在下一层级的节点 */
    preventSwallow?: boolean;
};
declare module "cc" {
    enum NodeEventType {
        /**
         * 手指结束触摸期间无移动时触发
         */
        TOUCH_NOMOVE = "touch-nomove",
        /**
         * 长按触发
         */
        TOUCH_LONG = "touch-long",
    }

    interface Node {
        get __i18nstring(): string;
        set __i18nstring(val: string | string[]);
        get __i18sprite(): string;
        set __i18sprite(val: string | string[]);

        /**
         * 绑定点击事件，多次调用时覆盖
         * @param fn 回调函数
         * @param delayTime 可选，点击后锁定多少秒，锁定期间该Node不再响应任何事件
         */
        click(fn: (sender?: this, type?: string, event?: EventTouch, fromcode?: boolean) => void, delayTime?: number): void;
        touch(fn, conf?: touchConf): void;
        triggerTouch(type: string): void;
        /**是否关闭点击事件 */
        _touchEnabled: boolean;

        get x(): number;
        set x(val: number);
        get y(): number;
        set y(val: number);
        get scaleX(): number;
        set scaleX(val: number);
        get scaleY(): number;
        set scaleY(val: number);
        __zIndex: number;
        get zIndex(): number;
        set zIndex(val: number);
        get uiOpacity(): UIOpacity;
        get uiTransform(): UITransform;
        get label(): Label;
        get labelOutline(): LabelOutline;
        get labelShadow(): LabelShadow;
        get layout(): Layout;
        get button(): Button;
        get toggle(): Toggle;
        get sprite(): Sprite;
        get spine(): sp.Skeleton;
        get editBox(): EditBox;
        nodesType: k_v<Node>;
        get nodes(): this["nodesType"];
        get string(): string;
        set string(str: string | number);
        get i18nstring(): string;
        set i18nstring(str: string | number);
        get i18sprite(): string;
        set i18sprite(str: string | string[]);
        get progressBar(): ProgressBar;
        get scrollView(): ScrollView;
        get animation(): Animation;
        get richText(): RichText;
        get widget(): Widget;
        get slider(): Slider;
        nodesCache: object;
        getUiWorldPosition(add?: Vec3): Vec3;
    }
    interface Slider {
        _dragging: boolean;
        _touchHandle: boolean;
        _offset: Vec3;
    }

    interface EditBox {
        //手动触发imp 底层刷新逻辑
        _implresize: Function;
        /**是否首次刷新 */
        firstResize: boolean;
    }

    interface Component {
        nodesType: k_v<Node>;
        get nodes(): this["nodesType"];
    }
}