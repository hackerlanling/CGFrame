import { instantiate, Node } from "cc";
import { StringUtils } from "./StringUtils";

/**
 * 显示中常用的方法
 */
export class ViewUtils {


    /**
     * 动态展示布局
     * 根据数据列表或数量动态创建、复用或隐藏子节点，并提供数据映射功能。
     * 
     * @param parent     父节点，用于放置克隆后的子节点
     * @param dataArr    数据列表 (T[]) 或固定数量 (number)
     * @param cloneTarget 要克隆的模板节点
     * @param mapItem    回调函数，映射节点与数据的关系 (item: Node, data: T, index: number)
     */
    static renderLayoutList<T>(
        parent: Node,
        dataArr: T[] | number,
        cloneTarget: Node,
        mapItem?: (item: Node, data: T, index: number) => void
    ) {
        // 处理 dataArr，如果是 number 类型，生成固定长度的数组
        const dataList: T[] = typeof dataArr === "number" ? Array(dataArr).fill(1) : dataArr;

        const existingChildren = parent.children; // 获取当前父节点的子节点
        const templateNode = instantiate(cloneTarget); // 预克隆模板节点

        // 遍历数据列表
        for (let i = 0; i < dataList.length; i++) {
            let currentNode = existingChildren[i]; // 尝试获取现有的子节点

            if (!currentNode) {
                // 如果不存在，则创建新的节点
                currentNode = instantiate(templateNode);
                currentNode.parent = parent;
            }

            const data = dataList[i]; // 当前索引的数据
            currentNode.active = true; // 确保节点是显示的

            // 调用 mapItem 回调进行数据映射
            mapItem && mapItem(currentNode, data, i);
        }

        // 隐藏多余的节点
        for (let i = dataList.length; i < existingChildren.length; i++) {
            existingChildren[i].active = false;
        }
    }


    
    /**
     * 渲染 x/y 富文本节点，支持不同样式
     * @param node 富文本节点
     * @param now 当前值
     * @param limit 限定值（用来判断颜色变化）
     * @param max 最大值
     * @param options 渲染选项（包含颜色、样式等配置）
     */
    static renderRichText(node: Node, now: number, limit: number, max: number, options: {
        normalColor?: string;   // 默认文本颜色
        highlightColor?: string; // 超出/满足条件的高亮颜色
        slashColor?: string;    // 分隔符（/）颜色
        prefixText?: string;    // 前缀文本
        postfixText?: string;   // 后缀文本
        isOutlined?: boolean;   // 是否描边
        outlineColor?: string;  // 描边颜色
        outlineWidth?: number;  // 描边宽度
    } = {}) {
        const {
            normalColor = "#000000",    // 默认颜色（黑色）
            highlightColor = "#00FF00", // 满足条件时的高亮颜色（绿色）
            slashColor = "#FFFFFF",     // 默认分隔符颜色（白色）
            prefixText = null,            // 前缀文本
            postfixText = "",           // 后缀文本
            isOutlined = false,
            outlineColor = "#000000",
            outlineWidth = 1,
        } = options;

        // 判断颜色：当当前值满足条件时使用 highlightColor
        const leftColor = now >= limit ? highlightColor : normalColor;

        // 构建富文本字符串
        let richTextStr = "";
        richTextStr += prefixText ? `${prefixText} ` : "";
        richTextStr += `<color=${leftColor}>${StringUtils.formatValue(now)}</color>`;
        richTextStr += `<color=${slashColor}>/${StringUtils.formatValue(max)}</color>`;
        richTextStr += postfixText ? ` ${postfixText}` : "";
        richTextStr = richTextStr.toRichText("b");

        // 处理描边
        if (isOutlined) {
            richTextStr = richTextStr.toRichText("outline", { color: outlineColor, width: outlineWidth });
        }

        // 设置节点文本内容
        node.string = richTextStr;
    }



}