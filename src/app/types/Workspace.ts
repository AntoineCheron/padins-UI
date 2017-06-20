import {DataService} from '../services/data.service';
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

    constructor (private appData: DataService) {
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

        this.appData.broadcastWorkspaceChanges();
    }

    setNetworkStatus (msg: Object) {
        const n = this.network(msg['graph']);

        n.running = msg['running'];
        n.started = msg['started'];
        n.graph = msg['graph'];
        if (msg.hasOwnProperty('uptime')) { n.uptime = msg['uptime']; }
        n.debug = msg['debug'];

        this.appData.broadcastWorkspaceChanges();
    }

    setNetworkLastStopTime (network: string, time: string) {
        const n = this.network(network);
        n.lastStopTime = time;

        this.appData.broadcastWorkspaceChanges();
    }

    setNetworkLastStartTime (network: string, time: string) {
        const n = this.network(network);
        n.lastStartTime = time;

        this.appData.broadcastWorkspaceChanges();
    }

    networkConnected (network: string) {
        this.connected = true;
        this.setRunningStatus(network, false);

        this.appData.broadcastWorkspaceChanges();
    }

    networkDisconnected (network: string) {
        this.connected = false;
        this.setRunningStatus(network, false);

        this.appData.broadcastWorkspaceChanges();
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
