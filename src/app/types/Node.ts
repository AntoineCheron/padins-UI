import {Port} from './Port';
/**
 * Created by antoine on 09/06/17.
 */

export class Node {
    id: String;
    component: String;
    metadata: Object;
    graph: String;
    inPorts: Array<Port>;
    outPorts: Array<Port>;

    constructor (node: Object) {
        this.id = node['id'];
        this.metadata = node['metadata'];
        this.graph = node['graph'];
        this.component = node['component'];
        this.inPorts = [];
        this.outPorts = [];

        const ips: Array<Object> = node['inports'];
        if (ips) {
            ips.forEach((ip) => {
                const p = new Port(ip['id'], ip['public'], ip['port'], '', ip['node'], ip['metadata'], ip['connectedEdge']);
                this.inPorts.push(p);
            });
        }

        const ops: Array<Object> = node['outports'];
        if (ops) {
            ops.forEach((op) => {
                const p = new Port(op['id'], op['public'], op['port'], '', op['node'], op['metadata'], op['connectedEdge']);
                this.outPorts.push(p);
            });
        }
    }

    getData (): any {
        if (this.metadata.hasOwnProperty('result')) {
            return this.metadata['result'];
        } else {
            return null;
        }
    }
}
