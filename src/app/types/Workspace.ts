import {WorkspaceService} from '../services/workspace.service';
import {Injectable} from '@angular/core';
/**
 * Created by antoine on 20/06/17.
 */

@Injectable()
export class Workspace {
    uuid: string;
    connected: boolean;
    name: string;
    mainNetwork: Network;
    subNetworks: Array<Network> = [];

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

    setRunningStatus (network: string, running: boolean) {
        const n = this.network(network);
        n.running = running;

        this.workspaceData.broadcastWorkspaceChanges();
    }

    setNetworkStatus (msg: Object) {
        const n = this.network(msg['graph']);

        n.running = msg['running'];
        n.started = msg['started'];
        n.graph = msg['graph'];
        if (msg.hasOwnProperty('uptime')) { n.uptime = msg['uptime']; }
        n.debug = msg['debug'];

        this.workspaceData.broadcastWorkspaceChanges();
    }

    setNetworkLastStopTime (network: string, time: string) {
        const n = this.network(network);
        n.lastStopTime = time;

        this.workspaceData.broadcastWorkspaceChanges();
    }

    setNetworkLastStartTime (network: string, time: string) {
        const n = this.network(network);
        n.lastStartTime = time;

        this.workspaceData.broadcastWorkspaceChanges();
    }

    networkConnected (network: string) {
        this.connected = true;
        this.setRunningStatus(network, false);

        this.workspaceData.broadcastWorkspaceChanges();
    }

    networkDisconnected (network: string) {
        this.connected = false;
        this.setRunningStatus(network, false);

        this.workspaceData.broadcastWorkspaceChanges();
    }

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

@Injectable()
export class Network {
    graph: string;
    running: boolean;
    started: boolean;
    uptime: number;
    debug: boolean;
    lastStopTime: string;
    lastStartTime: string;
}
