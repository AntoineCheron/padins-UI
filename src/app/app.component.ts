import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { AppService } from './app.service';

@Component({
  selector: 'my-app',
  template: `
      <h1>{{message}} - {{service.count}}</h1><br/>
      <input [(ngModel)]="inputValue"> Value = {{inputValue}}<br/><br/>
      <button (click)="onClick()">Click me</button><br/>
      <span *ngIf="eventReceived">Event received</span>
  `,
})

export class AppComponent implements OnInit, OnDestroy {
    @Input() message: string = 'Not set';
    private eventHub: any;
    private eventReceived: boolean = false;
    private inputValue: string = 'initial value';

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

    ngOnInit() {
        console.log('OnInit');
    }

    ngOnDestroy() {
        console.log('OnDestroy');
    }
}
