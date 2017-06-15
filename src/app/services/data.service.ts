/**
 * Created by antoine on 09/06/17.
 */

import { Injectable } from '@angular/core';
import { Component } from '../types/Component';
import { Node } from '../types/Node';
import { Flow } from '../types/Flow';
import * as joint from 'jointjs';

@Injectable()
export class DataService {
    eventHub: any;
    public flow: Flow;
    public components: Map<String, Component>;

    // JointJS related attributes
    public graph: any;
    public jointCells: Map<String, any>;

    // Utils attributes
    componentsSetup: boolean = false;

    constructor() {
        this.components = new Map();
        this.jointCells = new Map();
        this.graph = new joint.dia.Graph;
    }

    setEventHub(hub: any) {
        this.eventHub = hub;

        // Subscribe to events
    }

    setFlow (flow: Flow) {
        this.flow = flow;

        this.broadcastFlowAndComponentsSetUp();
    }

    getComponents () {
        return this.components;
    }

    getNodes () {
        return this.flow ? this.flow.nodes : null;
    }

    getNode(id: String): Node {
        this.flow.nodes.forEach(node => {
            if (node.id === id) { return node; }
        });

        return null;
    }

    getEdges () {
        return this.flow ? this.flow.edges : null;
    }

    getPreviousNodes (node: Node): Array<Node> {
        const connectedNodes: Array<Node> = [];

        // Retrieve all the previous nodes
        if (this.flow) {
            this.flow.edges.forEach(edge => {
                if (node.id === edge.tgt['node']) {
                    const n = this.getNode(edge.src['node']);
                    if (n !== null) { connectedNodes.push(n); }
                }
            });

            // Return the array
            return connectedNodes;
        } else {
            return null;
        }
    }

    addComponent (component: Component) {
        this.components.set(component.name, component);

        if (this.eventHub) {
            this.eventHub.emit('newComponentAvailable');
        }
    }

    addNode (node: Node) {
        this.flow.nodes.push(node);

        this.eventHub.emit('addNode', node);
    }

    broadcastFlowAndComponentsSetUp () {
        if (this.eventHub && this.flow && this.componentsSetup) {
            this.eventHub.emit('Flow and components set up');
        }
    }

    componentsReady () {
        this.componentsSetup = true;
        this.broadcastFlowAndComponentsSetUp();
    }
}
