import {WorkspaceService} from '../services/workspace.service';
import {Injectable} from '@angular/core';
/**
 * A workspace is the same concept as the workspace in an IDE.So one workspace correspond to a project as a user
 * point of view. It has a directory, and specifically to padins, it has a workflow. This workflow is the flow.json file
 * in the root of the folder. Take a look the Flow.ts file to know more about it.
 *
 * In this project, that is the client side of padins, the workspace class store the network connexion information,
 * the running state and the id and name of the project.
 *
 * Created by antoine on 20/06/17.
 */

@Injectable()
export class Workspace {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    // Project related attributes
    uuid: string;
    name: string;

    // Server connexion related attributes
    connected: boolean;

    // Workflow networks related attributes. Workflow network === the whole flow or groups
    mainNetwork: Network;
    subNetworks: Array<Network> = [];

    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor (private workspaceData: WorkspaceService) {
        this.uuid = null;
        this.connected = false;
        this.name = '';
        this.mainNetwork = {
            running: false,
            started: false,
            uptime: 0,
            graph: '',
            debug: false,
            lastStopTime: '',
            lastStartTime: '',
        };
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                            PUBLIC NETWORK RELATED METHODS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Set the running status of the given network.
     *
     * @param network {String} the id of the targeted network. A network can be the Flow or a Group
     * @param running {Boolean} the running state
     */
    setRunningStatus (network: string, running: boolean): void {
        const n = this.network(network);
        n.running = running;

        this.workspaceData.broadcastWorkspaceChanges();
    }

    /**
     * Set the network status information from the received message.
     *
     * @param msg {Object} the network:status message received over the socket
     */
    setNetworkStatus (msg: Object): void {
        // Retrieve the proper network instance
        const n = this.network(msg['graph']);

        // Set the values of the network
        n.running = msg['running'];
        n.started = msg['started'];
        n.graph = msg['graph'];
        if (msg.hasOwnProperty('uptime')) { n.uptime = msg['uptime']; }
        n.debug = msg['debug'];

        // Broadcast the changes in order to let the components adapt themselves to the modifications
        this.workspaceData.broadcastWorkspaceChanges();
    }

    /**
     * Set the last stop time information of the given network.
     *
     * @param network {String} the id of the targeted network
     * @param time {String} last stop time as a timestamp
     */
    setNetworkLastStopTime (network: string, time: string): void {
        const n = this.network(network);
        n.lastStopTime = time;

        this.workspaceData.broadcastWorkspaceChanges();
    }

    /**
     * Set the last start time information of the given network.
     *
     * @param network {String} the id of the targeted network
     * @param time {String} last start time as a timestamp
     */
    setNetworkLastStartTime (network: string, time: string): void {
        const n = this.network(network);
        n.lastStartTime = time;

        this.workspaceData.broadcastWorkspaceChanges();
    }

    /**
     * Set the connexion state of the given network to True
     *
     * @param network {String} the id of the targeted network
     */
    networkConnected (network: string): void {
        this.connected = true;
        this.setRunningStatus(network, false);

        this.workspaceData.broadcastWorkspaceChanges();
    }

    /**
     * Set the connexion state of the given network to False
     *
     * @param network {String} the id of the targeted network
     */
    networkDisconnected (network: string): void {
        this.connected = false;
        this.setRunningStatus(network, false);

        this.workspaceData.broadcastWorkspaceChanges();
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                          PRIVATE NETWORK RELATED METHODS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Retrieve the Network instance from its id.
     *
     * @param id {String} the id of the targeted network
     * @returns {Network} the Network instance with the given id
     */
    private network (id: string): Network {
        let res: Network = null;

        if (id === 'main' || id === this.uuid) {
            res = this.mainNetwork;
        } else {
            this.subNetworks.forEach((n: Network) => {
                if (n.graph === id) { res = n; }
            });
        }

        return res;
    }
}

/**
 * Class Network that stores the workspace's network information.
 */
@Injectable()
export class Network {
    graph: string; // The id of the related graph
    running: boolean; // Is running ?
    started: boolean; // Is started ?
    uptime: number; // How long the graph has been running
    debug: boolean; // Is in debug mode ?
    lastStopTime: string; // As a timestamp
    lastStartTime: string; // As a timestamp
}
