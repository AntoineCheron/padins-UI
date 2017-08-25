/**
 * This service provides a websocket connexion from this frontend to the backend. The websocket is used to connect the
 * user interface to a specific project, selected on the Workspace-chooser view.
 *
 * The methods to communicate with the backend about workflow changes are implemented in this class.
 *
 * Only one instance must exists at runtime.
 *
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

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    ws: WebSocket;
    messageHandler: FBPNetworkMessageHandler;
    fileExplorerMessageHandler: FileExplorerMessageHandler;
    public address: string;
    subprotocol: string;
    eventHub: any;

    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor (private workspaceData: WorkspaceService) {
        this.messageHandler = new FBPNetworkMessageHandler(this.workspaceData, this);
        this.fileExplorerMessageHandler = new FileExplorerMessageHandler(this.workspaceData);
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                            WEBSOCKET METHODS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Connect the websocket to the given address and subprotocol and set the onopen, onmessage, onerror and onclose
     * methods on the WebSocket instance.
     *
     * @param address {string} the absolute URL of the backend
     * @param workspaceId {string} the id of the workspace to connect to
     */
    connect (address: string, workspaceId: string) {
        this.address = address;
        this.subprotocol = workspaceId;

        this.ws = new WebSocket(address, workspaceId);

        this.ws.onopen = ((ev: Event) => this.handleOpen(ev));

        this.ws.onmessage = ((ev: MessageEvent) => this.handleMessage(ev));

        this.ws.onerror = ((ev: ErrorEvent) => this.handleError(ev));

        this.ws.onclose = ((ev: CloseEvent) => { this.handleClose(ev); });
    }

    /**
     * Close the WebSocket connexion.
     * After the socket is closed, it is impossible to communicate with the server about the project.
     */
    close () {
        if (this.ws && this.ws.readyState !== 2 && this.ws.readyState !== 3) {
            this.ws.close();
        }
    }

    /**
     * Reconnect the WebSocket to the already configured address and workspace.
     *
     * @returns {Promise<void>}
     */
    async reconnectSocket () {
        let i = 1;

        while (this.ws.readyState !== 1 && i <= 5) {
            this.connect(this.address, this.subprotocol);
            await this.sleep(1000);
            i++;
        }
    }

    /**
     * Handle the CloseEvent from the WebSocket instance.
     *
     * @param ev {CloseEvent} the event to handle
     */
    handleClose (ev: CloseEvent) {
        // Set the status of the workspace to disconnected
        this.workspaceData.workspace.networkDisconnected('main');
        console.log(ev);

        if (ev.code === 1011) {
            this.reconnectSocket();
        }
    }

    /**
     * Handle the open event of the WebSocket.
     *
     * Right after connexion, it request the list of components for the selected workspace and the content of the root
     * directory of the project.
     *
     * @param ev
     * @returns {Promise<void>}
     */
    async handleOpen (ev: Event) {
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
    }

    /**
     * Handle the message received on the WebSocket.
     *
     * @param ev {MessageEvent} the event containing the message
     */
    handleMessage (ev: MessageEvent) {
        const msg = JSON.parse(ev.data);

        if (msg.hasOwnProperty('protocol')) {
            if (msg['protocol'] === 'fileexplorer') {
                this.fileExplorerMessageHandler.onMessage(ev);
            } else {
                this.messageHandler.onMessage(ev);
            }
        }
    }

    /**
     * Handle the error event of the WebSocket.
     *
     * @param ev {ErrorEvent} the event to handle
     */
    handleError (ev: ErrorEvent) {
        console.error(ev);
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                            EVENT HUB REACTIONS
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * Set the eventhub instance.
     * The eventhub is a GoldenLayout component used as a hub to centralize the communication between the views.
     *
     * @param eventHub {any} the new hub to use
     */
    setEventHub (eventHub: any): void {
        this.eventHub = eventHub;

        this.eventHub.on('changenode', (node: Node) => {
            this.sendChangeNode(node);
        });
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                            METHODS TO SEND MESSAGES
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * Send a network:getstatus message.
     *
     * https://flowbased.github.io/fbp-protocol/#network-getstatus
     *
     * @returns {Promise<void>}
     */
    async networkGetStatus () {
        // Wait for the connexion to be effective
        while (this.ws.readyState !== 1) {
            await this.sleep(50);
        }

        const msg = new FBPMessage('network', 'getstatus', { graph: this.workspaceData.flow.graph });
        this.ws.send(msg.toJSONstring());
    }

    /**
     * Send a "graph:addnode" message.
     * To use after the user added a node on the graph.
     *
     * https://flowbased.github.io/fbp-protocol/#graph-addnode
     *
     * @param node {Node} the added node
     */
    sendAddNode (node: Node) {
        const message: FBPMessage = new FBPMessage('graph', 'addnode', {
            id: node.id,
            component: node.component,
            metadata: node.metadata,
            graph: node.graph
        });

        this.ws.send(message.toJSONstring());
    }

    /**
     * Send a "graph:removenode" message.
     * To use after the user removed a node from the graph.
     *
     * https://flowbased.github.io/fbp-protocol/#graph-removenode
     *
     * @param node {Node} the removed node
     */
    sendRemoveNode (node: Node) {
        const message: FBPMessage = new FBPMessage('graph', 'removenode', {
            id: node.id,
            graph: node.graph
        });

        this.ws.send(message.toJSONstring());
    }

    /**
     * Send a "graph:changenode" message.
     * To use after the user changed any metadata of the node.
     *
     * https://flowbased.github.io/fbp-protocol/#graph-updatenode
     *
     * @param node {Node} the modified node
     */
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

    /**
     * Send a "graph:addedge" message.
     * To use after the user added an edge on the graph.
     *
     * https://flowbased.github.io/fbp-protocol/#graph-addedge
     *
     * @param edge {Edge} the added edge
     */
    sendAddEdge (edge: Edge) {
        if (edge !== null) {
            const message: FBPMessage = new FBPMessage('graph', 'addedge', this.buildPayloadForEdge(edge));
            this.ws.send(message.toJSONstring());
        }
    }

    /**
     * Send a "graph:removeedge" message.
     * To use after the user removed an edge on the graph.
     *
     * https://flowbased.github.io/fbp-protocol/#graph-removeedge
     *
     * @param edge {Edge} the removed edge
     */
    sendRemoveEdge (edge: Edge) {
        if (edge !== null) {
            const message = new FBPMessage('graph', 'removeedge', this.buildPayloadForEdge(edge));
            this.ws.send(message.toJSONstring());
        }
    }

    /**
     * Send a "graph:changeedge" message.
     * To use after the user changed the metadata of an edge.
     *
     * https://flowbased.github.io/fbp-protocol/#graph-changeedge
     *
     * @param edge {Edge} the udpated edge
     */
    sendChangeEdge (edge: Edge) {
        if (edge !== null) {
            const message = new FBPMessage('graph', 'changeedge', this.buildPayloadForEdge(edge));
            this.ws.send(message.toJSONstring());
        }
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                    METHODS TO SEND FILE_EXPLORER MESSAGES
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * Send a "filexplorer:getnodes" message.
     * Will received a message containing the file structure of the root directory of the workspace as a tree.
     *
     * @returns {Promise<void>}
     */
    async sendFileExplorerGetNodesMsg () {
        if (this.ws) {
            while (this.ws.readyState !== 1) {
                await this.sleep(50);
            }
            const message = new FBPMessage('fileexplorer', 'getnodes', {});
            this.ws.send(message.toJSONstring());
        }
    }

    /* -----------------------------------------------------------------------------------------------------------------
                               GENERIC METHODS
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * Create a FBPMessage compliant payload object for the given Edge
     *
     * @param edge {Edge} the edge to use
     * @returns {Object} the FBPMessage compliant payload object
     */
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

    /**
     * Pause the execution of a function for the given amount of milliseconds.
     *
     * @param ms {number} the duration of the sleep, in milliseconds
     * @returns {Promise<T>}
     */
    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}
