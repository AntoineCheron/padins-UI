import {Injectable} from '@angular/core';
import {FBPMessage} from '../../types/fbp-message';
import {Node} from '../../types/node';
import {Edge} from '../../types/edge';
import {WorkspaceService} from '../workspace.service';
/**
 * Handle the messages of the graph subprotocol from flow-based programming network protocol.
 *
 * This protocol is utilized for communicating about graph changes in both directions.
 *
 * This subprotocol description can be found here :
 * https://flowbased.github.io/fbp-protocol/#graph-clear
 *
 * Created by antoine on 15/06/2017.
 */

@Injectable()
export class GraphMessageHandler {

    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor (private workspaceData: WorkspaceService) {
        // Nothing for now
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                            PUBLIC METHODS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Redirect the given message to the proper handler method.
     *
     * @param msg {Object} the received graph message
     */
    handleMessage (msg: Object) {
        const message: FBPMessage = new FBPMessage(msg['protocol'], msg['command'], msg['payload']);

        switch (message.getCommand()) {
            case 'addnode':
                this.addNode(message.getPayloadAsJSON());
                break;
            case 'addedge':
                this.addEdge(message.getPayloadAsJSON());
                break;
            case 'removeedge':
                this.removeEdge(message.getPayloadAsJSON());
                break;
            case 'changeedge':
                this.changeEdge(message.getPayloadAsJSON());
                break;
            case 'removenode':
                this.removeNode(message.getPayloadAsJSON());
                break;
            case 'changenode':
                this.changeNode(message.getPayloadAsJSON());
                break;
            default:
                console.log(`Unknown message on graph : ${message.toJSONstring()}`);
        }
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                            PRIVATE METHODS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Add a node on the graph. The node contains the received information.
     *
     * https://flowbased.github.io/fbp-protocol/#graph-addnode
     *
     * @param msg {Object} the 'graph:addnode' message
     */
    private addNode (msg: Object) {
        const n: Node = new Node(msg, this.workspaceData);
        this.workspaceData.addNode(n);
    }

    /**
     * Remove the node with the received id from the graph.
     *
     * https://flowbased.github.io/fbp-protocol/#graph-removenode
     *
     * @param msg {Object} the 'graph:removenode' message
     */
    private removeNode (msg: Object) {
        const n: Node = this.workspaceData.getNode(msg['id']);

        this.workspaceData.removeNode(n);
    }

    /**
     * Change the node with the received id's metadata, replacing them with the received metadata.
     *
     * https://flowbased.github.io/fbp-protocol/#graph-changenode
     *
     * @param msg {Object} the 'graph:changenode' message
     */
    private changeNode (msg: Object) {
        const n: Node = this.workspaceData.getNode(msg['id']);
        n.setMetadata(msg['metadata']);
    }

    /**
     * Add an edge on the graph. The edge contains the received information.
     *
     * https://flowbased.github.io/fbp-protocol/#graph-addedge
     *
     * @param msg {Object} the 'graph:addedge' message
     */
    private addEdge (msg: Object) {
        const e: Edge = new Edge(msg);

        this.workspaceData.addEdge(e);
    }

    /**
     * Remove the edge with the received id from the graph.
     *
     * https://flowbased.github.io/fbp-protocol/#graph-removeedge
     *
     * @param msg {Object} the 'graph:removeedge' message
     */
    private removeEdge (msg: Object) {
        const e: Edge = this.workspaceData.getEdge(msg['id']);

        this.workspaceData.removeEdge(e);
    }

    /**
     * Change the node with the received id's metadata src and tgt, replacing them with the received ones.
     *
     * https://flowbased.github.io/fbp-protocol/#graph-changeedge
     *
     * @param msg {Object} the 'graph:changeedge' message
     */
    private changeEdge (msg: Object) {
        const e: Edge = this.workspaceData.getEdge(msg['id']);
        e.src = msg['src'];
        e.tgt = msg['tgt'];
        e.metadata = msg['metadata'];

        this.workspaceData.updateEdge(e);
    }
}
