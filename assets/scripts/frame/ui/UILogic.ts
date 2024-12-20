import { Asset, AudioClip, Component, error, Node, Prefab, sp, SpriteFrame, Texture2D, _decorator } from "cc";

import { isValid } from "cc";
import { UIClass } from "./UIClass";
import UIManager from "./UIManager";



const { ccclass, property } = _decorator;

//UILogic基类
@ccclass
export default class UILogic extends Component {

    //持有uiClass实例类
    public uiClass: UIClass;
    //节点树type，在预置体发生变化后，通过 IDE-工作台-更新prefab提示文件 来生成和更新
    nodesType: Record<string, Node>;
    /** */
    onShow() {

    }
    onFocus() {
        //获得焦点，可直接在逻辑层重写
    }
    onBlur() {
        //失去焦点，可直接在逻辑层重写
    }
    onUpdateUi() {
        //show开相同界面，只刷新数据层
    }
    showPage() {
        //打开分页页面，可直接在逻辑层重写
    }
    closePage() {
        //关闭分页页面，可直接在逻辑层重写
    }

    //通过本窗体加载资源，会在窗体被关闭时，销毁对应的资源
    async getAsset(bundleName: string, path: string, type?: typeof Asset) {
        return new Promise((resolve, reject) => {
            G.asset.getAsset(bundleName, path, this.uiClass.uiConfig.ID, type).then((v) => {
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


    remove(): void {
        this.uiClass?.remove();
    }


    /**
     * 打开子界面
     *
     * tiaozhuan表中 args 参数填写 {subPage:'xxx'},xxx 为界面名称
     *
     * @returns
     */
    openSubPage(): void {
        var pageName = this.uiClass.getExtData()?.subPage;
        if (pageName == null || pageName == undefined) return;
        var subPage = UIManager.ui[pageName];
        subPage.show();
    }
}
