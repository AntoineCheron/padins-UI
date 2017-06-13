/**
 * Created by antoine on 09/06/17.
 */

import { Injectable } from '@angular/core';
import { Component } from '../types/component';
import { Edge } from '../types/edge';
import { Node } from '../types/node';
import { Flow } from '../types/flow';
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
        this.nodes = [];
        this.edges = [];
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

    getNode(id: String): Node {
        this.nodes.forEach(node => {
            if (node.id === id) { return node; }
        });

        return null;
    }

    getEdges () {
        return this.edges;
    }

    getPreviousNodes (node: Node): Array<Node> {
        const connectedNodes: Array<Node> = [];

        // Retrieve all the previous nodes
        this.edges.forEach(edge => {
            if (node.id === edge.tgt.node) {
                const n = this.getNode(edge.src.node);
                if (n !== null) { connectedNodes.push(n); }
            }
        });

        // Return the array
        return connectedNodes;
    }
}
