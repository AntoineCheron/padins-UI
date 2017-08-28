/**
 * This component implements Golden Layout, the main component above the topbar on the workspace view.
 * [Golden Layout](http://golden-layout.com/) is a multi-screen layout manager for webapps. A multi-screen layout
 * manager is a component that is composed of windows, similar to OS's desktop windows. Those windows can be
 * redimensionned and moved all over the layout manager. Each window act as a container for any HTML code.
 *
 * On the developer perspective, the other components are developed without any constraint.
 *
 * In this app, we use Golden Layout to maximize the view's customization. So that the user can create her own working
 * environnement.
 *
 * This Angular Component implements all the configuration of the Golden Layout component and imports all the
 * components to use into it.
 *
 * Created by antoine on 07/06/17.
 */

import {
    Component, ComponentFactoryResolver, HostListener, ViewContainerRef,
    ElementRef, ViewChild, NgZone, OnInit
} from '@angular/core';
import { WorkflowComponent } from '../workflow-component/workflow.component';
import { FlowNodesListComponent} from '../flow-nodes-list-component/flow-nodes-list.component';
import { CodeEditorComponent } from '../code-editor-component/code-editor.component';
import { ChartComponent } from '../chart-component/chart.component';
import { FileExplorerComponent } from '../file-explorer-component/file-explorer.component';
import { DataImporterComponent } from '../data-importer-component/data-importer.component';
import { WorkspaceService } from '../../services/workspace.service';
import * as GoldenLayout from 'golden-layout';
import {Config, ItemConfig} from 'golden-layout';
import {Node} from '../../types/node';
declare var $: JQueryStatic;

@Component({
    selector: 'golden-layout',
    templateUrl: './gl.component.html',
    entryComponents: [WorkflowComponent, FlowNodesListComponent, CodeEditorComponent, ChartComponent, FileExplorerComponent,
                        DataImporterComponent]
})
export class GLComponent implements OnInit {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    @ViewChild('layout') private layout: any;
    private config: Config;
    private nodeComponentMap: Map<string, string>;

    private rootItem: any;
    private newElementsContainer: any;
    private newElementsContainerItem: ItemConfig;

    // Constants
    private readonly COMPONENTS_LIST_WINDOW_ID = 'flow-nodes-list';
    private readonly FILE_EXPLORER_WINDOW_ID = 'files';
    private readonly GRAPH_WINDOW_ID = 'workflow';

    /* -----------------------------------------------------------------------------------------------------------------
                                             CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor(private el: ElementRef, private viewContainer: ViewContainerRef,
                private componentFactoryResolver: ComponentFactoryResolver, private zone: NgZone,
                private workspaceData: WorkspaceService) {

        // Define a container to add all the elements that will be opened when the user double-click a block on
        // the workflow.
        this.newElementsContainerItem = {
            type: 'stack',
            id: 'new-elements-container',
            width: 0,
            content: [],
        };

        // Fulfill the nodeComponentMap that map graph components/blocks to the UI component containing
        // their detailed view.
        this.nodeComponentMap = new Map();
        this.nodeComponentMap.set('Raw data', 'data-importer');
        this.nodeComponentMap.set('Model', '');
        this.nodeComponentMap.set('Processing', 'code-editor');
        this.nodeComponentMap.set('Simulation', 'code-editor');
        this.nodeComponentMap.set('Visualisation', 'chart');

        // Create the base layout of the Golden Layout component.
        this.config = {
            content: [{
                type: 'row',
                id: 'rootEl',
                content: [
                    {
                        type: 'stack',
                        id: 'main-stack',
                        width: 30,
                        content: [
                            {
                                type: 'component',
                                componentName: 'flow-nodes-list',
                                id: this.COMPONENTS_LIST_WINDOW_ID,
                                title: 'List of components'
                            },
                            {
                                type: 'component',
                                componentName: 'file-explorer',
                                id: this.FILE_EXPLORER_WINDOW_ID,
                                title: 'Files'
                            },
                        ]
                    },
                    {
                        type: 'component',
                        componentName: 'workflow',
                        id: this.GRAPH_WINDOW_ID,
                        title: 'Graph'
                    },
                ]
            }]
        };
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                OnInit INTERFACE METHODS IMPLEMENTATION
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * On init, create the GoldenLayout instance, retrieve and share the event hub, register the UI components that
     * will be available from Golden Layout and initialize the layout to display it.
     *
     * @returns {Promise<void>} ignored promise.
     */
    async ngOnInit() {
        this.layout = new GoldenLayout(this.config, this.layout.nativeElement);

        // Give the eventHub to the addData service
        this.workspaceData.setEventHub(this.layout.eventHub);

        // Register the components that will be available for use in this GL component
        this.registerLayoutComponent('workflow', WorkflowComponent);
        this.registerLayoutComponent('flow-nodes-list', FlowNodesListComponent);
        this.registerLayoutComponent('chart', ChartComponent);
        this.registerLayoutComponent('code-editor', CodeEditorComponent);
        this.registerLayoutComponent('file-explorer', FileExplorerComponent);
        this.registerLayoutComponent('data-importer', DataImporterComponent);

        // Short sleep to avoid this.layout.root === null
        await this.sleep(100);
        this.layout.init();
        // Store the root item and the new-elements-container
        this.rootItem = this.layout.root.contentItems[0];
        this.newElementsContainer = this.layout.root.getItemsById('new-elements-container')[0];

        this.layout.on('itemDestroyed', (item: any) => {
            if (item.container != null) {
                let compRef = item.container['compRef'];
                if (compRef != null) {
                    compRef.destroy();
                }
            }
        });

        this.configureEventHubListeners();
    } // End onInit

