/**
 * The workspace service manage the workspace's data. Only one instance of the service can exists. It is used in order
 * to remove the maximum amount of data in the view components, and centralize these data in one place, accessible from any
 * view component.
 *
 * A workspace is the same concept as the workspace in an IDE. So one workspace correspond to a project as a user
 * point of view. It has a directory, and specifically to padins, it has a workflow. This workflow is the flow.json file
 * in the root of the folder. Take a look the Flow.ts file to know more about it.
 *
 * In this project, that is the client side of padins, the workspace class store the network connexion information,
 * the running state and the id and name of the project.
 *
 * Created by antoine on 17/07/17.
 */

import { Injectable } from '@angular/core';
import { Component } from '../types/component';
import { Node } from '../types/node';
import { Flow } from '../types/flow';
import * as joint from 'jointjs';
import { Edge } from '../types/edge';
import { Workspace } from '../types/workspace';
import { WorkspaceListener } from '../interfaces/workspace-listener';
import { AppDataService } from './app-data.service';
import {SocketService} from './socket.service';

@Injectable()
export class WorkspaceService {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

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

    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor(private appData: AppDataService) {
        this.clear();
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                        PUBLIC METHODS / GETTERS AND SETTERS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Clear all the data of the service. Usually used to switch to another workspace.
     */
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

    /**
     * Set the eventhub instance.
     * The eventhub is a GoldenLayout component used as a hub to centralize the communication between the views.
     *
     * @param hub {any} the new hub to use
     */
    setEventHub(hub: any) {
        this.eventHub = hub;

        // Subscribe to events
        this.eventHub.on('flow-ready', () => {
            this.flowReady = true;
        });
    }

    /**
     * Set the socket to use in order to communicate with the server.
     *
     * @param socket {SocketService} the new socket
     */
    setSocket (socket: SocketService) {
        this.socket = socket;
    }

    /**
     * Set the flow instance.
     * The flow is the object used to describe the simulation workflow.
     *
     * @param flow {Flow} the new flow instance.
     */
    setFlow (flow: Flow) {
        this.flow = flow;

        this.broadcastFlowAndComponentsSetUp();
    }

    /**
     * To inform this that the components have all been downloaded from the server.
     */
    componentsReady () {
        this.componentsSetup = true;
    }

    /**
     * Set the id of the workspace to use by this service.
     *
     * @param id {string} id of the connected workspace
     */
    setWorkspace(id: string) {
        if (id === this.appData.currentWorkspace['uuid']) {
            this.workspace = new Workspace(this);
            this.workspace.uuid = this.appData.currentWorkspace['uuid'];
            this.workspace.name = this.appData.currentWorkspace['name'];
        } else {
            this.workspace.uuid = id;
        }
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                    WORKFLOW MANIPULATIONS RELATED METHODS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Get the components that can be used to describe the workflow.
     *
     * @returns {Map<string, Component>} the components as a map(name -> component)
     */
    getComponents (): Map<string, Component> {
        return this.components;
    }

    /**
     * Returns the set of nodes that are on the workflow.
     *
     * @returns {Array<Node>} all the nodes on the workflow.
     */
    getNodes () {
        return this.flow ? this.flow.nodes : null;
    }

    /**
     * Returns a Node from its id.
     *
     * @param id {string} the id of the node
     * @returns {Node} the Node with the given id, null if no Node exists with this id
     */
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

    /**
     * Returns the set of edges that are on the workflow.
     *
     * @returns {Array<Edge>} all the edges on the workflow
     */
    getEdges () {
        return this.flow ? this.flow.edges : null;
    }

    /**
     * Returns an Edge from its id
     * @param id {string} the id of the Edge
     * @returns {Edge} the Ede with the given id, null if no Edge exists with this id
     */
    getEdge (id: string): Edge {
        let res: Edge = null;

        this.flow.edges.forEach(edge => {
            if (edge.id === id) {
                res = edge;
            }
        });

        return res;
    }

    /**
     * Add an Edge on the workflow.
     *
     * @param edge {Edge} the edge to add
     */
    addEdge (edge: Edge) {
        if (!this.edgeExist(edge)) {
            this.flow.edges.push(edge);
            this.eventHub.emit('addEdge', edge);
        }
    }

    /**
     * Remove an Edge from the workflow.
     *
     * @param edge {Edge} the edge to remove
     */
    removeEdge (edge: Edge) {
        if (this.edgeExist(edge)) {
            const i = this.flow.edges.indexOf(edge);
            this.flow.edges.splice(i, 1);

            this.eventHub.emit('removeEdge', edge);
        }
    }

    /**
     * Update the data of an Edge. The Edge is identified with its id. All the other data can be changed.
     *
     * @param newEdge {Edge} the new version of the edge
     */
    updateEdge (newEdge: Edge) {
        const oldEdge = this.getEdge(newEdge.id);
        this.flow.updateEdge(oldEdge, newEdge);
        this.eventHub.emit('updateEdge', oldEdge, newEdge);
    }

    /**
     * Is the given edge existing on the workflow ?
     * @param edge {Edge} the edge to check
     * @returns {boolean} true if the edge is on the workflow
     */
    edgeExist (edge: Edge): boolean {
        let res = false;

        // Look for an edge with either the same id or the same content
        this.flow.edges.forEach((e: Edge) => {
            if (e.id === edge.id || (e.src['node'] === edge.src['node'] && e.src['port'] === edge.src['port']
                && e.tgt['node'] === edge.tgt['node'] && e.tgt['port'] === edge.tgt['port'])) {
                res = true;
            }
        });

        return res;
    }

    /**
     * Returns the set of nodes that are the dependencies of the given node. Those dependencies are the nodes
     * that are directly connected on the inports of the given node.
     *
     * @param node {Node} the node to retrieve dependencies from
     * @returns {Array<Node>}
     */
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

    /**
     * Add a component to the list of available components.
     *
     * @param component {Component} the new component to add
     */
    addComponent (component: Component) {
        if (!this.components.get(component.name)) {
            this.components.set(component.name, component);

            if (this.eventHub) {
                this.eventHub.emit('newComponentAvailable');
            }
        }
    }

    /**
     * Add a node on the workflow.
     *
     * @param node {Node} the node to add
     */
    addNode (node: Node) {
        if (node !== null) {
            this.flow.nodes.push(node);

            this.eventHub.emit('addNode', node);
        }
    }

    /**
     * Remove an existing node from the workflow.
     *
     * @param node {Node} the node to remove
     */
    removeNode (node: Node) {
        if (node !== null) {
            const i = this.flow.nodes.indexOf(node);
            this.flow.nodes.slice(i, 1);

            this.eventHub.emit('removeNode', node);
        }
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                    METHODS TO COMMUNICATE ACROSS THE APP
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * Broadcast a "flow and components set up" message to all the view components.
     *
     * @returns {Promise<void>} -> unknown promise
     */
    async broadcastFlowAndComponentsSetUp () {
        while (!(this.eventHub && this.flow && this.componentsSetup && this.flowReady)) {
            await this.sleep(100);
        }
        this.eventHub.emit('Flow and components set up');
    }

    /**
     * Add the given component to the list of components to notify when a change occurs on the workspace's data.
     *
     * @param component {WorkspaceListener} the component to add to the lit
     */
    subscribeToWorkspaceChanges (component: WorkspaceListener) {
        this.workspaceListeners.push(component);
    }

    /**
     * Broadcast the changed that occur on the workspace.
     */
    broadcastWorkspaceChanges () {
        this.workspaceListeners.forEach((component: WorkspaceListener) => {
            component.updateWorkspace(this.workspace);
        });
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                    FILE EXPLORER DATA RELATED METHODS
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * Update the content of the file explorer with the given data
     *
     * @param payload {Object} payload received from the server message
     */
    updateFileExplorerNodes (payload: Object) {
        // TODO : only add missing elements and remove elements that are no longer in the tree
        if (payload.hasOwnProperty('nodes')) { this.nodes = payload['nodes']; }
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                        METHODS TO CREATE SLEEP
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * Pause the execution of a function for the given amount of milliseconds.
     *
     * @param ms {number} the duration of the sleep, in milliseconds
     * @returns {Promise<T>}
     */
    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
