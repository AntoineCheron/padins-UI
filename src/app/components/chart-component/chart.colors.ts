/**
 * Colors class used for the chart's line and sections.
 *
 * Created by antoine on 13/06/17.
 */

export class Colors {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    nextIndex: number = -1;
    colors: Array<string> = [
        '#F44336',
        '#AB47BC',
        '#2196F3',
        '#26A69A',
        '#FFA726',
        '#A1887F',
        '#00E676',
        '#EC407A',
        '#7986CB',
        '#536DFE',
        '#26A69A',
        '#1DE9B6',
        '#FDD835',
        '#D4E157'
    ];

    /**
     * Returns the hexadecimal value of the next color to use for the next data to add on the chart.
     *
     * @returns {string} the hexadecimal value of the color to use
     */
    public nextColor () {
        // Make sure we never go out of the this.colors array
        this.nextIndex === this.colors.length - 1 ? this.nextIndex = 0 : this.nextIndex++;
        // Return the color
        return this.colors[this.nextIndex];
    }
}
