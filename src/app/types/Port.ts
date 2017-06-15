/**
 * Created by antoine on 09/06/17.
 */

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
    connectedEdge: string;

    constructor (id: string, publicName: string, port: string, description: string, node: string,
                 metadata: Object, connectedEdge: string) {
        this.id = id;
        this.publicName = publicName;
        this.port = port;
        this.metadata = metadata;
        this.nodeId = node;
        this.type = 'Object';
        this.description = description;
        this.addressable = false; // Unhandled for now
        this.required = false; // Unhandled for now
        this.connectedEdge = connectedEdge;
    }
}
