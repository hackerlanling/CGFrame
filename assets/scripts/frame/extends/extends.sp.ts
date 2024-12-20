import { sp, EventTarget } from "cc";

declare module "cc" {
    namespace sp {

        interface Skeleton {
            /** 动画事件目标，用于监听和触发动画相关的事件 */
            animationEvent: EventTarget;
            /** 动画播放完成回调的事件名字 */
            evtFinished: string;
            /**
             * 播放动画
             * @param name 动画名字
             * @param loop 是否循环
             */
            play(name: string, loop?: boolean): sp.Skeleton;
            /**
             * 绑定动画事件回调
             * @param event 事件名
             * @param callback 回调
             * @param target 目标类
             */
            onEvent(event: string, callback: CallbackInfo, target?: any): sp.Skeleton;
            /**
             * 移除动画事件回调
             * @param event 事件名
             * @param callback 回调
             * @param target 目标类
             */
            offEvent(event: string, callback: CallbackInfo, target?: any): void;
            /**
             * 停止动画
             * @param clear 是否清理当前的状态信息
             */
            stop(clear?: boolean): void;
        }
    }


}

sp.Skeleton.prototype.animationEvent = new EventTarget();
sp.Skeleton.prototype.evtFinished = "PLAY_ANI_FINISHED";

sp.Skeleton.prototype.play = function (this: sp.Skeleton, name: string, loop: boolean) {
    if (!this.findAnimation(name)) {
        console.warn(`${this.skeletonData.name}动画文件缺少相关动画名字: '${name}'`);
        return;
    }
    this.setAnimation(0, name, loop);
    return this;
};

sp.Skeleton.prototype.onEvent = function (this: sp.Skeleton, event: string, callback: CallbackInfo, target?: any) {
    if (event === this.evtFinished) {
        this.animationEvent.once(this.evtFinished, callback, target);
        this.setCompleteListener((x) => {
            this.setCompleteListener(null); // 确保只触发一次
            this.animationEvent.emit(this.evtFinished, x);
        });
    } else {
        this.animationEvent.on(event, callback, target);
        this.setEventListener((x, ev: any) => {
            this.animationEvent.emit(ev.data.name, x);
        });
    }
    return this;
};

sp.Skeleton.prototype.offEvent = function (this: sp.Skeleton, event: string, callback: CallbackInfo, target?: any) {
    this.animationEvent?.off(event, callback, target);
};

sp.Skeleton.prototype.stop = function (this: sp.Skeleton, clear?: boolean) {
    this.setEventListener(null);
    this.setCompleteListener(null);

    if (clear) {
        this.clearTracks();
    }

    //@ts-ignore
    this.animationEvent?.clear();
};