import { StringUtils } from "../utils/StringUtils";

export { };

declare global {
    interface Array<T> {
        /**判断是否在数组中 */
        has(this: Array<T>, item: T): boolean;
        /**
         * 返回数组最后一个元素
         */
        end(): T;
        /**
         * 返回一个数组随机元素
         */
        random(): T;
        /**
         * 删除数组元素
         */
        remove(filter: (v: T, i: number, arr: Array<T>) => boolean): Array<T>;
        remove(filter: T): Array<T>;
        /**
         * 删除一个数组元素
         */
        removeOne(filter: (v: T, i: number, arr: Array<T>) => boolean): Array<T>;
        removeOne(filter: T): Array<T>;
        /**
         * 打乱数组
         */
        shuffle(): void;
        /**
         * 返回一个数组在当前数组中的差集
         */
        difference(other: T[]): T[];
        /**
         * 返回一个数组在当前数组中的交集
         */
        intersection(other: T[]): T[];
        /**
         * 数组是否存在重复元素
         */
        isDuplication(): boolean;
        /**
         * 数组平均分成几份
         */
        chunk(number: number): T[][];
    }

    interface Date {
        /**
         * Format a Date to string, pattern is below:
         * @param pattern - format string, like `"YYYY-MM-DD hh:mm:ss"`
         * 大写表示日期，小写一律表示时间，两位表示有前导0，一位表示无前导0
         * Uppercase represents date, lowsercase represents time
         * double char represents with prefix '0', single char represents without prefix '0'
         * Examples:
         * - YYYY/yyyy/YY/yy: year
         * - MM/M: month
         * - DD/D/dd/d: day
         * - HH/H/hh/h: hour(24)
         * - mm/m: minute
         * - ss/s: second
         * - Q/QQ: quater
         */
        format: (pattern?: string) => string;
    }

    interface String {
        toNumber(this: String): number;
        /**
         * 转换成富文本格式
         */
        toRichText<Style extends keyof richTextStyle>(style: Style, args?: richTextStyleValue[Style]): string;
        /**替换富文本(原版font color修改为 color) */
        strReplace(): string
        /**
         * 替换全部字符串
         */;
        replaceAll(searchValue: string | RegExp, replaceValue: string): string;
    }


    interface JSON {
        clone(obj: any): any;
    }
}
type richTextStyle = {
    /**指定字体渲染颜色，颜色值可以是内置颜色，比如 white，black 等，也可以使用 16 进制颜色值，比如 #ff0000 表示红色 */
    color: string;
    /**指定字体渲染大小，大小值必须是一个整数 */
    size: string;
    /**设置文本的描边颜色和描边宽度  如果你没有指定描边的颜色或者宽度的话，那么默认的颜色是白色 (#ffffff)，默认的宽度是 1*/
    outline: string;
    /**指定使用粗体来渲染 */
    b: string;
    /**指定使用斜体来渲染 */
    i: string;
    /**给文本添加下划线 */
    u: string;
    /**指定一个点击事件处理函数，当点击该 Tag 所在文本内容时，会调用该事件响应函数 */
    on: string;
    /**插入一个空行 */
    br: string;
    /**给富文本添加图文混排功能，
     * 引擎自带的富文本 RichText：img 的 src 属性必须是 ImageAtlas 图集里面的一个有效的 spriteframe 名称
     * 框架封装的富文本：Rtf: img 的 src 是一个resources下的图片资源路径 会动态加载
     */
    img: string;
};
type richTextStyleValue = {
    color: {
        color: string;
        click?: string;
    };
    size: {
        size: number;
        click?: string;
    };
    outline: {
        color?: string;
        width?: number;
    };
    b: {};
    i: {};
    u: {};
    on: {
        click: string;
        param?: string;
    };
    br: {};
    img: {
        click?: string;
        param?: string;
    };
};

Array.prototype.has = function (item) {
    return this.indexOf(item) != -1;
};
Array.prototype.end = function (this: Array<any>) {
    return this.slice(-1)[0];
};

