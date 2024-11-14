
import { QqSDK } from "./realize/QqSDK";
import { WxSDK } from "./realize/WxSDK";
import { PlatformName } from "./SDKConfig";
import { SDKInterface } from "./SDKInterface";

/**
 * 工厂
 */
export class FactorySDK {

    static create(name: PlatformName): SDKInterface {
        switch (name) {
            case PlatformName.wx: return new WxSDK();
            case PlatformName.qq: return new QqSDK();
            default:
                break;


        }
        return new SDKInterface();
    }

}