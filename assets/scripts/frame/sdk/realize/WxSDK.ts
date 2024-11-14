import { SDKInterface } from "../SDKInterface";


export class WxSDK extends SDKInterface {

    init() {

    }

    login(): void {
        //重写掉子类方法
        console.log("wx login!!");
    }


    shader(): void {
        //重写掉子类方法
        console.log("wx shader!!");
    }

}