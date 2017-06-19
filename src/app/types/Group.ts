import {Node} from './Node';

/**
 * Created by antoine on 15/06/2017.
 */

export class Group {
    public group: Object;
    public id: string;
    public name: string;
    public nodes: Array<Node>;
    public metadata: Object;
    public graph: string;

    constructor (group: Object) {
        this.id = group['id'];
        this.name = group['name'];
        this.metadata = group['metadata'];
        this.graph = group['graph'];

        const n: Array<Object> = group['nodes'];
        n.forEach((node: Object) => {
            const newNode = new Node(node);
            this.nodes.push(newNode);
        });
    }

    getGroup (): Object {
        this.group['id'] = this.id;
        this.group['name'] = this.name;
        this.group['nodes'] = this.nodes;
        this.group['metadata'] = this.metadata;
        this.group['graph'] = this.graph;

        return this.group;
    }
}
