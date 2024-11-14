

export class StringUtils {

    /**
     * 判断字符串是否为空
     * @param str 
     * @returns 
     */
    static isEmpty(str: string | null | undefined): boolean {
        return !str || str.trim().length === 0;
    }

    /**
     * 将数字转换成中文大写形式
     * @param num - 要转换的数字
     * @returns 转换后的中文字符串
     */
    static numberToChinese(num: number): string {
        // 中文数字的单位
        const units = ["", "十", "百", "千", "万", "十万", "百万", "千万", "亿"];
        // 中文数字的字符
        const digits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

        // 特殊情况：数字为0
        if (num === 0) return digits[0];

        let result = ""; // 存储最终结果的字符串
        let unitIndex = 0; // 单位索引，表示当前位数
        let zeroFlag = false; // 标记是否已经添加过“零”

        // 逐位处理数字
        while (num > 0) {
            const digit = num % 10; // 取得当前数字的最后一位
            if (digit !== 0) {
                // 如果当前位不是0，则添加对应的中文数字和单位
                result = digits[digit] + units[unitIndex] + result;
                zeroFlag = false; // 重置“零”标记
            } else if (!zeroFlag) {
                // 如果当前位是0且之前没有添加过“零”，则添加“零”
                result = digits[0] + result; // 添加“零”
                zeroFlag = true; // 设置“零”标记
            }
            // 去掉最后一位数字，继续处理
            num = Math.floor(num / 10);
            unitIndex++; // 增加单位索引
        }

        // 处理“十”的特例
        if (result.startsWith(digits[1]) && unitIndex > 1) {
            result = result.replace(digits[1], ""); // 去掉开头的“一十”
        }

        return result; // 返回转换后的中文字符串
    }

    

}