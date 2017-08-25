/**
 * Visually, an edge is a link between two nodes.
 * Conceptually, it transfer data from a src node to a target node. This is how they're used.
 * An edge is a part of the workflow.
 * The notion is described in the Flow-based programming paradigm.
 *
 * Created by antoine on 09/06/17.
 */

export class Edge {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    edge: Object;
    id: string;
    src: Object;
    tgt: Object;
    metadata: Object;
    graph: string;

    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor (edge: Object) {
        this.id = edge['id'];

        this.metadata = edge['metadata'];
        if (this.metadata === '{}') { this.metadata = {}; }

        this.graph = edge['graph'];

        if (typeof edge['src'] === 'object') {
            this.src = edge['src'];
        } else if (typeof edge['src'] === 'string') {
            this.src = JSON.parse(edge['src']);
        }

        if (typeof edge['tgt'] === 'object') {
            this.tgt = edge['tgt'];
        } else if (typeof edge['tgt'] === 'string') {
            this.tgt = JSON.parse(edge['tgt']);
        }
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                            PUBLIC METHODS / GETTERS AND SETTERS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Returns itself as a raw Javascript object.
     *
     * @returns {Object} this
     */
    getEdge(): Object {
        this.edge['id'] = this.id;
        this.edge['src'] = this.src;
        this.edge['tgt'] = this.tgt;
        this.edge['metadata'] = this.metadata;
        this.edge['graph'] = this.graph;

        return this.edge;
    }
}
