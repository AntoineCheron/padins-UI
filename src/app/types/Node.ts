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
    previousNodesData: {};

    constructor (node: Object, private appData: DataService) {
        this.id = node['id'];
        this.metadata = node['metadata'];
        this.graph = node['graph'];
        this.component = node['component'];
        this.inPorts = [];
        this.outPorts = [];

        // Retrieve inports from the object if into it
        const ips: Array<Object> = node['inports'];
        if (ips) {
            ips.forEach((ip) => {
                const p = new Port(ip['id'], ip['public'], ip['port'], '', ip['node'], ip['metadata'], ip['connectedEdge'], appData); // TODO : after changing connectedEdge to array on backend, change name to connectedEdges
                this.inPorts.push(p);
            });
        } else {
            // Otherwise, retrieve inports from the component itself
            const c = this.appData.getComponents().get(this.component);
            this.inPorts = c.inPorts ? c.inPorts : [];
        }

        const ops: Array<Object> = node['outports'];
        if (ops) {
            ops.forEach((op) => {
                const p = new Port(op['id'], op['public'], op['port'], '', op['node'], op['metadata'], op['connectedEdge'], appData); // TODO : after changing connectedEdge to array on backend, change name to connectedEdges
                this.outPorts.push(p);
            });
        } else {
            // Otherwise, retrieve outports from the component itself
            const c = this.appData.getComponents().get(this.component);
            this.outPorts = c.outPorts ? c.outPorts : [];
        }
    }

    getCode () {
        return this.metadata['code'];
    }

    getLanguage () {
        return this.metadata['language'] ? this.metadata['language'] : 'python';
    }

    setSingleData(key: string, value: any) {
        if (!this.metadata['result']) { this.metadata['result'] = {}; }
        this.metadata['result'][key] = value;
    }

    setData (data: Object) {
        this.metadata['result'] = data;
    }

    getData (): any {
        if (this.metadata.hasOwnProperty('result')) {
            return this.metadata['result'];
        } else {
            return null;
        }
    }

    getPreviousNodesData () {
        const data = {};

        // Add the data of each previous node to the data object created above.
        this.inPorts.forEach((p: Port) => {
            p.connectedEdges.forEach((edgeId: string) => {
                const e = this.appData.getEdge(edgeId);
                if (e !== null) {
                    const previousNode = this.appData.getNode(e.src['node']);
                    if (previousNode !== null) { Object.assign(data, previousNode.getData()); }
                }
            });
        });

        return data;
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
