import {Port} from './port';
import {WorkspaceService} from '../services/workspace.service';

/**
 * A node correspond to a block on a flow-based program.
 * A node is a part of a flow.
 * Nodes are linked together with edges.
 *
 * To know more about Flow-Based programming : http://www.jpaulmorrison.com/fbp/concepts.html
 * To see the FBP Network Protocol : https://flowbased.github.io/fbp-protocol/#graph-addnode
 *
 * Created by antoine on 09/06/17.
 */
export class Node {

    /* -----------------------------------------------------------------------------------------------------------------
                                                ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/
    public id: string;
    public component: string;
    public metadata: Object;
    public graph: string;
    public inPorts: Array<Port>;
    public outPorts: Array<Port>;
    previousNodesData: {};

    /* -----------------------------------------------------------------------------------------------------------------
                                                CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor (node: Object, private workspaceData: WorkspaceService) {
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
                const p = new Port(ip['id'], ip['public'], ip['port'], '', ip['node'], ip['metadata'], ip['connectedEdges'], workspaceData);
                this.inPorts.push(p);
            });
        } else {
            // Otherwise, retrieve inports from the component itself
            const c = this.workspaceData.getComponents().get(this.component);
            this.inPorts = c.inPorts ? c.inPorts : [];
        }

        const ops: Array<Object> = node['outports'];
        if (ops) {
            ops.forEach((op) => {
                const p = new Port(op['id'], op['public'], op['port'], '', op['node'], op['metadata'], op['connectedEdges'], workspaceData);
                this.outPorts.push(p);
            });
        } else {
            // Otherwise, retrieve outports from the component itself
            const c = this.workspaceData.getComponents().get(this.component);
            this.outPorts = c.outPorts ? c.outPorts : [];
        }
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                         PUBLIC METHODS / GETTERS AND SETTERS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Returns the code of the node.
     *
     * @returns {string} the code of the node
     */
    getCode (): string {
        return this.metadata['code'];
    }

    /**
     * Returns the programming language used by the node.
     *
     * @returns {string} the programming language's name
     */
    getLanguage (): string {
        return this.metadata['language'] ? this.metadata['language'] : 'python';
    }

    /**
     * Set the value of a data on the node's data.
     *
     * @param key {String} the name of the data to set
     * @param value {any} the value of the data
     */
    setSingleData(key: string, value: any): void {
        if (!this.metadata['result']) { this.metadata['result'] = {}; }
        this.metadata['result'][key] = value;

        this.workspaceData.eventHub.emit('changenode', this);
    }

    /**
     * Set the metadata object of the node.
     *
     * @param metadata {Object} the new metadata
     */
    setMetadata (metadata: Object): void {
        this.metadata = metadata;

        this.workspaceData.eventHub.emit('changenode', this);
    }

    /**
     * Get the data object of the node.
     * The data object is stored in the metadata.
     * The data or either the imported data for data-importer nodes, or the data the user choose in
     * sendTheseDataToNextNodes(**kwargs) in her code.
     *
     * @returns {Object}: the output data of the node
     */
    getData (): Object {
        if (this.metadata.hasOwnProperty('result')) {
            return this.metadata['result'];
        } else {
            return null;
        }
    }

    /**
     * Set the data object of the node.
     * The data object is stored in the metadata.
     * The data or either the imported data for data-importer nodes, or the data the user choose in
     * sendTheseDataToNextNodes(**kwargs) in her code.
     *
     * @param data {Object}: the output data of the node
     */
    setData (data: Object): void {
        this.metadata['result'] = data;

        this.workspaceData.eventHub.emit('changenode', this);
    }

    /**
     * Retrieve the output data of the nodes connected to this node's input.
     *
     * @returns {Object} an Object containing all the data from the nodes connected to the input port
     */
    getPreviousNodesData (): object {
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

    /**
     * Retrieve the list of Nodes connected to this node's input
     *
     * @returns {Array<Node>} the list of Nodes connected to this node's input
     */
    getPreviousNodes (): Array<Node> {
        return this.getPreviousNodesInList(this.workspaceData.flow.nodes);
    }

    /**
     * Create the list of nodes connected to this node's input, from the given set of nodes
     *
     * @param nodes {Array<Node>} the set of nodes to use while searching for the previous nodes connected to this
     * @returns {Array<Node>} the list of nodes connected to this node's input
     */
    getPreviousNodesInList (nodes: Array<Node>): Array<Node> {
        // Add the data of each previous node to the data object created above.
        let previousNodes: Array<Node> = [];
        this.inPorts.forEach((p: Port) => {
            p.connectedEdges.forEach((edgeId: string) => {
                const e = this.workspaceData.getEdge(edgeId);
                if (e !== null) {
                    const n = this.workspaceData.getNode(e.src['node']);
                    if (n !== null && nodes.indexOf(n) !== -1) { previousNodes.push(n); }
                }
            });
        });

        return previousNodes;
    }

    /**
     * Retrieve the list of Nodes connected to this node's output
     * @returns {Array<Node>} the list of Nodes connected to this node's output
     */
    getNextNodes (): Array<Node> {
        return this.getNextNodesInList(this.workspaceData.flow.nodes);
    }

    /**
     * Create the list of nodes connected to this node's output, from the given set of nodes
     *
     * @param nodes {Array<Node>} the set of nodes to use while searching for the next nodes connected to this
     * @returns {Array<Node>} the list of nodes connected to this node's output
     */
    getNextNodesInList (nodes: Array<Node>): Array<Node> {
        // Add the data of each previous node to the data object created above.
        let nextNodes: Array<Node> = [];
        this.outPorts.forEach((p: Port) => {
            p.connectedEdges.forEach((edgeId: string) => {
                const e = this.workspaceData.getEdge(edgeId);
                if (e !== null) {
                    const n = this.workspaceData.getNode(e.tgt['node']);
                    if (n !== null && nodes.indexOf(n) !== -1) { nextNodes.push(n); }
                }
            });
        });

        return nextNodes;
    }

    /**
     * Returns the port with the given name
     *
     * @param port {String} the name of the port
     * @returns {Port} the port instance with the given name
     */
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

    /**
     * Returns the name of the node
     *
     * @returns {any|string} the name of the node
     */
    getName (): string {
        return this.metadata['name'] || '' ;
    }

    /**
     * Set the name of the node
     *
     * @param name {String} the new name
     */
    setName (name: string): void {
        this.metadata['name'] = name;
        this.workspaceData.eventHub.emit('changenode', this);
    }

    /**
     * Set the traceback object, received from the Jupyter kernel
     *
     * @param traceback {String[]} the traceback as a set of lines
     */
    setTraceback (traceback: string[]): void {
        // Store the raw traceback
        this.metadata['traceback'] = traceback;
        this.workspaceData.eventHub.emit('changenode', this);
    }

    /**
     * Returns the traceback of the node's last execution
     *
     * @returns {any|Array} the traceback of the node's last execution as a set of lines, including syntax highlighting
     */
    getTraceback (): string[] {
        return this.metadata['traceback'] || [];
    }

    /**
     * Set the traceback to an empty string
     */
    emptyTraceback (): void {
        this.metadata['traceback'] = '';
        this.workspaceData.eventHub.emit('changenode', this);
    }
}
