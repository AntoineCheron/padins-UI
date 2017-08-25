import {Workspace} from '../types/workspace';
/**
 * Created by antoine on 20/06/17.
 */

export interface WorkspaceListener {
    updateWorkspace (workspace: Workspace): void;
}