    /* -----------------------------------------------------------------------------------------------------------------
                                            PUBLIC METHODS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Open the detailed view for the given Node. If already opened, will show it.
     *
     * @param node {Node} the node to display the detailed view for.
     */
    openWindow (node: Node) {
        // First : verify if the window associated with the node is open.
        // If so, it will focus this window,
        // If not, create it
        if (this.layout.root.getItemsById(node.id)[0]) {
            const item = this.layout.root.getItemsById(node.id)[0];
            item.parent.setActiveContentItem(item);
        } else {
            const newItem = {
                type: 'component',
                id: node.id,
                componentName: this.nodeComponentMap.get(node.component),
                componentState: {},
                title: node.getName() || node.component,
            };

            // Add the node object if it has been passed as a param
            if (node && node !== null) {
                newItem['componentState'] = { node: node };
            }

            // Make sur the new-elements-container is in the layout
            if (!this.layout.root.getItemsById('new-elements-container')[0]) {
                this.addToRoot(this.newElementsContainerItem);
                this.newElementsContainer = this.layout.root.getItemsById('new-elements-container')[0];
            }

            this.newElementsContainer.addChild(newItem);

            // Set the other elements' width to be sure it is comfortable for the user
            if (this.newElementsContainer.contentItems.length === 1) {
                this.newElementsContainer.config['width'] = 80;
                this.layout.updateSize();
            }
        }
    }

    /**
     * Close the given node's detailed view.
     *
     * @param node {Node} the node to close the detailed view for.
     */
    closeWindow (node: Node) {
        const item = this.getGLItem(node);
        if (item !== null) {
            item.remove();
        }
    }

    /**
     * Update the label of the tab of the given node's detailed view to reflect the node's name.
     *
     * @param node {Node} the node to use
     */
    updateTabName (node: Node) {
        const item = this.getGLItem(node);
        if (item !== null) {
            item.setTitle(node.getName());
        }
    }

    /**
     * Returns the detailed view's of the given node. This detailed view is a Golden Layout's item.
     *
     * [Item's documentation](http://golden-layout.com/docs/Item.html)
     *
     * @param node
     * @returns {any}
     */
    getGLItem (node: Node): any {
        if (this.layout.root.getItemsById(node.id)[0]) {
            const item = this.layout.root.getItemsById(node.id)[0];
            return item;
        } else {
            return null;
        }
    }

    /**
     * Show the graph window. Reopen it if closed.
     */
    showGraph () {
        this.showWindow(this.GRAPH_WINDOW_ID, 'workflow', 'Graph', true);
    }

    /**
     * Show the window containing the list of components that can be used to create the workflow. Reopen it if closed.
     */
    showComponentsList () {
        this.showWindow(this.COMPONENTS_LIST_WINDOW_ID, 'flow-nodes-list', 'List of components', false);
    }

    /**
     * Show the graph window. Reopen it if closed.
     */
    showFileExplorer () {
        this.showWindow(this.FILE_EXPLORER_WINDOW_ID, 'file-explorer', 'Files', false);
    }

    /**
     * Show the window of the component with the given id. If closed, reopen it with the given component,
     * tab's title and, display it either in the root layout or in the main-stack.
     *
     * @param id {string} id of the window
     * @param componentName {string} name of the component to use if it's needed to recreate the window
     * @param title {string} title to use for the tab if it's needed to recreate the window
     * @param addToRoot {boolean} use only if it's needed to recreate the window. In this case, if true, add the
     * window in the root element, else add it into the main stack created in the constructor.
     */
    showWindow (id: string, componentName: string, title: string, addToRoot: boolean): void {
        if (this.layout.root.getItemsById(id)[0]) {
            // If the window is open we show it
            const item = this.layout.root.getItemsById(id)[0];
            item.parent.setActiveContentItem(item);
        } else {
            // Otherwise we create it
            const newItem = {
                type: 'component',
                id: id,
                componentName: componentName,
                componentState: {},
                title: title,
            };

            // and add it onto the graph
            if (addToRoot) {
                this.addToRoot(newItem);
            } else {
                this.addToMainStack(newItem);
            }
        }
    }

