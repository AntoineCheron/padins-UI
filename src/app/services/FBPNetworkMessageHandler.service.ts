import {Flow} from '../types/Flow';
import {ComponentMessageHandler} from './messageHandlers/ComponentMessageHandler';
import {GraphMessageHandler} from './messageHandlers/GraphMessageHandler';
import {SocketService} from './socket.service';
import {WorkspaceService} from './workspace.service';
import {NetworkMessageHandler} from './messageHandlers/NetworkMessageHandler';
import {TraceMessageHandler} from './messageHandlers/TraceMessageHandler';
/**
 * Created by antoine on 15/06/2017.
 */

export class FBPNetworkMessageHandler {
    component: ComponentMessageHandler;
    graph: GraphMessageHandler;
    network: NetworkMessageHandler;
    trace: TraceMessageHandler

    constructor (private workspaceData: WorkspaceService, private socket: SocketService) {
        this.component = new ComponentMessageHandler(this.workspaceData);
        this.graph = new GraphMessageHandler(this.workspaceData);
        this.network = new NetworkMessageHandler(this.workspaceData);
        this.trace = new TraceMessageHandler(this.workspaceData);
    }

    onMessage (ev: MessageEvent) {
        const msg = JSON.parse(ev.data);

        if (msg.hasOwnProperty('protocol')) {
            switch (msg['protocol']) {
                case 'graph' :
                    this.graph.handleMessage(msg);
                    break;
                case 'network' :
                    this.network.handleMessage(msg);
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
                    this.trace.handleMessage(msg);
                    break;
                default:
                    console.log(`Received unknown message : `);
                    console.log(msg);
            }
        }
    }

    handleFlowMessage (msg: Object) {
        const flow: Flow = new Flow(this.workspaceData);
        flow.setFlow(msg);
        this.workspaceData.setFlow(flow);
        this.socket.networkGetStatus();
    }
}
