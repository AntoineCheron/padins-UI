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

        this.appData.eventHub.emit('changenode', this);
    }

    setMetadata (metadata: Object) {
        this.metadata = metadata;

        this.appData.eventHub.emit('changenode', this);
    }

    getData (): any {
        if (this.metadata.hasOwnProperty('result')) {
            return this.metadata['result'];
        } else {
            return null;
        }
    }

    setData (data: Object) {
        this.metadata['result'] = data;

        this.appData.eventHub.emit('changenode', this);
    }

    getPreviousNodesData () {
        const data = {};

        // Add the data of each previous node to the data object created above.
        const previousNodes: Array<Node> = this.getPreviousNodes();
        if (previousNodes.length !== 0) {
            previousNodes.forEach((n: Node) => {
                Object.assign(data, n.getData());
            });
        }

        return data;
    }

    getPreviousNodes () {
        return this.getPreviousNodesInList(this.appData.flow.nodes);
    }

    getPreviousNodesInList (nodes: Array<Node>) {
        // Add the data of each previous node to the data object created above.
        let previousNodes: Array<Node> = [];
        this.inPorts.forEach((p: Port) => {
            p.connectedEdges.forEach((edgeId: string) => {
                const e = this.appData.getEdge(edgeId);
                if (e !== null) {
                    const n = this.appData.getNode(e.src['node']);
                    if (n !== null && nodes.indexOf(n) !== -1) { previousNodes.push(n); }
                }
            });
        });

        return previousNodes;
    }

    getNextNodes () {
        return this.getNextNodesInList(this.appData.flow.nodes);
    }

    getNextNodesInList (nodes: Array<Node>) {
        // Add the data of each previous node to the data object created above.
        let nextNodes: Array<Node> = [];
        this.outPorts.forEach((p: Port) => {
            p.connectedEdges.forEach((edgeId: string) => {
                const e = this.appData.getEdge(edgeId);
                if (e !== null) {
                    const n = this.appData.getNode(e.tgt['node']);
                    if (n !== null && nodes.indexOf(n) !== -1) { nextNodes.push(n); }
                }
            });
        });

        return nextNodes;
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
