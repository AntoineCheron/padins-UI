/**
 * Created by antoine on 17/07/17.
 */

import { Injectable } from '@angular/core';
import { Component } from '../types/Component';
import { Node } from '../types/Node';
import { Flow } from '../types/Flow';
import * as joint from 'jointjs';
import { Edge } from '../types/Edge';
import { Workspace } from '../types/Workspace';
import { WorkspaceListener } from '../Interfaces/WorkspaceListener';
import { AppDataService } from './app-data.service';
import {SocketService} from './socket.service';

@Injectable()
export class WorkspaceService {
    eventHub: any;
    socket: SocketService;
    public flow: Flow;
    public components: Map<string, Component>;

    // JointJS related attributes
    public graph: any;
    public jointCells: Map<string, any>;

    // Utils attributes
    componentsSetup: boolean;
    flowReady: boolean;

    // Workspace object
    public workspace: Workspace;
    // Listeners
    workspaceListeners: Array<WorkspaceListener>;

    // FileExplorer related attributes
    nodes: Array<Object>;

    constructor(private appData: AppDataService) {
        this.clear();
    }

    clear () {
        this.eventHub = undefined;
        this.flow = undefined;
        this.components = new Map();
        this.graph = new joint.dia.Graph;
        this.jointCells = new Map();

        this.componentsSetup = false;
        this.flowReady = false;

        this.workspace = new Workspace(this);
        this.workspaceListeners = [];

        this.nodes = [];
    }

    setEventHub(hub: any) {
        this.eventHub = hub;

        // Subscribe to events
        this.eventHub.on('flow-ready', () => {
            this.flowReady = true;
        });
    }

    setSocket (socket: SocketService) {
        this.socket = socket;
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

    getNode(id: string): Node {
        let res: Node = null;

        if (this.flow) {
            this.flow.nodes.forEach(node => {
                if (node.id === id) {
                    res = node; }
            });
        }

        return res;
    }

    getEdges () {
        return this.flow ? this.flow.edges : null;
    }

    getEdge (id: string): Edge {
        let res: Edge = null;

        this.flow.edges.forEach(edge => {
            if (edge.id === id) {
                res = edge;
            }
        });

        return res;
    }

    addEdge (edge: Edge) {
        if (!this.edgeExist(edge)) {
            this.flow.edges.push(edge);
            this.eventHub.emit('addEdge', edge);
        }
    }

    removeEdge (edge: Edge) {
        if (this.edgeExist(edge)) {
            const i = this.flow.edges.indexOf(edge);
            this.flow.edges.splice(i, 1);

            this.eventHub.emit('removeEdge', edge);
        }
    }

    updateEdge (newEdge: Edge) {
        const oldEdge = this.getEdge(newEdge.id);
        this.flow.updateEdge(oldEdge, newEdge);
        this.eventHub.emit('updateEdge', oldEdge, newEdge);
    }

    edgeExist (edge: Edge): boolean {
        let res = false;

        this.flow.edges.forEach((e: Edge) => {
            if (e.id === edge.id || (e.src['node'] === edge.src['node'] && e.src['port'] === edge.src['port']
                && e.tgt['node'] === edge.tgt['node'] && e.tgt['port'] === edge.tgt['port'])) {
                res = true;
            }
        });

        return res;
    }

    getPreviousNodes (node: Node): Array<Node> {
        const connectedNodes: Array<Node> = [];

        // Retrieve all the previous nodes
        if (this.flow) {
            this.flow.edges.forEach(edge => {
                if (edge.id === edge.tgt['node']) {
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
        if (!this.components.get(component.name)) {
            this.components.set(component.name, component);

            if (this.eventHub) {
                this.eventHub.emit('newComponentAvailable');
            }
        }
    }

    addNode (node: Node) {
        if (node !== null) {
            this.flow.nodes.push(node);

            this.eventHub.emit('addNode', node);
        }
    }

    removeNode (node: Node) {
        if (node !== null) {
            const i = this.flow.nodes.indexOf(node);
            this.flow.nodes.slice(i, 1);

            this.eventHub.emit('removeNode', node);
        }
    }

    async broadcastFlowAndComponentsSetUp () {
        while (!(this.eventHub && this.flow && this.componentsSetup && this.flowReady)) {
            await this.sleep(100);
        }
        this.eventHub.emit('Flow and components set up');
    }

    subscribeToWorkspaceChanges (component: WorkspaceListener) {
        this.workspaceListeners.push(component);
    }

    broadcastWorkspaceChanges () {
        this.workspaceListeners.forEach((component: WorkspaceListener) => {
            component.updateWorkspace(this.workspace);
        });
    }

    componentsReady () {
        this.componentsSetup = true;
    }

    setWorkspace(id: string) {
        if (id === this.appData.currentWorkspace['uuid']) {
            this.workspace = new Workspace(this);
            this.workspace.uuid = this.appData.currentWorkspace['uuid'];
            this.workspace.name = this.appData.currentWorkspace['name'];
        } else {
            this.workspace.uuid = id;
        }
    }

    /* ----------------------------------------------------------------------------
                        FILE EXPLORER DATA RELATED METHODS
     ---------------------------------------------------------------------------- */

    updateFileExplorerNodes (payload: Object) {
        // TODO : only add missing elements and remove elements that are no longer in the tree
        if (payload.hasOwnProperty('nodes')) { this.nodes = payload['nodes']; }
    }

    /* ----------------------------------------------------------------------------
                            METHODS TO CREATE SLEEP
     ---------------------------------------------------------------------------- */

    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
