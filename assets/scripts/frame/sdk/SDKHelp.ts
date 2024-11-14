import InstanceBase from "../base/InstanceBase";
import { FactorySDK } from "./FactorySDK";
import SDKConfig from "./SDKConfig";
import { SDKInterface } from "./SDKInterface";

export class SDKHelp extends InstanceBase {

    private _sdk: SDKInterface;

    constructor() {
        super();
        this._sdk = FactorySDK.create(SDKConfig.sdkName);
    }

    init(): void {
        this._sdk.init();
    }

    login(): void {
        this._sdk.login();
    }

    shader(): void {
        this._sdk.shader();
    }

}