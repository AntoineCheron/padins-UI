/**
 * Created by antoine on 19/06/2017.
 */

import {Component} from '@angular/core';
import {DataService} from '../../services/data.service';

@Component ({
    selector: 'top-bar',
    templateUrl: './topbar.component.html'
})

export class TopbarComponent {

    constructor (private appData: DataService) {
    }
}
