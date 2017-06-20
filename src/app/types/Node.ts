import {Port} from './Port';
import {DataService} from '../services/data.service';
/**
 * Created by antoine on 09/06/17.
 */

export class Node {
    public id: string;
    public component: string;
    public metadata: Object;
    public graph: string;
    public inPorts: Array<Port>;
    public outPorts: Array<Port>;

    constructor (node: Object, private appData: DataService) {
        this.id = node['id'];
        this.metadata = node['metadata'];
        this.graph = node['graph'];
        this.component = node['component'];
        this.inPorts = [];
        this.outPorts = [];

        const ips: Array<Object> = node['inports'];
        if (ips) {
            ips.forEach((ip) => {
                const p = new Port(ip['id'], ip['public'], ip['port'], '', ip['node'], ip['metadata'], ip['connectedEdges'], appData);
                this.inPorts.push(p);
            });
        }

        const ops: Array<Object> = node['outports'];
        if (ops) {
            ops.forEach((op) => {
                const p = new Port(op['id'], op['public'], op['port'], '', op['node'], op['metadata'], op['connectedEdges'], appData);
                this.outPorts.push(p);
            });
        }
    }

    getCode () {
        return this.metadata['code'];
    }

    getLanguage () {
        return 'python';
    }

    getData (): any {
        if (this.metadata.hasOwnProperty('result')) {
            return this.metadata['result'];
        } else {
            return null;
        }
    }

    getPort (port: string): Port {
        let res: Port = null;

        this.inPorts.forEach((p: Port) => {
            if (p.port === port) { res = p; }
        });

        this.outPorts.forEach((p: Port) => {
            if (p.port === port) { res = p; }
        });

        return res;
    }
}
