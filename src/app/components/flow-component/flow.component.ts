/**
 * Created by antoine on 08/06/17.
 */

import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import * as joint from 'jointjs';
import { Colors } from './colors';
import { Node } from '../../fbp-data-classes/node';
import * as FBPComponent from '../../fbp-data-classes/component';
import Atomic = joint.shapes.devs.Atomic;
import {DataService} from '../../data-service/data.service';
import {Edge} from '../../fbp-data-classes/edge';
import {Port} from '../../fbp-data-classes/port';
declare var $: JQueryStatic;

@Component({
    selector: 'flow',
    templateUrl: './template.html'
})

export class FlowComponent implements OnInit {
    // Attributes
    @ViewChild('jointjs') private jointjs: any;
    initialized: boolean = false;
    graph: any;
    paper: any;
    nodes: Map<String, Node>;
    components: Map<String, FBPComponent.Component>;
    colors: Colors;

    constructor(private appData: DataService) {
        this.colors = new Colors();
        this.nodes = this.appData.jointNodes;
        this.components = this.appData.getComponents();
    }

    ngOnInit() {
        const that = this;

        this.initializeLib();

        // Add the nodes already retrieved from the server
        const nodes: Array<Node> = this.appData.getNodes();
        if (nodes) {
            nodes.forEach(function(element) {
                that.addNode(element);
            });
        }

        // Add the edges already retrieved from the server
        const edges: Array<Edge> = this.appData.getEdges();
        if (edges) {
            edges.forEach(function(element) {
                that.addEdge(element);
            });
        }

        // Testing
        const node = new Node();
        node.component = 'Model';
        node.graph = '1234';
        node.id = '123456789';
        node.metadata = {};

        this.addNode(node);

        const node2 = new Node();
        node2.component = 'Processing';
        node2.graph = '1234';
        node2.id = '019347124';
        node2.metadata = {};


        this.addNode(node2);

        const edge = new Edge();
        edge.graph = '1234';
        edge.src = { node: '123456789', port: 'model'};
        edge.tgt = { node: '019347124', port: 'data to process'};

        this.addEdge(edge);

    }

    initializeLib() {
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
            gridSize: 1
        });
    }


    /* ----------------------------------------------------------------------------
                            USER INTERFACE RELATED METHODS
     ---------------------------------------------------------------------------- */

    addNode (node: Node) {
        // Store the node
        this.nodes.set(node.id, node);

        // Create the block that will be added onto the graph
        const block = this.createBlockForComponent(this.components.get(node.component), node.id);
        if (block) {
            // Add the block onto the graph
            this.graph.addCell(block);
            // Add an event listener for the double click event
            this.addDblClickEventListenerToBlock(block);
        }
    }

    addEdge (edge: Edge) {
        // Build the link object that is an edge in the jointJs lib
        const link = new joint.dia.Link({
            source: { id: edge.src.node, port: edge.src.port},
            target: { id: edge.tgt.node, port: edge.tgt.port},
        });

        // Add the edge on the graph
        this.graph.addCell(link);
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

    createBlockForComponent(component: FBPComponent.Component, id: String) {
        if (component) {
            const label = component.name;
            const color = this.colors.getColor(label);

            // Create the block
            const block = new joint.shapes.devs.Atomic({
                id: id,
                position: {
                    x: 6,
                    y: 6
                },
                size: {
                    width: 160,
                    height: 50
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
                        'stroke-width': 4,
                    },
                    '.label': {
                        /* Don't remove any attribute, we have to redefine every element because
                         we overwritte the object. For colors look into style.scss */
                        'fill': color,
                        'font-size': 18,
                        'ref-x': 0.5,
                        'ref-y': 10,
                        'text': label,
                        'text-anchor': 'middle'
                    }
                }
            });

            if (component.inPorts.length !== 0) {
                block.set('inPorts', component.getInportsAsStringArray());
            }
            if (component.outPorts.length !== 0) {
                block.set('outPorts', component.getOutportsAsStringArray());
            }

            return block;

        }
    }

    addDblClickEventListenerToBlock(block: Atomic) {
        // This function must be called after the block has been added to the graph
        const id = `j_${block.attributes.z}`;
        const domElement = document.getElementById(id);
        domElement.addEventListener('dblclick', this.handleDblClick, false);
    }

    handleDblClick() {
        alert('You double clicked on an element');
    }

    /* ----------------------------------------------------------------------------
                                COMPONENT-SPECIFIC METHODS
     ---------------------------------------------------------------------------- */

    @HostListener('window:resize', ['$event'])
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