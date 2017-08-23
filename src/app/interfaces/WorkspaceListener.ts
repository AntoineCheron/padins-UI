import {Workspace} from '../types/Workspace';
/**
 * Created by antoine on 20/06/17.
 */

export interface WorkspaceListener {
    updateWorkspace (workspace: Workspace): void;
}
