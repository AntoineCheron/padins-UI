/**
 * Created by antoine on 09/06/17.
 */

import { Injectable } from '@angular/core';
import {Workspace} from '../types/Workspace';

@Injectable()
export class AppDataService {

    // Workspace object
    workspaces: Array<Object>;
    public currentWorkspace: object;

    constructor() {
        this.currentWorkspace = {};
    }

    storeWorkspacesInfo (workspaces: Array<Object>): void {
        this.workspaces = workspaces;
    }

    setWorkspace(id: string) {
        this.workspaces.forEach((workspace: Object) => {
            if (workspace['uuid'] === id ) {
                this.currentWorkspace['name'] = workspace['name'];
                this.currentWorkspace['uuid'] = workspace['uuid'];
            }
        });
    }

    /* ----------------------------------------------------------------------------
                        METHODS TO CREATE SLEEP
     ---------------------------------------------------------------------------- */

    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
