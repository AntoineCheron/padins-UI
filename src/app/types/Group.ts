import {Node} from './Node';
import {WorkspaceService} from '../services/workspace.service';

/**
 *  A group is a part of the flow, that has quite the same structure.
 *
 * This is a concept of the flow-based programming network protocol, as described here :
 * https://flowbased.github.io/fbp-protocol/#graph-addgroup
 *
 * Created by antoine on 15/06/2017.
 */

export class Group {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/
    public group: Object;
    public id: string;
    public name: string;
    public nodes: Array<Node>;
    public metadata: Object;
    public graph: string;

    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor (group: Object, private workspaceData: WorkspaceService) {
        this.id = group['id'];
        this.name = group['name'];
        this.metadata = group['metadata'];
        this.graph = group['graph'];

        const n: Array<Object> = group['nodes'];
        n.forEach((node: Object) => {
            const newNode = new Node(node, workspaceData);
            this.nodes.push(newNode);
        });
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                         PUBLIC METHODS / GETTERS AND SETTERS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Returns the group object in the FBP Network Protocol compliant format in order to send it over the communication
     * websocket.
     *
     * @returns {Object} the FBPNP compliant format message.
     */
    getGroup (): Object {
        this.group['id'] = this.id;
        this.group['name'] = this.name;
        this.group['nodes'] = this.nodes;
        this.group['metadata'] = this.metadata;
        this.group['graph'] = this.graph;

        return this.group;
    }
}
