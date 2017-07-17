/**
 * Created by antoine on 08/06/17.
 */

import {Component, OnInit, ViewChild} from '@angular/core';
import * as joint from 'jointjs';
import { Colors } from './colors';
import { Node } from '../../types/Node';
import * as FBPComponent from '../../types/Component';
import { WorkspaceService } from '../../services/workspace.service';
import { Edge } from '../../types/Edge';
import { SocketService } from '../../services/socket.service';
import { GraphController } from './GraphController';
import { HtmlElement } from './HtmlElement';

@Component({
    selector: 'flow',
    templateUrl: './flow.component.html',
})

export class FlowComponent implements OnInit {
    // Attributes
    @ViewChild('jointjs') private jointjs: any;
    private eventHub: any; // Golden layout event hub
    graphController: GraphController;
    initialized: boolean = false;
    graph: any;
    paper: any;
    components: Map<string, FBPComponent.Component>;
    colors: Colors;
    domElementsNodeMap: Map<any, Node>;
    edgesAwaitingMsgFromServer: Array<Edge> = [];

    // Constants
    public readonly BLOCK_WIDTH: number = 130;
    public readonly BLOCK_HEIGHT: number = 40;

    constructor(private workspaceData: WorkspaceService, private socket: SocketService) {
        this.colors = new Colors();
        this.components = this.workspaceData.getComponents();
        this.domElementsNodeMap = new Map();
    }

    ngOnInit() {
        // Retrieving width and height for the zone of the graph
        const width = this.jointjs.nativeElement.parentElement.parentElement.parentElement.clientWidth;
        const height = this.jointjs.nativeElement.parentElement.parentElement.parentElement.clientHeight;

        // Initialize the model, named graph and the paper, which is the zone
        // displaying the flows
        this.initialized = true;
        this.graphController = new GraphController(this.workspaceData, this);
        this.paper = new joint.dia.Paper({
            el: this.jointjs.nativeElement,
            width: width,
            height: height,
            model: this.graphController.graph,
            gridSize: 1,
            snapLinks: { radius: 15},
            defaultRouter: { name: 'manhattan' },
            defaultConnector: { name: 'rounded' },
        });

        // Configure the html element that will be used as the block elements
        HtmlElement.createHtmlElement();

        // Initalize event listeners for the graph
        this.addGraphEventsListeners();

        // Solve a bug avoiding the display of the nodes
        this.eventHub.emit('flow-ready');
    }

    updateNodes () {
        // Add the nodes already retrieved from the server
        const nodes: Array<Node> = this.workspaceData.getNodes();
        if (nodes) {
            this.graphController.removeGraphNodesThatAreNotInThisSet(nodes);
            this.addNodes(nodes);
        }
    }

    updateEdges () {
        // Add the edges already retrieved from the server
        const edges: Array<Edge> = this.workspaceData.getEdges();
        if (edges) {
            edges.forEach((element) => {
                this.addEdge(element);
            });
        }
    }


    /* ----------------------------------------------------------------------------
                FLOW MANAGEMENT RELATED METHODS
     ---------------------------------------------------------------------------- */

    addNode (node: Node) {
        this.graphController.addNode(node);
    }

    addNodes(n: Array<Node>) {
        this.graphController.addNodes(n);
    }

    removeNode (node: Node) {
        this.graphController.removeNode(node);
    }

    addEdge (edge: Edge) {
        this.graphController.addEdge(edge);
    }

    removeEdge(edge: Edge) {
        this.graphController.removeEdge(edge);
    }

    edgeChanged (edge: Edge) {
        this.socket.sendChangeEdge(edge);
    }

    nodeChanged (node: Node) {
        this.socket.sendChangeNode(node);
    }

    removedEdge (edge: Edge) {
        this.socket.sendRemoveEdge(edge);
    }

    removedNode (node: Node) {
        this.socket.sendRemoveNode(node);
    }

    createEdge (e: Edge) {
        // Verify that the edge doesn't already exist
        if ((e.src['node'] !== e.tgt['node'] || e.src['port'] !== e.tgt['port']) && !this.workspaceData.edgeExist(e)) {
            // If doesn't exist, store the info that it will wait for the response from the server
            this.edgesAwaitingMsgFromServer.push(e);
            // Store the edge in the jointCells object
            this.workspaceData.jointCells.set(e.id, e);
            // And send the addedge message to server
            this.socket.sendAddEdge(e);
        }
    }

    updateEdge (oldEdge: Edge, newEdge: Edge) {
        this.graphController.updateEdge(oldEdge, newEdge);
    }

    updateBlockName (node: Node) {
        const cell = this.graphController.graph.getCell(node.id);
        cell.removeAttr('node');
        cell.attr('node', node);
    }

    emitCloseWindowEvent (node: Node) {
        this.eventHub.emit('closeWindow', node);
    }


    /* ----------------------------------------------------------------------------
                                GENERIC METHODS
     ---------------------------------------------------------------------------- */

    createBlockForNode(node: Node) {
        return this.graphController.createBlockForNode(node);
    }

    handleDblClick(cell: any) {
        const id = cell.model.id;
        const node = this.workspaceData.getNode(id);

        if (this.eventHub) {
            this.eventHub.emit('openWindow', node);
        }
    }

    /* ----------------------------------------------------------------------------
                                    SETTERS
     ---------------------------------------------------------------------------- */

    setEventHub(hub: any) {
        this.eventHub = hub;

        // Subscribe to events
        this.eventHub.on('resize', () => {
            this.resize();
        });

        this.eventHub.on('addNode', (node: Node) => {
            this.addNode(node);
        });

        this.eventHub.on('removeNode', (node: Node) => {
            this.removeNode(node);
        });

        this.eventHub.on('addEdge', (edge: Edge) => {
            this.addEdge(edge);
        });

        this.eventHub.on('removeEdge', (edge: Edge) => {
            this.removeEdge(edge);
        });

        this.eventHub.on('Flow and components set up', () => {
            this.updateNodes();
            this.updateEdges();
        });

        this.eventHub.on('updateEdge', (oldEdge: Edge, newEdge: Edge) => {
            this.updateEdge(oldEdge, newEdge);
        });

        this.eventHub.on('blockNameChanged', (node: Node) => {
            this.updateBlockName(node);
        });

        this.eventHub.on('flow:startnode', (id: string) => {
            this.graphController.nodeStartRunning(id);
        });

        this.eventHub.on('flow:finishnode', (id: string) => {
            this.graphController.nodeStopRunning(id);
        });

        this.eventHub.on('simulationfinished', () => {
            this.graphController.removeRunningClassOnAllNodes();
        });
    }

    /* ----------------------------------------------------------------------------
     INITIALIZATION METHODS
     ---------------------------------------------------------------------------- */

    addGraphEventsListeners () {
        this.paper.on('cell:pointerdblclick', (a: any) => {
            this.handleDblClick(a);
        });
    }

    /* ----------------------------------------------------------------------------
                        COMPONENT-SPECIFIC METHODS
     ---------------------------------------------------------------------------- */

    resize() {
        if (this.paper) {
            // Retrieving width and height for the zone of the graph
            const width = this.jointjs.nativeElement.parentElement.parentElement.clientWidth;
            const height = this.jointjs.nativeElement.parentElement.parentElement.clientHeight;

            // Resizing
            this.paper.setDimensions(width, height);
        }
    }
}
