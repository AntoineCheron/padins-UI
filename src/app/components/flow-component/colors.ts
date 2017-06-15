/**
 * Created by antoine on 09/06/17.
 */

const COLORS: Object = {
    'Raw data': '#FE7F2D',
    'Model': '#F3B700',
    'Processing': '#68C3D4',
    'Simulation': '#260F26',
    'Visualisation': '#71B48D'
};

export class Colors {
    colors: Object = COLORS;

    getColor(component: String) {
        return this.colors[component] !== null ? this.colors[component] : '#333';
    }

}
