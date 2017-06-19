/**
 * Created by antoine on 15/06/2017.
 */
import {FBPNetworkMessageHandler} from './FBPNetworkMessageHandler.service';
import {FBPMessage} from '../types/FBPMessage';
import {Injectable} from '@angular/core';
import {DataService} from './data.service';
import {Node} from '../types/Node';
import {Edge} from "../types/Edge";

@Injectable()
export class SocketService {
    ws: WebSocket;
    messageHandler: FBPNetworkMessageHandler;
    address: string;
    subprotocol: string;

    constructor (private appData: DataService) {
        this.messageHandler = new FBPNetworkMessageHandler(this.appData);
    }

    connect (address: string, subprotocol: string) {
        this.address = address;
        this.subprotocol = subprotocol;

        this.ws = new WebSocket(address, subprotocol);

        this.ws.onopen = ((ev: Event) => {
            // Right after connexion : request list of available components
            const msg = new FBPMessage('component', 'list', '');
            this.ws.send(msg.toJSONstring());
        });

        this.ws.onmessage = ((ev: MessageEvent) => { this.messageHandler.onMessage(ev); });

        this.ws.onerror = ((ev: ErrorEvent) => { console.log(ev); });

        this.ws.onclose = ((ev: CloseEvent) => { this.handleClose(ev); });
    }

    handleClose (ev: CloseEvent) {
        console.log(ev);

        if (ev.code === 1011) {
            this.reconnectSocket();
        }
    }

    async reconnectSocket () {
        let i = 1;

        while (this.ws.readyState !== 1 && i <= 5) {
            this.connect(this.address, this.subprotocol);
            await this.sleep(1000);
            i++;
        }
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

        this.ws.send(message.toJSONstring());
    }

    sendAddEdge (edge: Edge) {
        if (edge !== null) {
            const message: FBPMessage = new FBPMessage('graph', 'addedge', this.buildPayloadForEdge(edge));
            this.ws.send(message.toJSONstring());
        }
    }

    sendRemoveEdge (edge: Edge) {
        if (edge !== null) {
            const message = new FBPMessage('graph', 'removeedge', this.buildPayloadForEdge(edge));
            this.ws.send(message.toJSONstring());
        }
    }

    sendChangeEdge (edge: Edge) {
        if (edge !== null) {
            const message = new FBPMessage('graph', 'changeedge', this.buildPayloadForEdge(edge));
            this.ws.send(message.toJSONstring());
        }
    }

    /* ----------------------------------------------------------------------------
                               GENERIC METHODS
     ---------------------------------------------------------------------------- */

    buildPayloadForEdge (edge: Edge): Object {
        return {
            id: edge.id,
            graph: edge.graph,
            metadata: edge.metadata,
            src: {
                node: edge.src['node'],
                port: edge.src['port']
            },
            tgt: {
                node: edge.tgt['node'],
                port: edge.tgt['port']
            }
        };
    }

    /* ----------------------------------------------------------------------------
                         METHODS TO CREATE SLEEP
     ---------------------------------------------------------------------------- */

    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}
