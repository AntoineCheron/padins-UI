/**
 * Created by antoine on 15/06/2017.
 */
import {FBPNetworkMessageHandler} from './FBPNetworkMessageHandler.service';
import {FBPMessage} from '../types/FBPMessage';
import {Injectable} from '@angular/core';
import {DataService} from './data.service';
import {Node} from '../types/Node';

@Injectable()
export class SocketService {
    ws: WebSocket;
    messageHandler: FBPNetworkMessageHandler;

    constructor (private appData: DataService) {
        this.messageHandler = new FBPNetworkMessageHandler(this.appData);
    }

    connect (address: string, subprotocol: string) {
        this.ws = new WebSocket(address, subprotocol);

        this.ws.onopen = ((ev: Event) => {
            // Right after connexion : request list of available components
            const msg = new FBPMessage('component', 'list', '');
            this.ws.send(msg.toJSONString());
        });

        this.ws.onmessage = ((ev: MessageEvent) => { this.messageHandler.onMessage(ev); });
    }

    /* ----------------------------------------------------------------------------
                                 METHODS TO SEND MESSAGES
     ---------------------------------------------------------------------------- */

    sendAddNode (node: Node) {
        const message: FBPMessage = new FBPMessage('graph', 'addnode', {
            id: node.id,
            component: node.component,
            metadata: node.metadata,
            graph: node.graph
        });

        this.ws.send(message.toJSONString());
    }
}
