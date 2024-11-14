import { RedDotItem } from "./red/RedDotItem";

/**红点更新的回调函数 */
export type RedChargeCall = (newValue: number, redItem?: RedDotItem) => void;

/**红点回调结构 */
export type RedCallInfo = {
    /**红点发生改变的回调函数 */
    callback: RedChargeCall;
    /**目标类型 */
    target: any;
}