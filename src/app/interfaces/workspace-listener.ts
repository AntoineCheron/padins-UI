import {Workspace} from '../types/workspace';
/**
 * Defines a listener interface in order to subscribe to workspace's changes.
 *
 * Created by antoine on 20/06/17.
 */

export interface WorkspaceListener {

    /**
     * Implement this method to react to workspace's updates.
     * It will be called each time a change occur on the workspace data.
     *
     * @param workspace {Workspace} the new workspace instance
     */
    updateWorkspace (workspace: Workspace): void;
}
