/**
 * Created by antoine on 09/06/17.
 */

export class Edge {
    edge: Object;
    id: String;
    src: Object;
    tgt: Object;
    metadata: Object;
    graph: String;

    constructor (edge: Object) {
        this.id = edge['id'];
        this.metadata = edge['metadata'];
        this.graph = edge['graph'];
        this.src = JSON.parse(edge['src']);
        this.tgt = JSON.parse(edge['tgt']);
    }

    getEdge(): Object {
        this.edge['id'] = this.id;
        this.edge['src'] = this.src;
        this.edge['tgt'] = this.tgt;
        this.edge['metadata'] = this.metadata;
        this.edge['graph'] = this.graph;

        return this.edge;
    }
}
