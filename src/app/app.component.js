"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var app_service_1 = require("./app.service");
var AppComponent = (function () {
    function AppComponent(service) {
        this.service = service;
        this.message = 'Not set';
        this.eventReceived = false;
        this.inputValue = 'initial value';
    }
    AppComponent.prototype.setEventHub = function (hub) {
        var _this = this;
        this.eventHub = hub;
        // Register your events here
        this.eventHub.on('someEvent', function () {
            _this.eventReceived = true;
        });
    };
    AppComponent.prototype.onClick = function () {
        this.service.add();
        this.message = 'Clicked !';
    };
    AppComponent.prototype.ngOnInit = function () {
        console.log('OnInit');
    };
    AppComponent.prototype.ngOnDestroy = function () {
        console.log('OnDestroy');
    };
    return AppComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], AppComponent.prototype, "message", void 0);
AppComponent = __decorate([
    core_1.Component({
        selector: 'my-app',
        template: "\n      <h1>{{message}} - {{service.count}}</h1><br/>\n      <input [(ngModel)]=\"inputValue\"> Value = {{inputValue}}<br/><br/>\n      <button (click)=\"onClick()\">Click me</button><br/>\n      <span *ngIf=\"eventReceived\">Event received</span>\n  ",
    }),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map