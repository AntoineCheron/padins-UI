import * as joint from 'jointjs';
import {V} from 'jointjs';
import * as _ from 'underscore';
import { Node } from '../../types/node';

/**
 * The custom HTML template for the shape of the blocks on the graph.
 *
 * It looks like a very simple rectangle with border radius and the border is colored depending on the kind of component
 * it is. This color is defined in ./colors.ts
 *
 * The class contains only a static method because it only configure a global element, without the need for extra
 * methods.
 *
 * Created by antoine on 10/07/17.
 */
export class HtmlElement {

    /**
     * Configure the HTML Element that JointJS must use while creating new blocks.
     * @returns {any}
     */
    public static createHtmlElement () {
        joint.shapes['html'] = {};
        joint.shapes['html'].Element = joint.shapes.basic.Generic.extend(_.extend({}, joint.shapes.basic['PortsModelInterface'], {
            markup: '<g class="rotatable"><g class="scalable"><rect/></g><g class="inPorts"/><g class="outPorts"/></g>',
            portMarkup: '<g class="port<%= id %>"><circle/></g>',
            defaults: joint.util.deepSupplement({
                type: 'html.Element',
                attrs: {
                    rect: { stroke: 'none', 'fill-opacity': 0 },
                    circle: {
                        r: 9,
                        magnet: true,
                        stroke: '#555'
                    },
                    '.inPorts circle': { fill: 'white', magnet: 'passive', type: 'input'},
                    '.outPorts circle': { fill: 'white', type: 'output'}
                }
            }, joint.shapes.basic.Rect.prototype['defaults']),
            getPortAttrs (portName: string, index: number, total: number, selector: string, type: string) {

                const attrs = {};
                const portClass = 'port' + index;
                const portSelector = selector + '>.' + portClass;
                const portCircleSelector = portSelector + '>circle';
                attrs[portCircleSelector] = { port: { id: portName || _.uniqueId(type), type: type } };
                attrs[portSelector] = { ref: 'rect', 'ref-y': (index + 0.5) * (1 / total) };
                if (selector === '.outPorts') { attrs[portSelector]['ref-dx'] = 0; }
                return attrs;
            }
        }));

        // Create a custom view for that element that displays an HTML div above it.
        // -------------------------------------------------------------------------

        joint.shapes['html'].ElementView = joint.dia.ElementView.extend({
            template: `
                 <div class="component">
                 <button class="delete">x</button>
                 <label></label>
                 </div>`,
            initialize () {
                _.bindAll(this, 'updateBox');
                joint.dia.ElementView.prototype.initialize.apply(this, arguments);

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
                joint.dia.ElementView.prototype.initialize.apply(this, arguments); // TODO : delete line
            },
            render () {
                joint.dia.ElementView.prototype.render.apply(this, arguments);
                this.paper.$el.prepend(this.$box);
                this.updateBox();
                return this;
            },
            renderPorts: function () {
                const $inPorts = this.$('.inPorts').empty();
                const $outPorts = this.$('.outPorts').empty();

                const portTemplate = _.template(this.model.portMarkup);

                _.each(_.filter(this.model.ports, (p) => { return p['type'] === 'in'; }), (port, index) => {

                    $inPorts.append(V(portTemplate({ id: index, port: port })).node);
                });
                _.each(_.filter(this.model.ports, function (p) { return p['type'] === 'out'; }), function (port, index) {

                    $outPorts.append(V(portTemplate({ id: index, port: port })).node);
                });
            },
            update: function () {

                // First render ports so that `attrs` can be applied to those newly created DOM elements
                // in `ElementView.prototype.update()`.
                this.renderPorts();
                joint.dia.ElementView.prototype.update.apply(this, arguments);
            },
            updateBox () {
                // Set the position and dimension of the box so that it covers the JointJS element.
                let bbox = this.model.getBBox();
                // Example of updating the HTML with a data stored in the cell model.
                const node: Node = this.model.get('node');
                const label = node.getName() !== '' ? node.getName() : node.component;
                this.$box.find('label').text(label);
                this.$box.css({
                    width: bbox.width,
                    height: bbox.height,
                    left: bbox.x,
                    top: bbox.y
                });
            },
            removeBox (evt) {
                this.$box.remove();
            }
        });
    }
}
