/**
 * Created by antoine on 23/06/17.
 */

import * as joint from 'jointjs';
import {V} from 'jointjs';
import * as _ from 'underscore';

export class HtmlElementView extends joint.dia.ElementView {
    template: string = `
                <div class="component">
                <button class="delete">x</button>
                <label></label>
                </div>`;
    $box: any;
    paper: any;

    constructor() {
        super();
    }


    initialize() {
        _.bindAll(this, 'updateBox');
        joint.dia.ElementView.prototype['initialize'].apply(this, arguments);

        this.$box = $(_.template(this.template)());
        this.$box[0].id = this.model.get('node').id;
        this.$box[0].classList.add(this.model.get('node').component.replace(' ', ''));

        // Handle the click on the delete button
        this.$box.find('.delete').on('click', _.bind(this.model.get('that').removedNode, this.model.get('that')));
        // Update the box position whenever the underlying model changes.
        this.model.on('change', this.updateBox, this);
        // Remove the box when the model gets removed from the graph.
        this.model.on('remove', this.removeBox, this);

        this.updateBox();

        this.listenTo(this.model, 'process:ports', this.update);
        joint.dia.ElementView.prototype['initialize'].apply(this, arguments); // TODO : delete line
    }

    render() {
        joint.dia.ElementView.prototype.render.apply(this, arguments);
        this.paper.$el.prepend(this.$box);
        this.updateBox();
        return this;
    }

    renderPorts() {
        const $inPorts = this.$('.inPorts').empty();
        const $outPorts = this.$('.outPorts').empty();

        const portTemplate = _.template(this.model['portMarkup']);

        _.each(_.filter(this.model['ports'], (p) => {
            return p['type'] === 'in';
        }), (port, index) => {

            $inPorts.append(V(portTemplate({id: index, port: port})).node);
        });
        _.each(_.filter(this.model['ports'], function (p) {
            return p['type'] === 'out';
        }), function (port, index) {

            $outPorts.append(V(portTemplate({id: index, port: port})).node);
        });
    }

    update () {

        // First render ports so that `attrs` can be applied to those newly created DOM elements
        // in `ElementView.prototype.update()`.
        this.renderPorts();
        joint.dia.ElementView.prototype.update.apply(this, arguments);
    }

    updateBox() {
        // Set the position and dimension of the box so that it covers the JointJS element.
        const bbox = this.model.getBBox();
        // Example of updating the HTML with a data stored in the cell model.
        this.$box.find('label').text(this.model.get('node').component);
        this.$box.css({
            width: bbox.width,
            height: bbox.height,
            left: bbox.x,
            top: bbox.y
        });
    }

    removeBox(evt) {
        this.$box.remove();
    }
}
