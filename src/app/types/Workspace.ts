/**
 * Created by antoine on 20/06/17.
 */

export class Workspace {
    connected: boolean;
    name: string;
    network: Network;
}

export class Network {
    status: string;
    running: boolean;
}
