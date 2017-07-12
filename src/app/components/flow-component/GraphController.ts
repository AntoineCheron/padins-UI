import {DataService} from '../../services/data.service';
import {Node} from '../../types/Node';
import {Edge} from '../../types/Edge';
import {FlowComponent} from './flow.component';
import * as joint from 'jointjs';
/**
 * Created by antoine on 10/07/17.
 */

export class GraphController {
    public graph: any;
    appData: DataService;
    flowComponent: FlowComponent;
    linkWaitingForTarget: Map<string, Object> = new Map();
    linkWaitingForSrc: Map<string, Object> = new Map();

    readonly HORIZONTAL_SPACE_BETWEEN_TWO_BLOCKS: number = 90;
    readonly VERTICAL_SPACE_BETWEEN_TWO_BLOCKS: number = 50;

    constructor (appData: DataService, flowComponent: FlowComponent) {
        appData.graph = new joint.dia.Graph;
        this.graph = appData.graph;
        this.appData = appData;
        this.flowComponent = flowComponent;

        this.addGraphEventListeners();
    }

    addNode (node: Node) {
        // Store the node
        if (!this.appData.jointCells.get(node.id)) {
            this.appData.jointCells.set(node.id, node);
            // Create the block that will be added onto the graph
            const block = this.createBlockForNode(node);
            block.attributes.position = this.nextPosition();
            if (block) {
                // Add the block onto the graph
                this.graph.addCell(block);
            }
        }
    }

    addNodes(n: Array<Node>) {
        const nodes = [];
        let tempLine = [];
        let previousLine = [];
        Object.assign(nodes, n);
        // Verify that the block are not already on the graph
        nodes.forEach((node: Node) => {
            if (this.appData.jointCells.get(node.id)) {
                nodes.splice(nodes.indexOf(node), 1);
            } else {
                this.appData.jointCells.set(node.id, node);
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

    addEdge (edge: Edge) {
        if (!this.appData.jointCells.get(edge.id)) {
            this.appData.jointCells.set(edge.id, edge);
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

    removeNode (node: Node) {
        // If the node hasn't already been removed, we remove it.
        // Otherwise, do nothing
        if (this.graph._nodes[node.id]) {
            // Retrieve the cell
            this.removeNodeFromId(node.id);
        }
    }

    private removeNodeFromId (id: string) {
        const cell = this.graph.getCell(id);
        // Remove it
        if (cell && cell.attributes.type === 'html.Element') {
            this.graph.removeCells(cell);
        }
    }

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

    createBlockForNode(node: Node) {
        const component = this.appData.getComponents().get(node.component);

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

    /* ----------------------------------------------------------------------------
                         METHODS TO REACT TO USER ACTIONS
     ---------------------------------------------------------------------------- */

    addedEdge (cell: any) {

        const attr = cell.attributes;

        if (attr.target.id) {
            const e: Object = {
                id: attr.id,
                tgt: { node: attr.target.id, port: attr.target.port },
                metadata: {},
                graph: this.appData.flow.id
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
                graph: this.appData.flow.id
            };

            this.linkWaitingForTarget.set(e['id'], e);
        }
    }

    removedEdge (cell: any) {
        // Retrieve the edge object
        const edge = this.appData.getEdge(cell.id);
        // Send the message
        this.flowComponent.removedEdge(edge);
    }

    edgeChanged (cell: any) {
        // Retrieve the edge object
        const edge = this.appData.getEdge(cell.id);
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

    removedNode (evt: MouseEvent) {
        // Retrieve the id of the block
        const id = evt.currentTarget['parentElement'].id;

        // Remove it from the graph
        const cell = this.graph.getCell(id);
        this.graph.removeCells(cell);

        // Send a removenode message to the server
        const node = this.appData.getNode(id);
        this.flowComponent.removedNode(node);

        // Close the window opened for this node
        this.flowComponent.emitCloseWindowEvent(node);
    }



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

    /* ----------------------------------------------------------------------------
                                PRIVATE METHODS
     ---------------------------------------------------------------------------- */

    private updateSourceConnectedEdge (attr: any) {
        // Set the connected edge property of the port
        const n = this.appData.getNode(attr.source.id);
        const p = n.getPort(attr.source.port);
        p.addConnectedEdge(attr.id);

        // Send the change node message
        this.flowComponent.nodeChanged(n);
    }

    private updateTargetConnectedEdge (attr: any) {
        // Set the connected edge property of the port
        const n = this.appData.getNode(attr.target.id);
        const p = n.getPort(attr.target.port);
        p.addConnectedEdge(attr.id);

        // Send the change node message
        this.flowComponent.nodeChanged(n);
    }

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

    private addGraphEventListeners () {
        this.graph.on('add', (cell: any) => {
            if (cell.attributes.type === 'link') {
                this.addedEdge(cell);
            }
        });

        this.graph.on('change:source', (cell: any) => {
            if (cell.attributes.type === 'link' && cell.attributes.source.id && this.linkWaitingForSrc.get(cell.attributes.id)) {
                this.addEdgeSourceOnWaitingLink(cell);
            } else if (cell.attributes.source.id && this.appData.getEdge(cell.id) !== null) {
                this.edgeChanged(cell);
            }
        });

        this.graph.on('change:target', (cell: any) => {
            if (cell.attributes.type === 'link' && cell.attributes.target.id && this.linkWaitingForTarget.get(cell.attributes.id)) {
                this.addEdgeTargetOnWaitingLink(cell);
            } else if (cell.attributes.target.id && this.appData.getEdge(cell.id) !== null) {
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

    private getIds (objects: Array<any>): Array<string> {
        const res = [];

        objects.forEach((o: any) => {
            res.push(o.id);
        });

        return res;
    }

    private getJointCellsNodesIds (): Array<string> {
        const res = [];

        this.appData.jointCells.forEach((value: any, key: string) => {
            if ( value instanceof Node) {
                res.push(key);
            }
        });

        return res;
    }

}
