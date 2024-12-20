type num_str = number | string;

type CallbackInfo = (...any: any[]) => void;

type ListenerInfo = {
    callback: CallbackInfo;
    target?: any;
}