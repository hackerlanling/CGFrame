import { SDKInterface } from "../SDKInterface";



export class QqSDK extends SDKInterface {

    login(): void {
        //重写掉子类方法
        console.log("qq login!!");
    }

    shader(): void {
        //重写掉子类方法
        console.log("qq shader!!");
    }

}