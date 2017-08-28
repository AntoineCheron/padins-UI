/**
 * This class implements the format of a FBPMessage as described here :
 * https://flowbased.github.io/fbp-protocol/#message-structure
 *
 * Created by antoine on 15/06/2017.
 */
export class FBPMessage {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    message: Object;

    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor (protocol: string, command: string, payload: Object) {
        this.message = {
            protocol: protocol,
            command: command,
            payload: payload
        };
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                        PUBLIC METHODS / GETTERS AND SETTERS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Returns the protocol field of the message.
     *
     * @returns {string} the protocol's name
     */
    getProtocol (): string {
        return this.message['protocol'] || '';
    }

    /**
     * Returns the command field of the message.
     *
     * @returns {string} the command's name
     */
    getCommand (): string {
        return this.message['command'] || '';
    }

    /**
     * Returns the payload field of the message.
     *
     * @returns {Object} the payload
     */
    getPayloadAsJSON (): Object {
        return this.message['payload'] || {};
    }

    /**
     * Returns the payload field of the message, as a serialized string
     *
     * @returns {string} the protocol's name
     */
    getPayloadAsString (): string {
        return JSON.stringify(this.message['payload'] || '');
    }

    /**
     * Set the protocol field of the message.
     *
     * @param protocol {string} the new protocol
     */
    setProtocol(protocol: string) {
        this.message['protocol'] = protocol;
    }

    /**
     * Set the command field of the message
     *
     * @param command {string} the command to use
     */
    setCommand(command: string) {
        this.message['command'] = command;
    }

    /**
     * Set the payload of the message, from a stringified json.
     *
     * @param payload {string} the stringified payload
     */
    setPayload (payload: string) {
        this.message['payload'] = payload;
    }

    /**
     * Set the payload of the message, from a Javascript object.
     *
     * @param payload {Object} the new payload
     */
    setPayloadFromJson (payload: Object) {
        this.message['payload'] = JSON.stringify(payload);
    }

    /**
     * Stringify the message in order to send it.
     *
     * @returns {string} the stringified message
     */
    toJSONstring (): string {
        return JSON.stringify(this.message);
    }
}
