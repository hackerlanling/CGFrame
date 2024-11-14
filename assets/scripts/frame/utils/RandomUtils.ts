/**
 * 随机工具类，用于生成随机数。
 * 提供生成指定范围内随机整数和随机浮点数的方法。
 */
export class RandomUtils {

    /**
     * 生成一个指定范围内的随机整数（包含最小值和最大值）。
     * @param min - 最小值（包含）。
     * @param max - 最大值（包含）。
     * @returns 返回一个位于 min 和 max 之间的随机整数。
     */
    public static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 从给定的列表中随机选择一条数据。
     * @param list - 包含数据的列表。
     * @returns 返回随机选择的数据。如果列表为空，返回 null。
     */
    public static getRandomItem<T>(list: T[]): T | null {
        if (list.length === 0) {
            return null;
        }
        const randomIndex = this.getRandomInt(0, list.length - 1);
        return list[randomIndex]; // 返回随机选择的数据
    }

    /**
     * 从给定的对象列表中随机选择不重复的多个数据。
     * @param list - 包含对象的列表。
     * @param count - 需要随机选择的数量。
     * @returns 返回随机选择的不重复数据的数组。如果 count 超出列表大小，则返回整个列表。
     */
    public static getUniqueRandomItems<T>(list: T[], count: number): T[] {
        if (count > list.length) {
            console.warn('随机数量超过列表大小，返回整个列表。');
            return list;
        }

        const availableItems = [...list];
        const result: T[] = [];

        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * availableItems.length);
            result.push(availableItems[randomIndex]);
            availableItems.splice(randomIndex, 1);
        }

        return result;
    }


    /**
     * 随机生成指定范围内的不重复随机数。
     * @param count - 生成的随机数个数。
     * @param min - 随机数的最小值（包含）。
     * @param max - 随机数的最大值（包含）。
     * @returns 返回一个包含不重复随机数的数组。如果 count 超出范围，则返回空数组。
     */
    public static getUniqueRandomNumbers(count: number, min: number, max: number): number[] {
        const range = max - min + 1;

        if (count > range) {
            console.warn('生成数量超过范围内所有数字，请调整 count 或范围');
            return [];
        }

        const availableNumbers: number[] = [];
        const result: number[] = [];

        for (let i = min; i <= max; i++) {
            availableNumbers.push(i);
        }

        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * availableNumbers.length);
            result.push(availableNumbers[randomIndex]);
            availableNumbers.splice(randomIndex, 1);
        }

        return result;
    }

    /**
     * 根据权重数组随机选择一个索引。
     * @param weights - 权重数组，每个元素的值代表其权重。
     * @returns 返回选中的索引。
     */
    public static getRandomByWeight(weights: number[]): number {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let randomValue = Math.random() * totalWeight;

        for (let i = 0; i < weights.length; i++) {
            if (randomValue < weights[i]) {
                return i;
            }
            randomValue -= weights[i];
        }

        return weights.length - 1;
    }


    /**
     * 根据指定的权重范围生成随机数并返回选择的索引。
     * @param items - 包含项的数组，每项包括权重。
     * @returns 返回选中的索引。
     */
    public static getRandomByWeightedItems<T>(items: { value: T, weight: number }[]): T {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        let randomValue = Math.random() * totalWeight;

        for (const item of items) {
            if (randomValue < item.weight) {
                return item.value;
            }
            randomValue -= item.weight;
        }

        return items[items.length - 1].value;
    }




}
