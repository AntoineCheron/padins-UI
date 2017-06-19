/**
 * Created by antoine on 09/06/17.
 */

export class Edge {
    edge: Object;
    id: string;
    src: Object;
    tgt: Object;
    metadata: Object;
    graph: string;

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

    getEdge(): Object {
        this.edge['id'] = this.id;
        this.edge['src'] = this.src;
        this.edge['tgt'] = this.tgt;
        this.edge['metadata'] = this.metadata;
        this.edge['graph'] = this.graph;

        return this.edge;
    }
}