    /**
     * Add the given item into the root element of the GL's layout. Reconfigure the root element if needed.
     *
     * @param item {object} the new item to add
     */
    addToRoot (item: object) {
        if (this.layout.root.getItemsById('rootEl')[0]) {
            const root = this.layout.root.getItemsById('rootEl')[0];
            root.addChild(item);
        } else {
            this.reconfigureLayout();
            this.addToRoot(item);
        }

        this.layout.updateSize();
    }

    /**
     * Reconfigure the layout of the Golden Layout element if the rootEl have been deleted and replaced with a single
     * element.
     */
    reconfigureLayout () {
        // Retrieve the first childItem of the root element
        const actualRootEl = this.layout.root.contentItems[0];
        // If this element is not a row, we add all its child into a row
        if (!actualRootEl) {
            // Create the row that will server as root element
            const rootEl = { type: 'row', id: 'rootEl', content: []};
            this.layout.root.addChild(rootEl);
        } else if (!actualRootEl.isRow) {
            // Create the row
            const rootEl = { type: 'row', id: 'rootEl', content: []};
            // Replace the actualRootEl with the new one we just created
            this.layout.root.replaceChild(actualRootEl, rootEl);
            // Add the existing elements into the content of rootEl
            this.layout.root.contentItems[0].addChild(actualRootEl);
        } else {
            actualRootEl.id = 'rootEl';
        }
    }

    /**
     * Add the given item into the main stack element of the GL's layout. Reconfigure the layout if needed.
     *
     * @param item {object} the item to add
     */
    addToMainStack (item: object) {
        if (this.layout.root.getItemsById('main-stack')[0]) {
            const mainStack = this.layout.root.getItemsById('main-stack')[0];
            mainStack.addChild(item);
        } else if (this.layout.root.getItemsById('rootEl').length === 0) {
            this.reconfigureLayout();
            this.layout.root.contentItems[0].addChild({type: 'stack', id: 'main-stack', width: 30, content: [] });
            const mainStack = this.layout.root.getItemsById('main-stack')[0];
            mainStack.addChild(item);
        } else {
            this.addToRoot(item);
        }
    }

    /**
     * Register the given component as a GolenLayout component.
     *
     * @param name {string} the name of the component. Can be use to query components and create new windows.
     * @param component {any}
     */
    registerLayoutComponent (name: string, component: any) {
        if (this.layout) {
            this.layout.registerComponent(name, (container: any, componentState: Object) => {
                this.zone.run(() => {
                    let factory = this.componentFactoryResolver.resolveComponentFactory(component);

                    let compRef = this.viewContainer.createComponent(factory);

                    window['a'] = compRef.instance;
                    if (compRef.instance['__proto__'].hasOwnProperty('setEventHub')) {
                        compRef.instance['setEventHub'](this.layout.eventHub);
                    }

                    if (compRef.instance['__proto__'].hasOwnProperty('setNodeRef') &&
                        componentState && componentState.hasOwnProperty('node')) {
                        compRef.instance['setNodeRef'](componentState['node']);
                    }

                    container.getElement().append(compRef.location.nativeElement);

                    container['compRef'] = compRef;

                    // Trigger a resize event each time the container size change, in order to resize the workflow automatically
                    container.on( 'resize', () => {
                        this.layout.eventHub.emit('resize');
                    });
                    // Trigger a resize event each time the container shows, in order to resize the workflow automatically
                    container.on( 'show', async () => {
                        await this.sleep(10);
                        this.layout.eventHub.emit('resize');
                    });
                });
            });
        }
    }

    /**
     * Subscribe to useful events and bind events to the proper method calls.
     *
     * It subscribes to :
     * - openWindow : when the user wants to display a block's detailed view
     * - closeWindow : when the user wants to close a block's detailed view
     * - blockNameChanged : when the user change a block's name
     * - gl-component:show-graph : to display the graph's window
     * - gl-component:show-components-list : to display the components list's window
     * - gl-component:show-file-explorer : to display the file explorer's window
     */
    configureEventHubListeners () {
        this.layout.eventHub.on('openWindow', (node: Node) => {
            this.openWindow(node);
        });

        this.layout.eventHub.on('closeWindow', (node: Node) => {
            this.closeWindow(node);
        });

        this.layout.eventHub.on('blockNameChanged', (node: Node) => {
            this.updateTabName(node);
        });

        this.layout.eventHub.on('gl-component:show-graph', () => {
            this.showGraph();
        });

        this.layout.eventHub.on('gl-component:show-components-list', () => {
            this.showComponentsList();
        });

        this.layout.eventHub.on('gl-component:show-file-explorer', () => {
            this.showFileExplorer();
        });
    }

    /**
     * Add a HostListener on the window:resize event to update the layout size when the user resize the browser
     * window.
     */
    @HostListener('window:resize', ['$event'])
    onResize() {
        if (this.layout) {
            this.layout.updateSize();
            this.layout.eventHub.emit('resize');
        }
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                METHODS TO CREATE SLEEP
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * Pause the execution for the given amount of milliseconds.
     *
     * @param ms {number} the amount of milliseconds to pause the execution.
     * @returns {Promise<T>} ignored promise
     */
    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
