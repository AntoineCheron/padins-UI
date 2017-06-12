/**
 * Created by antoine on 09/06/17.
 */

import { Injectable } from '@angular/core';
import { Component } from '../fbp-data-classes/component';
import { Edge } from '../fbp-data-classes/edge';
import { Node } from '../fbp-data-classes/node';
import { Flow } from '../fbp-data-classes/flow';
import * as joint from 'jointjs';

@Injectable()
export class DataService {
    public flow: Flow;
    public components: Map<String, Component>;
    public nodes: Array<Node>;
    public edges: Array<Edge>;

    // JointJS related attributes
    public graph: any;
    public jointNodes: Map<String, Node>;

    constructor() {
        this.components = new Map();
        this.nodes = new Array();
        this.jointNodes = new Map();
        this.graph = new joint.dia.Graph;
        this.flow = new Flow(); // TODO : retrieve from server

        // Testing
        const c: Component = new Component('Model', '', false, ['pre-proc data'], ['model']);
        this.components.set(c.name, c);
        const c2: Component = new Component('Processing', '', false, ['data to process'], ['processed data']);
        this.components.set(c2.name, c2);
    }

    getComponents () {
        return this.components;
    }

    getNodes () {
        return this.nodes;
    }

    getEdges () {
        return this.edges;
    }
}
