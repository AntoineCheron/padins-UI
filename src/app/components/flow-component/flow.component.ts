/**
 * Created by antoine on 08/06/17.
 */

import {Component, OnInit, ViewChild} from '@angular/core';
import * as joint from 'jointjs';
import { Colors } from './colors';
import { Node } from '../../types/Node';
import * as FBPComponent from '../../types/Component';
import Atomic = joint.shapes.devs.Atomic;
import {DataService} from '../../services/data.service';
import {Edge} from '../../types/Edge';
import {SocketService} from '../../services/socket.service';
import {FBPMessage} from "../../types/FBPMessage";
declare var $: JQueryStatic;

@Component({
    selector: 'flow',
    templateUrl: './flow.component.html',
})

export class FlowComponent implements OnInit {
    // Attributes
    @ViewChild('jointjs') private jointjs: any;
    private eventHub: any; // Golden layout event hub
    initialized: boolean = false;
    graph: any;
    paper: any;
    components: Map<string, FBPComponent.Component>;
    colors: Colors;
    domElementsNodeMap: Map<any, Node>;
    edgesAwaitingMsgFromServer: Array<Edge> = [];
    linkWaitingForTarget: Map<string, Object> = new Map();
    linkWaitingForSrc: Map<string, Object> = new Map();

    constructor(private appData: DataService, private socket: SocketService) {
        this.colors = new Colors();
        this.components = this.appData.getComponents();
        this.domElementsNodeMap = new Map();
    }

    ngOnInit() {
        // Retrieving width and height for the zone of the graph
        const width = this.jointjs.nativeElement.parentElement.parentElement.clientWidth;
        const height = this.jointjs.nativeElement.parentElement.parentElement.clientHeight;

        // Initialize the model, named graph and the paper, which is the zone
        // displaying the flows
        this.initialized = true;
        this.graph = this.appData.graph;
        this.paper = new joint.dia.Paper({
            el: this.jointjs.nativeElement,
            width: width,
            height: height,
            model: this.graph,
            gridSize: 1,
        });

        // Initalize event listeners for the graph
        this.addGraphEventsListeners();
    }

    updateNodes () {
        // Add the nodes already retrieved from the server
        const nodes: Array<Node> = this.appData.getNodes();
        if (nodes) {
            nodes.forEach((element) => {
                this.addNode(element);
            });
        }
    }

    updateEdges () {
        // Add the edges already retrieved from the server
        const edges: Array<Edge> = this.appData.getEdges();
        if (edges) {
            edges.forEach((element) => {
                this.addEdge(element);
            });
        }
    }


    /* ----------------------------------------------------------------------------
                            USER INTERFACE RELATED METHODS
     ---------------------------------------------------------------------------- */

    addNode (node: Node) {
        // Store the node
        if (!this.appData.jointCells.get(node.id)) {
            this.appData.jointCells.set(node.id, node);
            // Create the block that will be added onto the graph
            const block = this.createBlockForComponent(this.components.get(node.component), node.id);
            if (block) {
                // Add the block onto the graph
                this.graph.addCell(block);
                // Add an event listener for the double click event
                this.addDblClickEventListenerToBlock(block, node);
            }
        }
    }

    removedNode (cell: any) {
        // TODO
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
            const i = this.edgesAwaitingMsgFromServer.indexOf(edge);
            this.edgesAwaitingMsgFromServer.splice(i, 1);
        }
    }

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

    removeEdge(edge: Edge) {
        // If the edge hasn't already been removed, we remove it.
        // Otherwise, do nothing
        if (this.graph._edges[edge.id]) {
            // Retrieve the cell
            const cell = this.graph.getCell(edge.id);
            // Remove it
            if (cell.attributes.type === 'link') {
                this.graph.removeCell(cell);
            }
        }
    }

    removedEdge (cell: any) {
        // Retrieve the edge object
        const edge = this.appData.getEdge(cell.id);
        // Send the message
        this.socket.sendRemoveEdge(edge);
    }

    addEdgeSourceOnWaitingLink (cell: any) {
        const e = this.linkWaitingForSrc.get(cell.id);
        this.linkWaitingForSrc.delete(cell.id);
        e['src'] = {
            node: cell.attributes.source.id,
            port: cell.attributes.source.port
        };

        this.createEdge(new Edge(e));
    }

    addEdgeTargetOnWaitingLink (cell: any) {
        const e = this.linkWaitingForTarget.get(cell.id);
        this.linkWaitingForTarget.delete(cell.id);
        e['tgt'] = { node: cell.attributes.target.id, port: cell.attributes.target.port };
        this.createEdge(new Edge(e));
    }

    createEdge (e: Edge) {
        // Verify that the edge doesn't already exist
        if (!this.appData.edgeExist(e)) {
            // If doesn't exist, store the info that it will wait for the response from the server
            this.edgesAwaitingMsgFromServer.push(e);
            // Store the edge in the jointCells object
            this.appData.jointCells.set(e.id, e);
            // And send the addedge message to server
            this.socket.sendAddEdge(e);
        }
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
        this.socket.sendChangeEdge(edge);
    }

    updateEdge (oldEdge: Edge, newEdge: Edge) {
        const cell = this.graph.getCell(oldEdge.id);

        console.log(cell);
    }

    /* ----------------------------------------------------------------------------
                              GRAPH RELATED METHODS
     ---------------------------------------------------------------------------- */

    addGraphEventsListeners () {
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


    /* ----------------------------------------------------------------------------
                                GENERIC METHODS
     ---------------------------------------------------------------------------- */

    toJson() {
        // Time to code :10 minutes
        /* Example :
         json = [cell1, cell2]
         where cell = {
         type, -> find it in cell.attrs['.label'].text
         id,
         input,
         output
         } + a lot of other informations
         */
        console.log(this.graph.toJSON());

        return this.graph.toJSON();
    }

    createBlockForComponent(component: FBPComponent.Component, id: string) {
        if (component) {
            const label: string = component.name;
            const color = this.colors.getColor(label);

            // Create the block
            const block = new joint.shapes.devs.Atomic({
                id: id,
                position: {
                    x: 6,
                    y: 6
                },
                size: {
                    width: 110,
                    height: 40
                },
                output: {el1: 'first output'},
                input: {el1: `first input`},
                attrs: {
                    '.body': {
                        'ref-height': '100%',
                        'ref-width': '100%',
                        'stroke': color,
                        'rx': 6,
                        'ry': 6,
                        'stroke-width': 3,
                    },
                    '.label': {
                        /* Don't remove any attribute, we have to redefine every element because
                         we overwritte the object. For colors look into style.scss */
                        'fill': color,
                        'font-size': 14,
                        'ref-x': 0.5,
                        'ref-y': 10,
                        'text': label,
                        'text-anchor': 'middle'
                    }
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

    addDblClickEventListenerToBlock(block: Atomic, node: Node) {
        // This function must be called after the block has been added to the graph
        const id = `j_${block.attributes.z}`;
        const domElement = document.getElementById(id);
        this.domElementsNodeMap.set(domElement.id, node);
        domElement.addEventListener('dblclick', (event) => { this.handleDblClick(event); }, false);
    }

    handleDblClick(event: MouseEvent) {
        // Look for the id of the block
        let lastCheckedEl = event.srcElement.parentElement;
        let node: Node = this.domElementsNodeMap.get(lastCheckedEl.id);
        while (!node) {
            lastCheckedEl = lastCheckedEl.parentElement;
            node = this.domElementsNodeMap.get(lastCheckedEl.id);
        }

        node = this.appData.getNode(node.id);

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
