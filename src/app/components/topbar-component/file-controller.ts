import { WorkspaceService } from '../../services/workspace.service';
/**
 * File tab controller for the topbar component.
 *
 * It implements the methods linked to the button in the File tab.
 *
 * Created by antoine on 12/07/17.
 */

export class FileController {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    private workspaceData: WorkspaceService;

    /* -----------------------------------------------------------------------------------------------------------------
                                             CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor (workspaceData: WorkspaceService) {
        this.workspaceData = workspaceData;
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                METHODS CALLED WHEN THE USER CLICKS A BUTTON
     -----------------------------------------------------------------------------------------------------------------*/


    // INFO : For all the show*** methods : send an event, intercepted by the gl-component

    /**
     * Linked to the 'Show graph' button. It post a 'gl-component:show-graph' message on the event hub.
     */
    showGraph () {
        this.workspaceData.eventHub.emit('gl-component:show-graph');
    }

    /**
     * Linked to the 'Show components list' button. It post a 'gl-component:show-components-list' message on
     * the event hub.
     */
    showComponentsList () {
        this.workspaceData.eventHub.emit('gl-component:show-components-list');
    }

    /**
     * Linked to the 'Show file explorer' button. It post a 'gl-component:show-file-explorer' message on the event hub.
     */
    showFileExplorer () {
        this.workspaceData.eventHub.emit('gl-component:show-file-explorer');
    }
}
