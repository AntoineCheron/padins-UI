import {Flow} from '../types/flow';
import {ComponentMessageHandler} from './message-handlers/component-message-handler';
import {GraphMessageHandler} from './message-handlers/graph-message-handler';
import {SocketService} from './socket.service';
import {WorkspaceService} from './workspace.service';
import {NetworkMessageHandler} from './message-handlers/network-message-handler';
import {TraceMessageHandler} from './message-handlers/trace-message-handler';
/**
 * Main message handler for the FBPNetworkProtocol. This class takes care of redirecting the messages to the proper
 * handlers. These handlers will then take care of doing the proper actions depending on the received message.
 *
 * Use its handleMessage method as the first method to call when receiving a message over the FBP Network Protocol.
 *
 * Created by antoine on 15/06/2017.
 */

export class FBPNetworkMessageHandler {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    component: ComponentMessageHandler;
    graph: GraphMessageHandler;
    network: NetworkMessageHandler;
    trace: TraceMessageHandler;

    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor (private workspaceData: WorkspaceService, private socket: SocketService) {
        this.component = new ComponentMessageHandler(this.workspaceData);
        this.graph = new GraphMessageHandler(this.workspaceData);
        this.network = new NetworkMessageHandler(this.workspaceData);
        this.trace = new TraceMessageHandler(this.workspaceData);
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                        PUBLIC METHODS / GETTERS AND SETTERS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Handle any FBP Network Protocol compliant message by redirecting it to the proper handler.
     *
     * @param ev {MessageEvent} the MessageEvent coming from the WebSocket.
     */
    handleMessage (ev: MessageEvent) {
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

    /**
     * Handle the flow message. It creates a new instance of Flow and store it in the WorkspaceService.
     *
     * The flow:flow message is a custom message that we added to the protocol. It is not described on the official
     * website of the Flow Based Programming Network Protocol.
     *
     * @param msg {Object} the flow:flow message
     */
    handleFlowMessage (msg: Object) {
        const flow: Flow = new Flow(this.workspaceData);
        flow.setFlow(msg);
        this.workspaceData.setFlow(flow);
        this.socket.networkGetStatus();
    }
}
