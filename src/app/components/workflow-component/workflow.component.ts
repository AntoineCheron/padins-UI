import {Component, OnInit, ViewChild} from '@angular/core';
import * as joint from 'jointjs';
import { Colors } from './colors';
import { Node } from '../../types/node';
import * as FBPComponent from '../../types/component';
import { WorkspaceService } from '../../services/workspace.service';
import { Edge } from '../../types/edge';
import { SocketService } from '../../services/socket.service';
import { GraphController } from './graph-controller';
import { HtmlElement } from './html-element';

@Component({
    selector: 'workflow',
    templateUrl: './workflow.component.html',
})

/**
 * This component is used as a sub-component of the workspace component. It is registered in the GoldenLayout component.
 *
 * UI Component that display the graph to the user and let her interact with it. It uses jointJS as the library to do
 * this.
 *
 * It uses a deep event handling in order to send the right messages to the server, using the FBP Network Protocol, at
 * the right moment. Actually, most of the action are triggered by event handlers in this class.
 *
 * On this component, a user can :
 * - Move nodes
 * - Remove nodes
 * - Add edges
 * - Remove edges
 * - Connect edges to other nodes
 * - Double-click a node to display its corresponding component
 *
 * On the other side, the component reflect the Workflow data stored in the Workspace Service. So, for example, when the
 * name of a node is changed, the displayed name change automatically on the graph. Also, when a user click on a node
 * in the "flow-nodes-list-component", a node is added on the chart.
 *
 * This component uses a Graph-Controller that implements most of the methods used to interact with the graph itself.
 * In this class are implemented most of the event handlers.
 *
 * Created by antoine on 08/06/17.
 */
export class WorkflowComponent implements OnInit {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    // Graph interaction related attributes
    @ViewChild('jointjs') private jointjs: any;
    graphController: GraphController;
    paper: any;

    // Event Hub, from Golden Layout, used to communicate between components
    private eventHub: any; // Golden layout event hub

    // Component's state
    initialized: boolean = false;

    // Attributes related to already displayed nodes and edges
    domElementsNodeMap: Map<any, Node>;
    edgesAwaitingMsgFromServer: Array<Edge> = [];

    // Attributes related to displaying nodes properly
    components: Map<string, FBPComponent.Component>;
    colors: Colors;
    public readonly BLOCK_WIDTH: number = 130;
    public readonly BLOCK_HEIGHT: number = 40;

    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor(private workspaceData: WorkspaceService, private socket: SocketService) {
        this.colors = new Colors();
        this.components = this.workspaceData.getComponents();
        this.domElementsNodeMap = new Map();
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                OnInit INTERFACE METHODS IMPLEMENTATION
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Initialize the elements that display the paper (the element that will host the nodes and edges) and the elements
     * needed to interact with the graph in the future.
     */
    ngOnInit() {
        // Retrieving width and height for the zone of the graph
        const width = this.jointjs.nativeElement.parentElement.parentElement.parentElement.clientWidth;
        const height = this.jointjs.nativeElement.parentElement.parentElement.parentElement.clientHeight;

        // Initialize the model, named graph and the paper, which is the zone displaying the flows
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
            async: true,
        });

        this.graphController.graph.resetCells(this.graphController.graph.getCells());

        // Configure the html element that will be used as the block elements
        HtmlElement.createHtmlElement();

        // Initalize event listeners for the graph
        this.addGraphEventsListeners();

