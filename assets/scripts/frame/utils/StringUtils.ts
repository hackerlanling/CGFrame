
/**
 * 字符串工具类
 */
export class StringUtils {

    /**
     * 替换字符串{}中的内容
     * @param str 需要修改的字符串
     * @returns 修改后的字符串
     */
    static STR(str: string, args?: num_str[]): string;
    static STR(str: string, ...args: num_str[]): string;
    static STR(str: string): string {
        if (arguments.length < 2) return str;
        if (arguments.length == 2 && Object.prototype.toString.call(arguments[1]) == "[object Array]") {
            let args = arguments[1];
            for (let i = 0; i < args.length; i++) {
                str = str.replace(new RegExp("\\{" + (i + 1) + "\\}", "g"), args[i]);
            }
        } else {
            for (let i = 1; i < arguments.length; i++) {
                str = str.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
            }
        }
        return str;
    }

    /**
     * 返回str的长度 chr(255)以上计为2个长度
     * @param str 
     * @returns 
     */
    static strLength(str: string): number {
        var a = 0;
        if (str == null) return a;
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 255) a += 2; //按照预期计数增加2
            else a++;
        }
        return a;
    }


    /**
     * 数字格式化
     * @param n 
     * @returns 
     */
    static formatValue(n: number): string {
        let str = "";
        if (n < 100000) {// 十万
            str = n.toString();
        } else if (n < 10000000) {// 一千万
            str = parseFloat((Math.floor(n / 10) / 100).toString()) + "K";
        } else if (n < 1000000000) {// 十亿
            str = parseFloat((Math.floor(n / 10000) / 100).toString()) + "M";
        } else {
            str = parseFloat((Math.floor(n / 10000000) / 100).toString()) + "B";
        }
        return str;
    }

    /**
     * 检测是否包含特殊字符
     * @param str 
     * @returns 
     */
    static hasSpecialchar(str: any): boolean {
        var patrn = /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、 ]/im;
        if (!patrn.test(str)) {
            return false;
        }
        return true;
    }

}