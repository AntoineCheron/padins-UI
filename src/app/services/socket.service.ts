/**
 * Created by antoine on 15/06/2017.
 */
import {FBPNetworkMessageHandler} from './FBPNetworkMessageHandler.service';
import {FBPMessage} from '../types/FBPMessage';
import {Injectable} from '@angular/core';
import {WorkspaceService} from './workspace.service';
import {Node} from '../types/Node';
import {Edge} from '../types/Edge';
import {FileExplorerMessageHandler} from './messageHandlers/FileExplorerMessageHandler';

@Injectable()
export class SocketService {
    ws: WebSocket;
    messageHandler: FBPNetworkMessageHandler;
    fileExplorerMessageHandler: FileExplorerMessageHandler;
    public address: string;
    subprotocol: string;
    eventHub: any;

    constructor (private workspaceData: WorkspaceService) {
        this.messageHandler = new FBPNetworkMessageHandler(this.workspaceData, this);
        this.fileExplorerMessageHandler = new FileExplorerMessageHandler(this.workspaceData);
    }

    connect (address: string, subprotocol: string) {
        this.address = address;
        this.subprotocol = subprotocol;

        this.ws = new WebSocket(address, subprotocol);

        this.ws.onopen = (async (ev: Event) => {
            // Wait for the connexion to be effective
            while (this.ws.readyState !== 1) {
                await this.sleep(50);
            }
            // Right after connexion :
            // Request list of available components
            const msg = new FBPMessage('component', 'list', '');
            this.ws.send(msg.toJSONstring());
            // Update file-explorer content
            this.sendFileExplorerGetNodesMsg();

            // Set the status of the workspace to connected
            this.workspaceData.workspace.networkConnected('main');
        });

        this.ws.onmessage = ((ev: MessageEvent) => {
            const msg = JSON.parse(ev.data);

            if (msg.hasOwnProperty('protocol')) {
                if (msg['protocol'] === 'fileexplorer') {
                    this.fileExplorerMessageHandler.onMessage(ev);
                } else {
                    this.messageHandler.onMessage(ev);
                }
            }
        });

        this.ws.onerror = ((ev: ErrorEvent) => { console.log(ev); });

        this.ws.onclose = ((ev: CloseEvent) => { this.handleClose(ev); });
    }

    close () {
        if (this.ws && this.ws.readyState !== 2 && this.ws.readyState !== 3) {
            this.ws.close();
        }
    }

    handleClose (ev: CloseEvent) {
        // Set the status of the workspace to disconnected
        this.workspaceData.workspace.networkDisconnected('main');
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

    async networkGetStatus () {
        // Wait for the connexion to be effective
        while (this.ws.readyState !== 1) {
            await this.sleep(50);
        }

        const msg = new FBPMessage('network', 'getstatus', { graph: this.workspaceData.flow.graph });
        this.ws.send(msg.toJSONstring());
    }

    /* ----------------------------------------------------------------------------
                               EVENT HUB REACTIONS
     ---------------------------------------------------------------------------- */

    setEventHub (eventHub: any): void {
        this.eventHub = eventHub;

        this.eventHub.on('changenode', (node: Node) => {
            this.sendChangeNode(node);
        });
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

    sendRemoveNode (node: Node) {
        const message: FBPMessage = new FBPMessage('graph', 'removenode', {
            id: node.id,
            graph: node.graph
        });

        this.ws.send(message.toJSONstring());
    }

    sendChangeNode (node: Node) {
        // Update node's previous node info
        node.getPreviousNodesData();

        const message: FBPMessage = new FBPMessage('graph', 'changenode', {
            id: node.id,
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
                        METHODS TO SEND FILE_EXPLORER MESSAGES
     ---------------------------------------------------------------------------- */

    async sendFileExplorerGetNodesMsg () {
        if (this.ws) {
            while (this.ws.readyState !== 1) {
                await this.sleep(50);
            }
            const message = new FBPMessage('fileexplorer', 'getnodes', {});
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
