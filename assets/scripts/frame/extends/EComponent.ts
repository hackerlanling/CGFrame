import { isValid, AudioClip, Prefab, SpriteFrame, Texture2D, sp } from "cc";
import { Asset } from "cc";
import { Component, _decorator } from "cc";

const { ccclass, property } = _decorator;

/**
 * 扩展的组件基类
 *  1.主要用于 页面 或者 Item 都可以使用的通用基类
 *  2.实现监听的逻辑处理
 *  3.实现加载资源的逻辑处理和释放的情况
 */
@ccclass("EComponent")
export abstract class EComponent extends Component {

    /**监听器*/
    protected listener: Map<string, ListenerInfo> = new Map();

    /**资源依赖的页面id */
    protected abstract get uiId(): string;

    async getAsset(bundleName: string, path: string, type?: typeof Asset) {
        if (!this.uiId) {
            console.error("not set uiId!!!");
            return;
        }
        return new Promise((resolve, reject) => {
            G.asset.getAsset(bundleName, path, this.uiId, type).then((v) => {
                if (isValid(this.node, true)) {
                    resolve(v);
                }
            });
        });
    }
    public async getAudio(path: string, bundleName: string = "audio"): Promise<AudioClip> {
        return this.getAsset(bundleName, path, AudioClip) as any;
    }
    public async getPrefab(bundleName: string = "ui", path: string): Promise<Prefab> {
        return this.getAsset(bundleName, path, Prefab) as any;
    }
    public async getSpriteFrame(bundleName: string = "ui", path: string): Promise<SpriteFrame> {
        return this.getAsset(bundleName, path, SpriteFrame) as any;
    }
    public async getTexture(bundleName: string = "ui", path: string): Promise<Texture2D> {
        return this.getAsset(bundleName, path, Texture2D) as any;
    }
    public async getSkeletonData(bundleName: string = "ui", path: string): Promise<sp.SkeletonData> {
        return this.getAsset(bundleName, path, sp.SkeletonData) as any;
    }

    
    /**
     * 添加事件
     * @param event 
     * @param callback 
     * @param target 
     * @returns 
     */
    public addListener(event: string, callback: CallbackInfo, target?: any) {
        if (this.listener.has(event)) {
            console.log("Duplicate event listener:", event);
            return;
        }
        this.listener.set(event, { callback, target });
        G.event.on(event, callback, target);
    }

    /**
     * 移除事件
     * @param event 
     * @param callback 
     * @param target 
     * @returns 
     */
    public removeListener(event: string, callback: CallbackInfo, target?: any) {
        if (!this.listener.has(event)) {
            console.log("No event listener found:", event);
            return;
        }
        this.listener.delete(event);
        G.event.off(event, callback, target);
    }

    /**
     * 清理所有事件
     */
    public clearListener() {
        for (let [event, data] of this.listener) {
            G.event.off(event, data.callback, data.target);
        }
        this.listener.clear();
    }

    protected onDestroy() {
        this.clearListener();
    }

}