Array.prototype.random = function (this: Array<any>) {
    return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.remove = function (this: Array<any>, filter: any) {
    if (typeof filter == "function") {
        for (var i = this.length - 1; i > -1; --i) {
            filter(this[i], i, this) && this.splice(i, 1);
        }
    } else {
        for (var i = this.length - 1; i > -1; --i) {
            this[i] === filter && this.splice(i, 1);
        }
    }
    return this;
};

Array.prototype.removeOne = function (this: Array<any>, filter: any) {
    if (typeof filter == "function") {
        for (var i = 0; i < this.length; ++i) {
            if (filter(this[i], i, this)) {
                this.splice(i, 1);
                return this;
            }
        }
    } else {
        for (var i = 0; i < this.length; ++i) {
            if (this[i] === filter) {
                this.splice(i, 1);
                return this;
            }
        }
    }
    return this;
};

Array.prototype.shuffle = function (this: Array<any>) {
    this.forEach((v, k) => {
        let _k = 0 | (Math.random() * (k + 1));
        var tmp = this[k];
        this[k] = this[_k];
        this[_k] = tmp;
    });
};

Array.prototype.difference = function (this: Array<any>, other: Array<any>) {
    let a = new Set(this);
    let b = new Set(other);

    return Array.from(new Set([...b].filter((x) => !a.has(x))));
};

Array.prototype.intersection = function (this: Array<any>, other: Array<any>) {
    let a = new Set(this);
    let b = new Set(other);

    return Array.from(new Set([...a].filter((x) => b.has(x))));
};

Array.prototype.isDuplication = function (this: Array<any>) {
    return this.length != [...new Set(this)].length;
};

Array.prototype.chunk = function (this: Array<any>, number: number) {
    return number >= 1 && Number.isInteger(number)
        ? this.reduce(
            (pre, cur, index) => {
                pre[pre.length - 1].push(cur);
                if (pre[pre.length - 1].length === number && index != this.length - 1) {
                    pre.push([]);
                }
                return pre;
            },
            [[]]
        )
        : new Error("请检查格式:数组，每个分组元素个数");
};



function prependZero(matched: string, num: number) {
    return matched.length > 1 && num < 10 ? "0" + num : "" + num;
}

Date.prototype.format = function (this: Date, pattern = "YYYY-MM-DD hh:mm:ss") {
    var _this = this;
    return pattern
        .replace(/y{2,}|Y{2,}/, function (v) {
            return (_this.getFullYear() + "").substr(4 - v.length);
        })
        .replace(/M{1,2}/, function (v) {
            return prependZero(v, _this.getMonth() + 1);
        })
        .replace(/D{1,2}|d{1,2}/, function (v) {
            return prependZero(v, _this.getDate());
        })
        .replace(/Q|q/, function (v) {
            return prependZero(v, Math.ceil((_this.getMonth() + 1) / 3));
        })
        .replace(/h{1,2}|H{1,2}/, function (v) {
            return prependZero(v, _this.getHours());
        })
        .replace(/m{1,2}/, function (v) {
            return prependZero(v, _this.getMinutes());
        })
        .replace(/s{1,2}/, function (v) {
            return prependZero(v, _this.getSeconds());
        })
        .replace(/SSS|S/, function (v) {
            var ms = "" + _this.getMilliseconds();
            return v.length === 1 ? ms : "" + (ms.length === 1 ? "00" : ms.length === 2 ? "0" : "") + ms;
        });
};

String.prototype.toNumber = function () {
    return Number(this);
};

String.prototype.toRichText = function (style, args: any = {}) {
    if (["size", "color"].has(style)) {
        let str = StringUtils.STR("<{1}={2}>{3}</{4}>", style, args[style], this, style);
        if (args.click) {
            return str.toRichText("on", args);
        } else {
            return str;
        }
    } else if (style == "outline") {
        let color = args.color ? "color=" + args.color : "";
        let width = args.width ? " width=" + args.width : " width=2";
        return StringUtils.STR("<outline {1}>{2}</outline>", color + width, this);
    } else if (["b", "i", "u"].has(style)) {
        return StringUtils.STR("<{1}>{2}</{3}>", style, this, style);
    } else if (style == "br") {
        return StringUtils.STR("{1}<br/>", this);
    } else if (style == "on") {
        let click = StringUtils.STR('click="{1}"', args.click);
        let param = args.param ? StringUtils.STR(' param="{1}"', args.param) : "";
        return StringUtils.STR("<on {1}>{2}</on>", click + param, this);
    } else if (style == "img") {
        let str = '<img src="' + this + '" ';
        if (args.click) str += 'click="' + args.click + '" ';
        if (args.param) str += 'param="' + args.param + '" ';
        return str + "/>";
    }
};
String.prototype.replaceAll = function (searchValue: string | RegExp, replaceValue: string) {
    if (this.includes(searchValue)) {
        return this.replace(new RegExp(searchValue, "g"), replaceValue);
    } else {
        return this;
    }
};
/**替换富文本 */
String.prototype.strReplace = function (this: string) {
    var str = "";
    if (this.includes("font color")) {
        str = this.replaceAll("font color", "color");
        str = str.replaceAll("/font", "/color");
    } else {
        str = this;
    }
    return str;
};
// @ts-ignore 中文时间戳
Date.prototype.getChinaTime = function (company = "s") {
    if (company != "s" && company != "ms") return "参数错误";
    let timeStamp = company == "s" ? this.getTime() : this.getTime() / 1000;
    var date = new Date(timeStamp * 1000);
    var y = date.getFullYear();
    var m: num_str = date.getMonth() + 1;
    m = m < 10 ? "0" + m : m;
    var d: num_str = date.getDate();
    d = d < 10 ? "0" + d : d;
    var h: num_str = date.getHours();
    h = h < 10 ? "0" + h : h;
    var minute: num_str = date.getMinutes();
    var second: num_str = date.getSeconds();
    var milliseconds: num_str = date.getMilliseconds();
    minute = minute < 10 ? "0" + minute : minute;
    second = second < 10 ? "0" + second : second;
    return y + "年" + m + "月" + d + "日 " + h + "时" + minute + "分" + second + "秒" + milliseconds + "毫秒";
};

/**深拷贝 */
JSON.clone = function (obj: any) {
    return JSON.parse(JSON.stringify(obj));
}