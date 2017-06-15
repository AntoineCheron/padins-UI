import {Edge} from './Edge';
import {Node} from './Node';
import {Group} from './Group';
/**
 * Created by antoine on 12/06/17.
 */

export class Flow {
    public name: string;
    public graph: string;
    public id: string;
    public library: string;
    public nodes: Array<Node>;
    public edges: Array<Edge>;
    public groups: Array<Group>;

    constructor () {
        // Nothing to do for now
        this.nodes = [];
        this.edges = [];
        this.groups = [];
    }

    /**
     * Build the flow from the object received from the server
     *
     * @param flow
     */
    setFlow (flow: Object) {

        if (flow.hasOwnProperty('id')) {
            this.graph = flow['id'];
            this.id = flow['id'];
        }

        if (flow.hasOwnProperty('library')) {
            this.library = flow['library'];
        }

        if (flow.hasOwnProperty('name')) {
            this.name = flow['name'];
        }

        if (flow.hasOwnProperty('nodes')) {
            const nodes = flow['nodes'];

            nodes.forEach((node: Object) => {
                const n = new Node(node);

                // Verify that the node doesn't already exist before storing it
                if (this.indexOfNode(n) === 0) {
                    this.nodes.push(n);
                }
            });
        } // END FOR NODES

        if (flow.hasOwnProperty('edges')) {
            const edges = flow['edges'];

            edges.forEach((edge: Object) => {
                const e = new Edge(edge);


                if (this.indexOfEdge(e) === 0) {
                    this.edges.push(e);
                }
            });
        } // END FOR EDGES

        if (flow.hasOwnProperty('groups')) {
            const groups = flow['groups'];

            groups.forEach((group: Object) => {
                const g = new Group(group);

                if (this.indexOfGroup(g) === 0 ) {
                    this.groups.push(g);
                }
            });
        }
    }

    /**
     * Give the index of the given edge
     *
     * @param edge
     */
    indexOfEdge (edge: Edge): number {
        this.edges.forEach((e: Edge) => {
            if (e.id === edge.id) {
                return this.edges.indexOf(e);
            }
        });

        return -1;
    }

    /**
     * Give the index of the given node
     *
     * @param node
     */
    indexOfNode (node: Node): number {
        this.nodes.forEach((n: Node) => {
            if (n.id === node.id) {
                return this.nodes.indexOf(n);
            }
        });

        return -1;
    }

    /**
     * Give the index of the given group
     *
     * @param group
     */
    indexOfGroup (group: Group): number {
        this.groups.forEach((g: Group) => {
            if (g.id === group.id) {
                return this.groups.indexOf(g);
            }
        });

        return -1;
    }

}
