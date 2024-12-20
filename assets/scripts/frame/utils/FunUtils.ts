export function each<T>(obj: T[] | Record<string, T>, iterator: (value: T, key: string | number) => boolean | void): void {
    if (!obj) return;

    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            if (iterator(obj[i], i) === false) return;
        }
    } else {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (iterator(obj[key], key) === false) return;
            }
        }
    }
}