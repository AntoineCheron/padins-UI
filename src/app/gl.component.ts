/**
 * Created by antoine on 07/06/17.
 */

import {
    Component, ComponentFactoryResolver, HostListener, ViewContainerRef,
    ElementRef, ViewChild, NgZone, OnInit
} from '@angular/core';
import { AppComponent } from './app.component';
import { App2Component } from './app2.component';
import { FlowComponent } from './flow-component/flow.component';
declare let GoldenLayout: any;

@Component({
    selector: 'golden-layout',
    template: `<div style="width: 100vw; height: 100vh;" id="layout" #layout><h1>My First Angular 2 App</h1></div>
    <br/><button (click)="sendEvent()">Send event through hub</button>`,
    entryComponents: [AppComponent, App2Component]
})
export class GLComponent implements OnInit {
    @ViewChild('layout') private layout: any;
    private config: Object;

    constructor(
        private el: ElementRef,
        private viewContainer: ViewContainerRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private zone: NgZone) {
        this.config = {
            content: [{
                type: 'row',
                content: [{
                    type: 'component',
                    componentName: 'test1',
                    componentState: {
                        message: 'Top Left'
                    }
                }, {
                    type: 'column',
                    content: [{
                        type: 'component',
                        componentName: 'test2',
                        componentState: {
                            message: 'Top Right'
                        }
                    }, {
                        type: 'component',
                        componentName: 'flow',
                        componentState: {
                            message: 'Bottom Right'
                        }
                    }]
                }]
            }]
        };
    }

    ngOnInit() {
        this.layout = new GoldenLayout(this.config, this.layout.nativeElement);

        this.layout.registerComponent('flow', (container, componentState) => {
            this.zone.run(() => {
                let factory = this.componentFactoryResolver.resolveComponentFactory(FlowComponent);

                let compRef = this.viewContainer.createComponent(factory);
                container.getElement().append(compRef.location.nativeElement);

                container['compRef'] = compRef;
            });
        });

        this.layout.registerComponent('test1', (container, componentState) => {
            this.zone.run(() => {
                let factory = this.componentFactoryResolver.resolveComponentFactory(AppComponent);

                let compRef = this.viewContainer.createComponent(factory);
                compRef.instance.setEventHub(this.layout.eventHub);
                compRef.instance.message = componentState.message;
                container.getElement().append(compRef.location.nativeElement);

                container['compRef'] = compRef;
            });
        });

        this.layout.registerComponent('test2', (container, componentState) => {
            this.zone.run(() => {
                let factory = this.componentFactoryResolver.resolveComponentFactory(App2Component);

                let compRef = this.viewContainer.createComponent(factory);
                compRef.instance.setEventHub(this.layout.eventHub);
                compRef.instance.message = componentState.message;
                container.getElement().append(compRef.location.nativeElement);

                container['compRef'] = compRef;
            });
        });

        this.layout.init();

        this.layout.on('itemDestroyed', item => {
            if (item.container != null) {
                let compRef = item.container['compRef'];
                if (compRef != null) {
                    compRef.destroy();
                }
            }
        });
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (this.layout) {
            this.layout.updateSize();
        }
    }

    sendEvent() {
        if (this.layout) {
            this.layout.eventHub.emit('someEvent');
        }
    }
}