        // Solve a bug avoiding the display of the nodes
        this.eventHub.emit('flow-ready');
    }

    /* -----------------------------------------------------------------------------------------------------------------
                        METHODS TO UPDATE THE WHOLE LIST OF NODES OR EDGES DISPLAYED
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Update the set of nodes displayed on the graph. To do it, it retrieves the nodes from the most trusted source :
     * the WorkspaceService and compare the displayed ones to the ones in the retrieved list. Then it update the content.
     */
    private updateNodes () {
        // Add the nodes already retrieved from the server
        const nodes: Array<Node> = this.workspaceData.getNodes();
        if (nodes) {
            this.graphController.removeGraphNodesThatAreNotInThisSet(nodes);
            this.graphController.addNodes(nodes);
        }
    }

    /**
     * Update the set of edges displayed on the graph. To do it, it retrieves the edges from the most trusted source :
     * the WorkspaceService and compare the displayed ones to the ones in the retrieved list. Then it update the content.
     */
    private updateEdges () {
        // Add the edges already retrieved from the server
        const edges: Array<Edge> = this.workspaceData.getEdges();
        if (edges) {
            edges.forEach((element) => {
                this.graphController.addEdge(element);
            });
        }
    }


    /* -----------------------------------------------------------------------------------------------------------------
                                FLOW'S CONTENT MANAGEMENT RELATED METHODS
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * The given edge's metadata change. Send its new metadata to the server.
     *
     * @param edge {Edge} the updated edge.
     */
    edgeChanged (edge: Edge) {
        this.socket.sendChangeEdge(edge);
    }

    /**
     * The given node's metadata change. Send its new metadata to the server.
     *
     * @param node {Node} the updated node.
     */
    nodeChanged (node: Node) {
        this.socket.sendChangeNode(node);
    }

    /**
     * The user wants to remove the given edge from the workflow. Send this information to the server.
     *
     * @param edge {Edge} the edge removed from the graph.
     */
    removedEdge (edge: Edge) {
        this.socket.sendRemoveEdge(edge);
    }

    /**
     * The user wants to remove the given node from the workflow. Send this information to the server.
     *
     * @param node {Node} the node removed from the graph.
     */
    removedNode (node: Node) {
        this.socket.sendRemoveNode(node);
    }

    /**
     * The user wants to create an edge with the given data. Send this information to the server. If it is possible,
     * the server will respond with a graph:addedge message.
     *
     * @param e {Edge} the edge to create.
     */
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

    /**
     * Replace the name of the node with a new one.
     *
     * @param node {Node} the node with the updated data
     */
    updateBlockName (node: Node) {
        const cell = this.graphController.graph.getCell(node.id);
        cell.removeAttr('node');
        cell.attr('node', node);
    }

    /**
     * Emit a 'closewindow' event on the eventHub in order to close the node's detailed view.
     *
     * @param node {Node} the targeted node
     */
    emitCloseWindowEvent (node: Node) {
        this.eventHub.emit('closeWindow', node);
    }


    /* -----------------------------------------------------------------------------------------------------------------
                                                GENERIC METHODS
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * Create a JointJS block for the given node.
     *
     * @param node {Node} the source node
     * @returns {dia.Element} the resulting jointJS block
     */
    createBlockForNode(node: Node) {
        return this.graphController.createBlockForNode(node);
    }

    /**
     * Handle the double click event from a jointjs cell by opening the node's detailed view if the cell is a node.
     *
     * @param cell the jointJS cell that triggered the event
     */
    handleDblClick(cell: any) {
        const id = cell.model.id;
        const node = this.workspaceData.getNode(id);

        if (this.eventHub) {
            this.eventHub.emit('openWindow', node);
        }
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                                    SETTERS
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * Set the eventhub instance to use in order to communicate with the other components, and subscribe to the
     * events useful for this component.
     *
     * @param hub {any} the golden layout event hub to use
     */
    setEventHub(hub: any) {
        this.eventHub = hub;

        // Subscribe to events
        this.eventHub.on('resize', () => {
            this.resize();
        });

        this.eventHub.on('addNode', (node: Node) => {
            this.graphController.addNode(node);
        });

        this.eventHub.on('removeNode', (node: Node) => {
            this.graphController.removeNode(node);
        });

        this.eventHub.on('addEdge', (edge: Edge) => {
            this.graphController.addEdge(edge);
        });

        this.eventHub.on('removeEdge', (edge: Edge) => {
            this.graphController.removeEdge(edge);
        });

        this.eventHub.on('Flow and components set up', () => {
            this.updateNodes();
            this.updateEdges();
        });

        this.eventHub.on('updateEdge', (oldEdge: Edge, newEdge: Edge) => {
            this.graphController.updateEdge(oldEdge, newEdge);
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

    /* -----------------------------------------------------------------------------------------------------------------
                                            INITIALIZATION METHODS
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * Subscribe to the graph's events useful in this component.
     *
     * It subscribes to :
     * - cell:pointdblclick
     */
    addGraphEventsListeners () {
        this.paper.on('cell:pointerdblclick', (a: any) => {
            this.handleDblClick(a);
        });
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                        COMPONENT SIZE RELATED METHODS
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * Resize the component's window in the golden layout.
     * This method is called each time the user change the window's size or redimension the browser's window.
     */
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
