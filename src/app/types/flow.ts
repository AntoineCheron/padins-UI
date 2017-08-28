import {Edge} from './edge';
import {Node} from './node';
import {Group} from './group';
import {WorkspaceService} from '../services/workspace.service';
/**
 * The Flow is the main data structure of the project.
 *
 * It contains the graph, that is the ensemble of elements that describe the process that the user
 * wants to execute/simulate. This process is composed of nodes, connected with edges.
 *
 * The flow also contains groups, that are some subgraph of the graph. They are used to let the user
 * simulate some part of the graph instead of everything.
 *
 * Beside that, the flow contains the library of components available.
 *
 * We represent and store the flow as a JSON file.
 * This web interface uses it, and only it, to create the view.
 *
 * Created by antoine on 12/06/17.
 */
export class Flow {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/
    public name: string;
    public graph: string;
    public id: string;
    public library: string;
    public nodes: Array<Node>;
    public edges: Array<Edge>;
    public groups: Array<Group>;

    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor (private workspaceData: WorkspaceService) {
        // Nothing to do for now
        this.nodes = [];
        this.edges = [];
        this.groups = [];
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                        PUBLIC METHODS / GETTERS AND SETTERS
     -----------------------------------------------------------------------------------------------------------------*/

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
                const n = new Node(node, this.workspaceData);

                // Verify that the node doesn't already exist before storing it
                if (this.indexOfNode(n) === -1) {
                    this.nodes.push(n);
                }
            });
        } // END FOR NODES

        if (flow.hasOwnProperty('edges')) {
            const edges = flow['edges'];

            edges.forEach((edge: Object) => {
                const e = new Edge(edge);

                if (this.indexOfEdge(e) === -1) {
                    this.edges.push(e);
                }
            });
        } // END FOR EDGES

        if (flow.hasOwnProperty('groups')) {
            const groups = flow['groups'];

            groups.forEach((group: Object) => {
                const g = new Group(group, this.workspaceData);

                if (this.indexOfGroup(g) === -1 ) {
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

    /**
     * Update all the values of the edge, except the id
     *
     * @param edge
     */
    updateEdge (oldEdge: Edge, newEdge: Edge) {
        if (oldEdge.id === newEdge.id) {
            const i = this.edges.indexOf(oldEdge);
            this.edges[i] = newEdge;
        } else {
            console.error('Error updating edge. The two edges dont have the same id');
        }
    }

}
