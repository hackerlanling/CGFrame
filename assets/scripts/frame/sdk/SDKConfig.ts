
export enum PlatformName {
    wx = "wx",
    qq = "qq",
    tt = "tt",
    oppo = "oppo",
    vivo = "vivo",
    huawei = "huawei",
    baidu = "baidu",
    xiaomi = "xiaomi",
    kuaishou = "kuaishou",
    toutiao = "toutiao",
    baidu_mini = "baidu_mini",
}


export default class SDKConfig {

    static sdkName: PlatformName = PlatformName.wx;

    static sdkVersion: string = "1.0.0";




    /**如果是调试模式的话才会显示一些东西： 比如红点之类的 */
    static debug: boolean = false;

}