import { Injectable } from '@angular/core';
import {Workspace} from '../types/workspace';

/**
 * The AppDataService store the data of the app that need to be accessible from anywhere in the program.
 *
 * These data include the workspace it is connected to. Later on, it should keep track of the connected user.
 *
 * Created by antoine on 09/06/17.
 */
@Injectable()
export class AppDataService {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    workspaces: Array<Object>;
    public currentWorkspace: object;

    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor() {
        this.currentWorkspace = {};
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                        PUBLIC METHODS / GETTERS AND SETTERS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Store the list of workspaces.
     *
     * @param workspaces {Array<Object>} the array containing all the workspaces data
     */
    storeWorkspacesInfo (workspaces: Array<Object>): void {
        this.workspaces = workspaces;
    }

    /**
     * Set the id of the workspace it is connected to.
     *
     * @param id {string} the workspace's id
     */
    setWorkspace(id: string) {
        this.workspaces.forEach((workspace: Object) => {
            if (workspace['uuid'] === id ) {
                this.currentWorkspace['name'] = workspace['name'];
                this.currentWorkspace['uuid'] = workspace['uuid'];
            }
        });
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
