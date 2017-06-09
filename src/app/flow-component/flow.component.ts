/**
 * Created by antoine on 08/06/17.
 */

import {Component, OnInit, ViewChild} from '@angular/core';
import * as joint from 'jointjs';
import Atomic = joint.shapes.devs.Atomic;
declare var $: JQueryStatic;

@Component({
    selector: 'flow',
    template: `
        <div class="joinsjs" #jointjs></div>
    `,
})

export class FlowComponent implements OnInit {
    // Attributes
    @ViewChild('jointjs') private jointjs: any;
    initialized: boolean = false;
    graph: any;
    paper: any;

    constructor() {
        // Do nothing for now
    }

    initializeLib() {
        // Retrieving width and height for the zone of the graph
        const width = this.jointjs.nativeElement.parentElement.parentElement.clientWidth;
        const height = this.jointjs.nativeElement.parentElement.parentElement.clientHeight;

        // Initialize the model, named graph and the paper, which is the zone
        // displaying the flows
        this.initialized = true;
        this.graph = new joint.dia.Graph;
        this.paper = new joint.dia.Paper({
            el: this.jointjs.nativeElement,
            width: width,
            height: height,
            model: this.graph,
            gridSize: 1
        });
    }

    ngOnInit() {
        this.initializeLib();

        // Testings
        this.addInputBlock();
        this.addProcessingBlock();
    }

    /* ----------------------------------------------------------------------------
                            USER INTERFACE RELATED METHODS
     ---------------------------------------------------------------------------- */

    addInputBlock() {
        const block = this.createOutputOnlyBlock(['input data']);
        // Set the color and the label
        this.setBlockColorAndLabel(block, '#F3B700', 'Input');
        // Add the block onto the graph
        this.graph.addCell(block);
        // Add an event listener for the double click event
        this.addDblClickEventListenerToBlock(block);
    }

    addProcessingBlock() {
        const block = this.createInputOutputBlock(['data to process'], ['processed data']);
        // Set the color and the label
        this.setBlockColorAndLabel(block, '#68C3D4', 'Processing');
        // Add the block onto the graph
        this.graph.addCell(block);
        // Add an event listener for the double click event
        this.addDblClickEventListenerToBlock(block);
    }

    addSimulationBlock() {
        const block = this.createInputOutputBlock(['simulation inputs'], ['simulation results']);
        // Set the color and the label
        this.setBlockColorAndLabel(block, '#260F26', 'Simulation');
        // Add the block onto the graph
        this.graph.addCell(block);
        // Add an event listener for the double click event
        this.addDblClickEventListenerToBlock(block);
    }

    addOutputBlock() {
        const block = this.createInputOnlyBlock(['data to display']);
        // Set the color and the label
        this.setBlockColorAndLabel(block, '#71B48D', 'Output');
        // Add the block onto the graph
        this.graph.addCell(block);
        // Add an event listener for the double click event
        this.addDblClickEventListenerToBlock(block);
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

    createInputOutputBlock(inputs: Array<String>, outputs: Array<String>) {
        const block = this.createEmptyBlock();

        block.set('inPorts', inputs);
        block.set('outPorts', outputs);

        return block;
    }

    createInputOnlyBlock(inputs: Array<String>) {
        const block = this.createEmptyBlock();

        block.set('inPorts', inputs);

        return block;
    }

    createOutputOnlyBlock(outputs: Array<String>) {
        const block = this.createEmptyBlock();

        block.set('outPorts', outputs);

        return block;
    }

    createEmptyBlock() {
        return new joint.shapes.devs.Atomic({
            position: {
                x: 6,
                y: 6
            },
            size: {
                width: 160,
                height: 100
            },
            output: {el1 : 'first output'},
            input: {el1 : `first input`},
        });
    }

    setBlockColorAndLabel(block: Atomic, color: String, label: String) {
        block.attributes.attrs['.label'] = {
            /* Don't remove any attribute, we have to redefine every element because
             we overwritte the object. For colors look into style.scss */
            'fill': color,
            'font-size': 18,
            'ref-x': 0.5,
            'ref-y': 10,
            'text': label,
            'text-anchor': 'middle'
        };

        block.attributes.attrs['.body'] = {
            'ref-height': '100%',
            'ref-width': '100%',
            'stroke': color,
            'rx': 6,
            'ry': 6,
            'stroke-width': 6,
        };
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

}
