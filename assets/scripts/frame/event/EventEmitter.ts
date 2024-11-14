type EventCallback = (...args: any[]) => void;

interface EventListener {
    callback: EventCallback;
    target: any;
}

export class EventEmitter {
    private events: Map<string, Set<EventListener>> = new Map();

    /**
     * 注册事件监听器
     * @param eventName 事件名称
     * @param callback 回调函数
     * @param target 事件依赖的对象（通常是界面实例）
     */
    on(eventName: string, callback: EventCallback, target: any): void {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, new Set());
        }

        const listeners = this.events.get(eventName)!;
        listeners.add({ callback, target });
    }

    /**
     * 注册一次性事件监听器
     */
    once(eventName: string, callback: EventCallback, target: any): void {
        const onceWrapper = (...args: any[]) => {
            callback(...args);
            this.off(eventName, onceWrapper, target);
        };
        this.on(eventName, onceWrapper, target);
    }

    /**
     * 移除特定的事件监听器
     */
    off(eventName: string, callback: EventCallback, target?: any): void {
        const listeners = this.events.get(eventName);
        if (!listeners) return;

        for (const listener of listeners) {
            if (
                listener.callback === callback &&
                (!target || listener.target === target)
            ) {
                listeners.delete(listener);
                break;
            }
        }

        if (listeners.size === 0) {
            this.events.delete(eventName);
        }
    }

    /**
     * 根据 target（依赖对象）批量移除所有事件
     */
    offByTarget(target: any): void {
        for (const [eventName, listeners] of this.events) {
            for (const listener of listeners) {
                if (listener.target === target) {
                    listeners.delete(listener);
                }
            }
            if (listeners.size === 0) {
                this.events.delete(eventName);
            }
        }
    }

    /**
     * 触发事件
     */
    emit(eventName: string, ...args: any[]): void {
        const listeners = this.events.get(eventName);
        if (!listeners) return;

        for (const listener of listeners) {
            listener.callback(...args);
        }
    }

    /**
     * 清空所有事件
     */
    clear(): void {
        this.events.clear();
    }
}
