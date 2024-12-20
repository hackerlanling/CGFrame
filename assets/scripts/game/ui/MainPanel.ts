import { _decorator, Component, Node } from 'cc';
import { RedDotDefine } from '../../frame/red/RedDotDefine';
import { RedDotItem } from '../../frame/red/RedDotItem';

const { ccclass, property } = _decorator;


@ccclass('MainPanel')
export class MainPanel extends Component {

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
        G.init(this);
    }

    start() {
        this.init();
    }

    async init() {
        await G.initAsync();

    }


}


