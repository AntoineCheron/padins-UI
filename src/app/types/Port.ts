/**
 * A Port is either an input or output of a Node. It offers the possibility to connect nodes together.
 *
 * For a functional purpose, a port has a name and a port. The name is the label that should be displayed,
 * and the port correspond to the name used to differentiate two ports.
 *
 * We use several inports or outports to offer different connexion functionality.
 * For example, a node Addition could have to inports A and B and one outport sum. A and B are used to differentiate the
 * two data to sum, and the outport is used to transmit the result to another node. We can link it to another sum node
 * and sum the result with another B data. An so on.
 *
 * Created by antoine on 09/06/17.
 */
import {WorkspaceService} from '../services/workspace.service';
import {Edge} from './Edge';

export class Port {

    /* -----------------------------------------------------------------------------------------------------------------
                                                ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    id: string;
    type: string;
    description: string;
    addressable: boolean;
    required: boolean;
    nodeId: string;
    publicName: string;
    port: string;
    metadata: Object;
    connectedEdges: Array<string>;

    /* -----------------------------------------------------------------------------------------------------------------
                                                CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor (id: string, publicName: string, port: string, description: string, node: string,
                 metadata: Object, connectedEdges: string[], private workspaceData: WorkspaceService) {
        this.id = id;
        this.publicName = publicName;
        this.port = port;
        this.metadata = metadata;
        this.nodeId = node;
        this.type = 'Object';
        this.description = description;
        this.addressable = false; // Unhandled for now
        this.required = false; // Unhandled for now
        this.connectedEdges = connectedEdges ? connectedEdges : [];
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                                PUBLIC METHODS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Connect an edge to the port.
     *
     * @param id {String} id of the edge
     */
    addConnectedEdge (id: string): void {

        this.connectedEdges.forEach((edgeId: string) => {
            const edge: Edge = this.workspaceData.getEdge(edgeId);
            // Remove the ref in connected edges if it is not connected yet
            if (edge === null) {
                const i = this.connectedEdges.indexOf(edgeId);
                this.connectedEdges.splice(i, 1);
            } else if ((edge.src['node'] !== this.nodeId || edge.src['port'] !== this.port) &&
                (edge.tgt['node'] !== this.nodeId || edge.tgt['port'] !== this.port)) {
                const i = this.connectedEdges.indexOf(edgeId);
                this.connectedEdges.splice(i, 1);
            }
        });

        this.connectedEdges.push(id);
    }
}
