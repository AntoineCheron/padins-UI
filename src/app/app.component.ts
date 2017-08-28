import {Component} from '@angular/core';
import {AppService} from './services/app.service';
import {AppDataService} from './services/app-data.service';

@Component ({
    selector: 'app',
    templateUrl: './app.component.html'
})

/**
 * Created by antoine on 19/06/2017.
 */
export class AppComponent {

    constructor (private appService: AppService, private appData: AppDataService) {

    }
}
