/**
 * Created by antoine on 07/06/17.
 */

import { Component, Input } from '@angular/core';
import { AppService } from './app.service';

@Component({
    selector: 'my-app2',
    template: `
        <h1 style="color:red;">{{message}} - {{service.count}}</h1><br/>
        <button (click)="onClick()">Click me</button><br/>
        <span *ngIf="eventReceived">Event received</span>
    `,
})

export class App2Component {
    @Input() message: string = 'Not set';
    private eventHub: any;
    private eventReceived: boolean = false;

    constructor(private service: AppService) {

    }

    setEventHub(hub: any) {
        this.eventHub = hub;
        // Register your events here

        this.eventHub.on('someEvent', () => {
            this.eventReceived = true;
        });
    }

    onClick() {
        this.service.add();
        this.message = 'Clicked !';
    }
}
