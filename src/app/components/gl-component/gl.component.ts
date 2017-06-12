/**
 * Created by antoine on 07/06/17.
 */

import {
    Component, ComponentFactoryResolver, HostListener, ViewContainerRef,
    ElementRef, ViewChild, NgZone, OnInit
} from '@angular/core';
import { AppComponent } from '../../app.component';
import { FlowComponent } from '../flow-component/flow.component';
import { FlowNodesListComponent} from '../flow-nodes-list-component/flow-nodes-list.component';
import { CodeEditorComponent } from '../code-editor-component/code-editor.component';
declare let GoldenLayout: any;
declare var $: JQueryStatic;

@Component({
    selector: 'golden-layout',
    templateUrl: './template.html',
    entryComponents: [AppComponent, FlowComponent, FlowNodesListComponent, CodeEditorComponent]
})
export class GLComponent implements OnInit {
    @ViewChild('layout') private layout: any;
    private config: Object;

    constructor(private el: ElementRef, private viewContainer: ViewContainerRef,
                private componentFactoryResolver: ComponentFactoryResolver, private zone: NgZone) {

        this.config = {
            content: [{
                type: 'row',
                content: [{
                    type: 'row',
                    content: [{
                        type: 'component',
                        componentName: 'flow-nodes-list'
                    }, {
                        type: 'component',
                        componentName: 'code-editor',
                        componentState: {
                            message: 'Middle'
                        }
                    }]
                }, {
                    type: 'column',
                    content: [{
                        type: 'component',
                        componentName: 'test1',
                        componentState: {
                            message: 'Top Right'
                        }
                    }, {
                        type: 'component',
                        componentName: 'flow'
                    }]
                }]
            }]
        };
    }

    ngOnInit() {
        this.layout = new GoldenLayout(this.config, this.layout.nativeElement);

        this.registerLayoutComponent('flow', FlowComponent);

        this.registerLayoutComponent('flow-nodes-list', FlowNodesListComponent);

        this.registerLayoutComponent('test1', AppComponent);

        this.registerLayoutComponent('code-editor', CodeEditorComponent);

        this.layout.init();

        this.layout.on('itemDestroyed', item => {
            if (item.container != null) {
                let compRef = item.container['compRef'];
                if (compRef != null) {
                    compRef.destroy();
                }
            }
        });
    } // End onInit

    registerLayoutComponent (name: String, component: any) {
        if (this.layout) {
            this.layout.registerComponent(name, (container: any) => {
                this.zone.run(() => {
                    let factory = this.componentFactoryResolver.resolveComponentFactory(component);

                    let compRef = this.viewContainer.createComponent(factory);
                    compRef.instance.setEventHub(this.layout.eventHub);
                    container.getElement().append(compRef.location.nativeElement);

                    container['compRef'] = compRef;

                    if (name === 'flow') {
                        // Trigger a resize event each time the container size change, in order to resize the flow automatically
                        container.on( 'resize', function() {
                            window.dispatchEvent(new Event('resize'));
                        });
                    }
                });
            });
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        if (this.layout) {
            this.layout.updateSize();
            this.layout.eventHub.emit('resize');
        }
    }
}
