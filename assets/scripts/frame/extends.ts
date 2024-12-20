import { BlockInputEvents, Button, Component, EditBox, Label, LabelOutline, LabelShadow, Layout, Mask, Node, NodeEventType, PageView, ProgressBar, RichText, SafeArea, ScrollView, Slider, sp, Sprite, Toggle, UIOpacity, UITransform, v3, Vec3, view, View, Widget, Animation } from "cc";


//通过zindex重绘子节点
function resetSiblingIndexByZindex(node: Node) {
    let children = node.children;
    let zorder = [];
    for (var i = 0; i < children.length; i++) {
        zorder.push({ node: children[i], zIndex: children[i].zIndex });
    }
    zorder.sort((a, b) => {
        return a.zIndex - b.zIndex;
    });

    for (var i = 0; i < zorder.length; i++) {
        zorder[i].node.setSiblingIndex(i);
    }
    return zorder;
}

if (!Object.getOwnPropertyDescriptor(Node.prototype, "nodes")) {
    Object.defineProperties(Node.prototype, {
        string: {
            get(this: Node) {
                if (!this.label && !this.richText) {
                    return `node: ${this.name} don't find label component`;
                }
                return this.label ? this.label.string : this.richText.string;
            },
            set(this: Node, str: string | number) {
                if (!str && str !== 0) str = "";
                if (this.label) this.label.string = str.toString();
                else if (this.richText) this.richText.string = str.toString();
            },
        },
        x: {
            get(this: Node) {
                return this.position.x;
            },
            set(this: Node, v: number) {
                let pos = this.position;
                this.setPosition(v, pos.y, pos.z);
            },
        },
        y: {
            get(this: Node) {
                return this.position.y;
            },
            set(this: Node, v: number) {
                let pos = this.position;
                this.setPosition(pos.x, v, pos.z);
            },
        },
        scaleX: {
            get(this: Node) {
                return this.scale.x;
            },
            set(this: Node, v: number) {
                let scale = this.scale;
                this.setScale(v, scale.y, scale.z);
            },
        },
        scaleY: {
            get(this: Node) {
                return this.scale.y;
            },
            set(this: Node, v: number) {
                let scale = this.scale;
                this.setScale(scale.x, v, scale.z);
            },
        },
        label: {
            get(this: Node) {
                return this.getComponent(Label);
            },
        },
        richText: {
            get(this: Node) {
                return this.getComponent(RichText);
            },
        },
        labelOutline: {
            get(this: Node) {
                return this.getComponent(LabelOutline);
            },
        },
        labelShadow: {
            get(this: Node) {
                return this.getComponent(LabelShadow);
            },
        },
        mask: {
            get(this: Node) {
                return this.getComponent(Mask);
            },
        },
        sprite: {
            get(this: Node) {
                return this.getComponent(Sprite);
            },
        },
        spine: {
            get(this: Node) {
                return this.getComponent(sp.Skeleton);
            },
        },
        blockInputEvents: {
            get(this: Node) {
                return this.getComponent(BlockInputEvents);
            },
        },
        button: {
            get(this: Node) {
                return this.getComponent(Button);
            },
        },
        editBox: {
            get(this: Node) {
                return this.getComponent(EditBox);
            },
        },
        layout: {
            get(this: Node) {
                return this.getComponent(Layout);
            },
        },
        pageView: {
            get(this: Node) {
                return this.getComponent(PageView);
            },
        },
        progressBar: {
            get(this: Node) {
                return this.getComponent(ProgressBar);
            },
        },
        safeArea: {
            get(this: Node) {
                return this.getComponent(SafeArea);
            },
        },
        scrollView: {
            get(this: Node) {
                return this.getComponent(ScrollView);
            },
        },
        slider: {
            get(this: Node) {
                return this.getComponent(Slider);
            },
        },
        widget: {
            get(this: Node) {
                return this.getComponent(Widget);
            },
        },
        uiOpacity: {
            get(this: Node) {
                if (!this.getComponent(UIOpacity)) {
                    this.addComponent(UIOpacity);
                }
                return this.getComponent(UIOpacity);
            },
        },
        uiTransform: {
            get(this: Node) {
                if (!this.getComponent(UITransform)) {
                    this.addComponent(UITransform);
                }
                return this.getComponent(UITransform);
            },
        },
        zIndex: {
            get(this: Node) {
                return this.__zIndex == null ? this.getSiblingIndex() : this.__zIndex;
            },
            set(this: Node, val: number) {
                if (val == this.zIndex) return;
                this.__zIndex = val;
                resetSiblingIndexByZindex(this.parent);
            },
        },
        animation: {
            get(this: Node) {
                return this.getComponent(Animation);
            },
        },
        toggle: {
            get(this: Node) {
                return this.getComponent(Toggle);
            },
        },
    });
}
Node.prototype.getUiWorldPosition = function (this: Node, add: Vec3) {
    let worldPos = this.getWorldPosition();
    if (add) {
        worldPos = worldPos.clone().add(add);
    }
    let viewSize = view.getVisibleSize();
    return v3(worldPos.x - viewSize.width / 2, worldPos.y - viewSize.height / 2, 0);
};
//@ts-ignore
Slider.prototype._onTouchEnded = function (this: Slider, event?: EventTouch) {
    this._dragging = false;
    this._touchHandle = false;
    this._offset = new Vec3();

    if (event) {
        event.propagationStopped = true;
    }
    this.node.emit("slideEnd", this);
};
//@ts-ignore
Slider.prototype._onTouchCancelled = function (this: Slider, event?: EventTouch) {
    this._dragging = false;
    if (event) {
        event.propagationStopped = true;
    }
    this.node.emit("slideEnd", this);
};

if (!Object.getOwnPropertyDescriptor(Component.prototype, "nodes")) {
    Object.defineProperties(Component.prototype, {
        nodes: {
            get(this: Component) {
                return this.node?.nodes;
            },
        },
    });
}
EditBox.prototype.onDestroy = function () {
    if (this._impl) {
        View.instance.targetOff(this._impl);

        this._impl.clear();
    }
};
//@ts-ignore
EditBox.prototype._implresize = function (this: EditBox) {
    if (this._impl) {
        //@ts-ignore
        this._impl._resize();
    }
};
//@ts-ignore
EditBox.prototype._init = function (this: EditBox) {
    this._updatePlaceholderLabel();
    this._updateTextLabel();
    //@ts-ignore
    this._isLabelVisible = true;
    this.node.on(NodeEventType.SIZE_CHANGED, this._resizeChildNodes, this);

    const impl = (this._impl = new EditBox._EditBoxImpl());
    impl.init(this);

    this._updateString(this._string);
    this._syncSize();

    this.node.on(NodeEventType.TRANSFORM_CHANGED, this._implresize, this);
};
//@ts-ignore
EditBox.prototype._onTouchBegan = function (this: EditBox, event: EventTouch) {
    if (!this.firstResize) {
        this._implresize();
        this.firstResize = true;
    }
    event.propagationStopped = true;
};