import {WorkspaceService} from '../../services/workspace.service';
import {Node} from '../../types/node';
import {Edge} from '../../types/edge';
import {WorkflowComponent} from './workflow.component';
import * as joint from 'jointjs';
/**
 * Provide all the methods used to interact with the displayed graph, such as adding and removing nodes and edges
 * and also manage the layout of the elements on the graph.
 *
 * Created by antoine on 10/07/17.
 */

export class GraphController {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    // Graph and its data attributes
    public graph: any; // instance of the graph. It is a JointJS el. It contains all the element that are on the graph.
    workspaceData: WorkspaceService;
    flowComponent: WorkflowComponent;

    // Attributes used to store the edges waiting for a confirmation form the server
    linkWaitingForTarget: Map<string, Object> = new Map();
    linkWaitingForSrc: Map<string, Object> = new Map();

    // Attributes related to the network state
    runningNodes: Array<string> = [];

    // Layout constants
    readonly HORIZONTAL_SPACE_BETWEEN_TWO_BLOCKS: number = 90;
    readonly VERTICAL_SPACE_BETWEEN_TWO_BLOCKS: number = 50;

    /* -----------------------------------------------------------------------------------------------------------------
                                             CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor (workspaceData: WorkspaceService, flowComponent: WorkflowComponent) {
        this.graph = workspaceData.graph;
        this.workspaceData = workspaceData;
        this.flowComponent = flowComponent;

        this.addGraphEventListeners();
    }

    /* -----------------------------------------------------------------------------------------------------------------
                          METHODS RELATED TO MANAGING NODES AND EDGES DISPLAYED ON THE GRAPH
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Add the given node on the graph.
     *
     * @param node {Node} the node to add
     */
    addNode (node: Node) {
        // Store the node
        if (!this.workspaceData.jointCells.get(node.id)) {
            this.workspaceData.jointCells.set(node.id, node);
            // Create the block that will be added onto the graph
            const block = this.createBlockForNode(node);
            block.attributes.position = this.nextPosition();
            if (block) {
                // Add the block onto the graph
                this.graph.addCell(block);
            }
        }
    }

    /**
     * Add the given nodes on the graph.
     *
     * @param n {Array<Node>} the new nodes.
     */
    addNodes(n: Array<Node>) {
        const nodes = [];
        let tempLine = [];
        let previousLine = [];
        Object.assign(nodes, n);
        // Verify that the block are not already on the graph
        nodes.forEach((node: Node) => {
            if (this.workspaceData.jointCells.get(node.id)) {
                nodes.splice(nodes.indexOf(node), 1);
            } else {
                this.workspaceData.jointCells.set(node.id, node);
            }
        });
        // First find the first nodes to display on the same row.
        const firstNodes = this.findFirstNodes(nodes);
        // Display them on the same row.
        this.displayNodesOnSameLine(firstNodes);
        tempLine = firstNodes;

        // Then iterate on the first row to get the following nodes to display
        while (tempLine.length > 0) {
            previousLine = tempLine;
            tempLine = [];
            previousLine.forEach((node: Node) => {
                const a = node.getNextNodes();
                a.forEach((tempN: Node) => { tempLine.push(tempN); });
            });
            this.displayNodesOnSameLine(tempLine);
        }
    }

    /**
     * Remove the given node from the graph.
     *
     * @param node {Node} the node to remove.
     */
    removeNode (node: Node) {
        // If the node hasn't already been removed, we remove it.
        // Otherwise, do nothing
        if (this.graph._nodes[node.id]) {
            // Retrieve the cell
            this.removeNodeFromId(node.id);
        }
    }

    /**
     * Add the given edge on the graph.
     *
     * @param edge {Edge} the new edge.
     */
    addEdge (edge: Edge) {
        if (!this.workspaceData.jointCells.get(edge.id)) {
            this.workspaceData.jointCells.set(edge.id, edge);
            // Build the link object that is an edge in the jointJs lib
            const link = new joint.dia.Link({
                id: edge.id,
                source: { id: edge.src['node'], port: edge.src['port']},
                target: { id: edge.tgt['node'], port: edge.tgt['port']},
            });

            // Add the edge on the graph
            this.graph.addCell(link);
        } else {
            const i = this.flowComponent.edgesAwaitingMsgFromServer.indexOf(edge);
            this.flowComponent.edgesAwaitingMsgFromServer.splice(i, 1);
        }
    }


