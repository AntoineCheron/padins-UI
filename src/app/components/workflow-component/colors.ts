/**
 * Returns the color associated to a type of component. This color should be used while displaying blocks on the graph.
 *
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

    /**
     * Get the color associated to the given component.
     *
     * @param component {string} the name of the component
     * @returns {string} the color to use, formatted as hex with the # in the beginning
     */
    getColor(component: string): string {
        return this.colors[component] !== null ? this.colors[component] : '#333';
    }

}
