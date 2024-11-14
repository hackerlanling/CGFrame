import { _decorator, Component, Node } from 'cc';
import { RedDotDefine } from '../../frame/red/RedDotDefine';
import { RedDotItem } from '../../frame/red/RedDotItem';
import { RedDotNode } from '../../frame/red/RedDotNode';
import { RedDotPool } from '../../frame/red/RedPool';
import { SDKHelp } from '../../frame/sdk/SDKHelp';
const { ccclass, property } = _decorator;

class UILogic extends Component {

    addRed(key: string, parent: Node, call: (node: RedDotNode, item: RedDotItem) => void) {
        XF.redDot.addRed(key, parent, call, this);
    }

    putRed(key: string) {
        XF.redDot.putOne(this, key);
    }

    remove() {
        if (this?.node?.isValid) {
            XF.redDot.putTargetAll(this);
            this.node.destroy();
        }
    }
}

@ccclass('MainPanel')
export class MainPanel extends UILogic {

    @property(RedDotItem)
    MailDot: RedDotItem = null;
    @property(RedDotItem)
    MailSystemDot: RedDotItem = null;
    @property(RedDotItem)
    MailTeamDot: RedDotItem = null;

    @property(Node)
    MailDotNode: Node = null;
    @property(Node)
    MailSystemDotNode: Node = null;
    @property(Node)
    MailTeamDotNode: Node = null;

    onLoad() {
        XF.init(this);
    }

    start() {
        this.init();
    }

    async init() {
        await RedDotPool.instance().initRedPool(5);

        this.addRed(RedDotDefine.MailBox, this.MailDotNode, (node: RedDotNode, item: RedDotItem) => {
            item.setDotState(node.rdCount);
            item.setAlign({ right: -20 , top: -20});
        });

        this.addRed(RedDotDefine.MailBox_System, this.MailSystemDotNode, (node: RedDotNode, item: RedDotItem) => {
            item.setDotState(node.rdCount);
        });

        this.addRed(RedDotDefine.MailBox_Team, this.MailTeamDotNode, (node: RedDotNode, item: RedDotItem) => {
            item.setDotState(node.rdCount);
        });

        //初始显示红点信息
        XF.redDot.set(RedDotDefine.MailBox_System, 3);
        XF.redDot.set(RedDotDefine.MailBox_Team, 2);

    }


    OnAddRdSystemBtnClick() {
        let count = XF.redDot.getRedDotCount(RedDotDefine.MailBox_System);
        XF.redDot.set(RedDotDefine.MailBox_System, count + 1);
    }
    OnAddRdTeamBtnClick() {
        let count = XF.redDot.getRedDotCount(RedDotDefine.MailBox_Team);
        XF.redDot.set(RedDotDefine.MailBox_Team, count + 1);
    }
    OnReduceRdSystemBtnClick() {
        let count = XF.redDot.getRedDotCount(RedDotDefine.MailBox_System);
        XF.redDot.set(RedDotDefine.MailBox_System, count - 1);
    }
    OnReduceRdTeamBtnClick() {
        let count = XF.redDot.getRedDotCount(RedDotDefine.MailBox_Team);
        XF.redDot.set(RedDotDefine.MailBox_Team, count - 1);
    }


    testHUIshou() {
        this.remove();
    }
}


