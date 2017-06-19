/**
 * Created by antoine on 19/06/2017.
 */

import {Component} from '@angular/core';
import {AppService} from '../../services/app.service';

@Component ({
    selector: 'top-bar',
    templateUrl: './topbar.component.html'
})

export class TopbarComponent {

    constructor (private app: AppService) {
    }
}
