import { Node, _decorator } from "cc";

import { EComponent } from "../extends/EComponent";
import { UIClass } from "./UIClass";
import UIManager from "./UIManager";

const { ccclass, property } = _decorator;

//UILogic基类
@ccclass
export default class UILogic extends EComponent {

    protected get uiId(): string {
        return this.uiClass.uiConfig.ID;
    }

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
