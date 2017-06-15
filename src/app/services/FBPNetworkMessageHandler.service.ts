import {Flow} from '../types/Flow';
import {ComponentMessageHandler} from "./messageHandlers/ComponentMessageHandler";
import {DataService} from "./data.service";
/**
 * Created by antoine on 15/06/2017.
 */

export class FBPNetworkMessageHandler {
    // TODO : one handler per message type
    component: ComponentMessageHandler;

    constructor (private appData: DataService) {
        this.component = new ComponentMessageHandler(this.appData);
    }

    onMessage (ev: MessageEvent) {
        const msg = JSON.parse(ev.data);

        if (msg.hasOwnProperty('protocol')) {
            switch (msg['protocol']) {
                case 'graph' :
                    console.log(msg);
                    break;
                case 'network' :
                    console.log(msg);
                    break;
                case 'component' :
                    this.component.handleMessage(msg);
                    break;
                case 'runtime' :
                    console.log(msg);
                    break;
                case 'flow' :
                    this.handleFlowMessage(msg['flow']);
                    break;
                case 'trace' :
                    console.log(msg);
                    break;
                default:
                    console.log(`Received unknown message : ${msg}`);
            }
        }
    }

    handleFlowMessage (msg: Object) {
        console.log(msg);
        const flow: Flow = new Flow();
        flow.setFlow(msg);
        this.appData.setFlow(flow);
    }
}
