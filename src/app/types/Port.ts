/**
 * Created by antoine on 09/06/17.
 */
import {DataService} from '../services/data.service';
import {Edge} from './Edge';

export class Port {
    addressable: boolean;
    id: string;
    type: string;
    required: boolean;
    description: string;
    nodeId: string;
    publicName: string;
    port: string;
    metadata: Object;
    connectedEdges: Array<string>;

    constructor (id: string, publicName: string, port: string, description: string, node: string,
                 metadata: Object, connectedEdge: string, private appData: DataService) {
        this.id = id;
        this.publicName = publicName;
        this.port = port;
        this.metadata = metadata;
        this.nodeId = node;
        this.type = 'Object';
        this.description = description;
        this.addressable = false; // Unhandled for now
        this.required = false; // Unhandled for now
        this.connectedEdges = connectedEdge ? [connectedEdge] : [];
    }

    addConnectedEdge (id: string) {
        this.connectedEdges.forEach((edgeId: string) => {
            const edge: Edge = this.appData.getEdge(edgeId);
            // Remove the ref in connected edges if it is not still connected
            if ((edge.src['node'] !== this.nodeId || edge.src['port'] !== this.port) &&
                (edge.tgt['node'] !== this.nodeId || edge.tgt['port'] !== this.port)) {
                const i = this.connectedEdges.indexOf(edgeId);
                this.connectedEdges.splice(i, 1);
            }
        });

        this.connectedEdges.push(id);
    }
}
