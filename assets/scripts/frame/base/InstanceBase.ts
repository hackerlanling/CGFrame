/**
 * 单例基础类
 */
export default class InstanceBase {
    protected static _instance: any;

    public static instance<T extends {}>(this: new () => T): T {
        if (!(<any>this)._instance) {
            (<any>this)._instance = new this();
        }
        return (<any>this)._instance;
    }
}