    /**
     * Remove the nodes that are displayed on the graph but not included in the given set.
     *
     * @param nodes {Array<Node>} the exhaustive list of nodes that must be displayed onto the graph
     */
    removeGraphNodesThatAreNotInThisSet (nodes: Array<Node>) {
        // Retrieve the ids
        const nodesIds = this.getIds(nodes);
        const jointCellsNodesIds = this.getJointCellsNodesIds();

        jointCellsNodesIds.forEach((id: string) => {
            if (nodesIds.indexOf(id) === -1) {
                this.removeNodeFromId(id);
            }
        });
    }

    /**
     * Remove the given edge from the graph.
     *
     * @param edge {Edge} the edge to remove.
     */
    removeEdge(edge: Edge) {
        // If the edge hasn't already been removed, we remove it.
        // Otherwise, do nothing
        if (this.graph._edges[edge.id]) {
            // Retrieve the cell
            const cell = this.graph.getCell(edge.id);
            // Remove it
            if (cell.attributes.type === 'link') {
                this.graph.removeCells(cell);
            }
        }
    }

    /**
     * Replace all the information of an edge with new ones.
     *
     * @param oldEdge {Edge} the edge to replace
     * @param newEdge {Edge} the new edge
     */
    updateEdge (oldEdge: Edge, newEdge: Edge) {
        const cell = this.graph.getCell(oldEdge.id);
        const attr = cell.attributes;

        if (attr.source.id === oldEdge.src['node'] && attr.source.port === oldEdge.src['port']
            && attr.target.id === oldEdge.tgt['node'] && attr.target.port === oldEdge.tgt['port'] ) {
            // It means the edge hasn't been changed
            attr.source.id = newEdge.src['node'];
            attr.source.port = newEdge.src['port'];
            attr.target.id = newEdge.tgt['node'];
            attr.target.port = newEdge.tgt['port'];
        }
    }

    /**
     * Remove a node to the graph from its id
     *
     * @param id {string} the id of the node to remove
     */
    private removeNodeFromId (id: string) {
        const cell = this.graph.getCell(id);
        // Remove it
        if (cell && cell.attributes.type === 'html.Element') {
            this.graph.removeCells(cell);
        }
    }

    /**
     * Update the connectedEdge field of the node connected to the given edge's source.
     *
     * @param attr {any} the cell.attr of the edge that triggered the change:source event
     */
    private updateSourceConnectedEdge (attr: any) {
        // Set the connected edge property of the port
        const n = this.workspaceData.getNode(attr.source.id);
        const p = n.getPort(attr.source.port);
        p.addConnectedEdge(attr.id);

        // Send the change node message
        this.flowComponent.nodeChanged(n);
    }

    /**
     * Update the connectedEdge field of the node connected to the given edge's target.
     *
     * @param attr {any} the cell.attr of the edge that triggered the change:target event
     */
    private updateTargetConnectedEdge (attr: any) {
        // Set the connected edge property of the port
        const n = this.workspaceData.getNode(attr.target.id);
        const p = n.getPort(attr.target.port);
        p.addConnectedEdge(attr.id);

        // Send the change node message
        this.flowComponent.nodeChanged(n);
    }

    /**
     * Add the source part of an edge that is in the "linkWaitingForSrc" list and remove it from the list.
     * Then it calls flowComponent.createEdge that will send a 'graph:addedge' message to the server in order to
     * confirm the creation of the edge. If every goes well, this UI will receive a message graph:addedge in return
     * add process, resulting in a new edge on the graph.
     *
     * @param cell {any} the jointjs cell of the edge
     */
    addEdgeSourceOnWaitingLink (cell: any) {
        if (cell.attributes.source.id !== cell.attributes.target.id
            || cell.attributes.source.port !== cell.attributes.target.port) {
            const e = this.linkWaitingForSrc.get(cell.id);
            this.linkWaitingForSrc.delete(cell.id);
            e['src'] = {
                node: cell.attributes.source.id,
                port: cell.attributes.source.port
            };

            this.flowComponent.createEdge(new Edge(e));

            this.updateSourceConnectedEdge(cell.attributes);
        }
    }

