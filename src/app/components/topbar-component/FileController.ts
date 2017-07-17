import { WorkspaceService } from '../../services/workspace.service';
/**
 * Created by antoine on 12/07/17.
 */

export class FileController {
    private workspaceData: WorkspaceService;

    constructor (workspaceData: WorkspaceService) {
        this.workspaceData = workspaceData;
    }

    // For all the show*** methods : send an event, intercepted by the gl-component

    showGraph () {
        this.workspaceData.eventHub.emit('gl-component:show-graph');
    }

    showComponentsList () {
        this.workspaceData.eventHub.emit('gl-component:show-components-list');
    }

    showFileExplorer () {
        this.workspaceData.eventHub.emit('gl-component:show-file-explorer');
    }
}
