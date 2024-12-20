import { Node } from 'cc';

declare module 'cc' {

    interface Node {
        
    }
}
if (!Object.getOwnPropertyDescriptor(Node.prototype, 'selectSprite')) {
    Object.defineProperties(Node.prototype, {
        selectSprite: {
            get(this: Node) {
                return this.getComponent('SelectSprite');
            }
        },
        spriteArr: {
            get(this: Node) {
                return this.getComponent('SpriteArr');
            }
        },
        switching: {
            get(this: Node) {
                return this.getComponent('Switching');
            },
        }
    });
}