    /**
     * Add the source part of an edge that is in the "linkWaitingForTgt" list and remove it from the list.
     * Then it calls flowComponent.createEdge that will send a 'graph:addedge' message to the server in order to
     * confirm the creation of the edge. If every goes well, this UI will receive a message graph:addedge in return
     * add process, resulting in a new edge on the graph.
     *
     * @param cell {any} the jointjs cell of the edge
     */
    addEdgeTargetOnWaitingLink (cell: any) {
        if (cell.attributes.source.id !== cell.attributes.target.id
            || cell.attributes.source.port !== cell.attributes.target.port) {
            const e = this.linkWaitingForTarget.get(cell.id);
            this.linkWaitingForTarget.delete(cell.id);
            e['tgt'] = { node: cell.attributes.target.id, port: cell.attributes.target.port };

            this.flowComponent.createEdge(new Edge(e));

            this.updateTargetConnectedEdge(cell.attributes);
        }
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                METHODS RELATED TO THE DISPLAY FEATURE ITSELF
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Add all the given nodes on one line on the graph.
     *
     * @param nodes {Array<Node>} the nodes to display
     */
    displayNodesOnSameLine (nodes: Array<Node>) {
        const position = {};
        Object.assign(position, this.nextPosition());

        nodes.forEach((node: Node) => {
            // Create the block that will be added onto the graph
            const block = this.createBlockForNode(node);
            Object.assign(block.attributes.position, position);
            if (block) {
                // Add the block onto the graph
                this.graph.addCell(block);
            }

            // Update the position to put next block on the right the next time
            position['x'] += this.flowComponent.BLOCK_WIDTH + this.HORIZONTAL_SPACE_BETWEEN_TWO_BLOCKS;
        });
    }

    /**
     * Highlight the node with the given id to show the user that the node is running.
     *
     * @param id {string} id of the running node
     */
    nodeStartRunning (id: string) {
        // Add a class on the node to show that it is running
        const htmlEl = document.getElementById(id);
        htmlEl.classList.add('running-component');
        this.runningNodes.push(id);

        // Empty the traceback
        const node: Node = this.workspaceData.getNode(id);
        node.emptyTraceback();
    }

    /**
     * Remove the highlighting of the node with the given id to show the user that the node is not running anymore.
     *
     * @param id {string} id of the running node
     */
    nodeStopRunning (id: string) {
        if (this.runningNodes.indexOf(id) !== -1) {
            const htmlEl = document.getElementById(id);
            htmlEl.classList.remove('running-component');
            this.runningNodes.splice(this.runningNodes.indexOf(id), 1);
        }
    }

    /**
     * Remove the .running class from all nodes on the graph to make sure no ones is seen as running.
     * Usually use this method when the simulation is finished.
     */
    removeRunningClassOnAllNodes () {
        this.runningNodes.forEach((id) => {
            this.nodeStopRunning(id);
        });
    }

    /* -----------------------------------------------------------------------------------------------------------------
                        UTILS METHODS TO HELP DISPLAYING EDGES AND NODES ON THE GRAPH
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Create a JointJS block for the given node.
     *
     * @param node {Node} the source node
     * @returns {dia.Element} the resulting jointJS block
     */
    createBlockForNode(node: Node) {
        const component = this.workspaceData.getComponents().get(node.component);

        if (component) {
            // Create the block
            const block = new joint.shapes['html'].Element({
                id: node.id,
                that: this,
                node: node,
                size: {
                    width: this.flowComponent.BLOCK_WIDTH,
                    height: this.flowComponent.BLOCK_HEIGHT
                }
            });

            if (component.inPorts.length !== 0) {
                block.set('inPorts', component.getInportsAsstringArray());
            }
            if (component.outPorts.length !== 0) {
                block.set('outPorts', component.getOutportsAsstringArray());
            }

            return block;
        }
    }

    /**
     * Return the most appropriate coordinate where to put a new element on the graph.
     *
     * @returns {{x: number, y: number}} the coordinates
     */
    nextPosition (): Object {
        const occupiedZone = this.occupiedZone();
        const res = { x: 0, y: 0};

        if (occupiedZone['width'] < 0) {
            res.x = 60;
            res.y = 30;
        } else {
            if (occupiedZone['y0'] > (this.flowComponent.BLOCK_HEIGHT + 10)) {
                res.x = 30;
                res.y = 5;
            } else {
                res.x = occupiedZone['x0'];
                res.y = (occupiedZone['y0'] + occupiedZone['height'] + this.VERTICAL_SPACE_BETWEEN_TWO_BLOCKS);
            }
        }

        return res;

    }

    /**
     * Returns the x0, y0 coordinates, width and height of the zone occupied by the workflow on the graph.
     *
     * @returns {{x0: number, y0: number, width: number, height: number}} the coordinates and size of the occupied zone
     */
    private occupiedZone (): Object {
        // Create the object that will be returned. It contains the 4 points delimiting the zone containing
        // all the cells
        const points = {
            topLeft: { x: 1000, y: 1000 },
            topRight: { x: 0, y: 1000 },
            bottomLeft: { x: 1000, y: 0 },
            bottomRight: { x: 0, y: 0 }
        };

        // Look at all the cells to determine the occupied zone
        const cells = this.graph.getCells();
        cells.forEach((cell: any) => {
            if (cell.attributes.type === 'html.Element') {
                const position = cell.attributes.position;
                const size = cell.attributes.size;

                if (position.x < points.topLeft.x) { points.topLeft.x = position.x; points.bottomLeft.x = position.x; }
                if (position.y < points.topLeft.y) { points.topLeft.y = position.y; points.topRight.y = position.y; }
                if ((position.x + size.width) > points.topRight.x) {
                    points.topRight.x = (position.x + size.width);
                    points.bottomRight.x = (position.x + size.width);
                }
                if ((position.y + size.height) > points.bottomLeft.y) {
                    points.bottomLeft.y = (position.y + size.height);
                    points.bottomRight.y = (position.y + size.height);
                }
            }
        });

        // Build a much cleaner object to manipulate
        const res = {
            x0 : points.topLeft.x,
            y0 : points.topLeft.y,
            width: (points.topRight.x - points.topLeft.x),
            height: (points.bottomLeft.y - points.topLeft.y)
        };

        return res;
    }

    /**
     * Determines which nodes are the first one in the given list and returns the list of them. The first nodes are the ones
     * with no dependencies. In other words, the ones with no other nodes connected to their inports.
     *
     * Those first nodes are the ones to display on top of the graph and also the first ones to execute when running
     * the workflow.
     *
     * @param nodes {Array<Node>} the list of nodes in which to do the computation
     * @returns {Array<Node>} the list of nodes without dependencies
     */
    private findFirstNodes (nodes: Array<Node>) {
        const res: Array<Node> = [];
        // First, in case nodes is composed of only one node, we return the node
        if (nodes.length === 1) { return nodes; }

        // Elsewhere, we search for the node in the list that doesn't have a previous node and that have a next one.
        nodes.forEach((node: Node) => {
            if (node.getPreviousNodesInList(nodes).length === 0) { res.push(node); }
        });

        // Finally return the list
        return res;
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                    METHODS TO REACT TO USER ACTIONS
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * To call when the user added an edge on the graph. This method must be called right after the edge is created. At
     * that moment, only the src OR the tgt element will be defined, so we store the edge in a list, either
     * "linkWaitingForSrc" or "linkWaitingForTgt" and another event will be triggered when the other side of the edge
     * will be connected.
     *
     * @param cell {any} the newly created edge
     */
    addedEdge (cell: any) {

        const attr = cell.attributes;

        // Determine whether the only connected side of the edge is the source or target and then store the edge
        // in the more appropriate list.

        if (attr.target.id) {
            const e: Object = {
                id: attr.id,
                tgt: { node: attr.target.id, port: attr.target.port },
                metadata: {},
                graph: this.workspaceData.flow.id
            };

            this.linkWaitingForSrc.set(e['id'], e);

        } else if (attr.source.id) {
            const e: Object = {
                id: attr.id,
                src: {
                    node: attr.source.id,
                    port: attr.source.port
                },
                metadata: {},
                graph: this.workspaceData.flow.id
            };

            this.linkWaitingForTarget.set(e['id'], e);
        }
    }

    /**
     * The user wants to remove the given edge from the workflow. Send this information to the server.
     *
     * @param cell {any} the edge removed from the graph.
     */
    removedEdge (cell: any) {
        // Retrieve the edge object
        const edge = this.workspaceData.getEdge(cell.id);
        // Send the message
        this.flowComponent.removedEdge(edge);
    }

    /**
     * The given edge's metadata change. Send its new metadata to the server.
     *
     * @param cell {any} the updated edge's cell.
     */
    edgeChanged (cell: any) {
        // Retrieve the edge object
        const edge = this.workspaceData.getEdge(cell.id);
        edge.src = {
            node: cell.attributes.source.id,
            port: cell.attributes.source.port
        };
        edge.tgt = {
            node: cell.attributes.target.id,
            port: cell.attributes.target.port
        };

        // Send a changeedge message to server
        this.flowComponent.edgeChanged(edge);
        this.updateSourceConnectedEdge(cell.attributes);
        this.updateTargetConnectedEdge(cell.attributes);
    }

    /**
     * The user wants to remove the given node from the workflow. Send this information to the server.
     *
     * @param evt {MouseEvent} the event triggered.
     */
    removedNode (evt: MouseEvent) {
        // Retrieve the id of the block
        const id = evt.currentTarget['parentElement'].id;

        // Remove it from the graph
        const cell = this.graph.getCell(id);
        this.graph.removeCells(cell);

        // Send a removenode message to the server
        const node = this.workspaceData.getNode(id);
        this.flowComponent.removedNode(node);

        // Close the window opened for this node
        this.flowComponent.emitCloseWindowEvent(node);
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                         METHODS RELATED TO EVENTS
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * Configure the graph event listeners to subscribe to and the methods they should call when triggered.
     */
    private addGraphEventListeners () {
        this.graph.on('add', (cell: any) => {
            if (cell.attributes.type === 'link') {
                this.addedEdge(cell);
            }
        });

        this.graph.on('change:source', (cell: any) => {
            if (cell.attributes.type === 'link' && cell.attributes.source.id && this.linkWaitingForSrc.get(cell.attributes.id)) {
                this.addEdgeSourceOnWaitingLink(cell);
            } else if (cell.attributes.source.id && this.workspaceData.getEdge(cell.id) !== null) {
                this.edgeChanged(cell);
            }
        });

        this.graph.on('change:target', (cell: any) => {
            if (cell.attributes.type === 'link' && cell.attributes.target.id && this.linkWaitingForTarget.get(cell.attributes.id)) {
                this.addEdgeTargetOnWaitingLink(cell);
            } else if (cell.attributes.target.id && this.workspaceData.getEdge(cell.id) !== null) {
                this.edgeChanged(cell);
            }
        });

        this.graph.on('remove', (cell: any) => {
            if (cell.attributes.type === 'link') {
                this.removedEdge(cell);
            } else if (cell.attributes.type === 'devs.Atomic') {
                this.removedNode(cell);
            }
        });
    }

    /* -----------------------------------------------------------------------------------------------------------------
                            UTILS METHODS THAT COMPUTE DATA FROM OBJECTS
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * Returns an Array containing the ids of all the elements that are in the given array of objects.
     *
     * @param objects Array<any> the array to use for the computation
     * @returns {Array} the ids of all the elements present in the given array of objects
     */
    private getIds (objects: Array<any>): Array<string> {
        const res = [];

        objects.forEach((o: any) => {
            res.push(o.id);
        });

        return res;
    }

    /**
     * Return an array containing the ids of all the nodes displayed on the graph.
     *
     * @returns {Array} containing the ids of all the nodes displayed on the graph.
     */
    private getJointCellsNodesIds (): Array<string> {
        const res = [];

        this.workspaceData.jointCells.forEach((value: any, key: string) => {
            if ( value instanceof Node) {
                res.push(key);
            }
        });

        return res;
    }

}
