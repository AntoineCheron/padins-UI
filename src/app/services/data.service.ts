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
    eventHub: any;
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
    }

    setEventHub(hub: any) {
        this.eventHub = hub;

        // Subscribe to events
    }

    setFlow (flow: Flow) {
        this.flow = flow;
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

    addComponent (component: Component) {
        this.components.set(component.name, component);

        if (this.eventHub) {
            this.eventHub.emit('newComponentAvailable');
        }
    }
}
