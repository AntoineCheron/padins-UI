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

    getProtocol (): string {
        return this.message['protocol'];
    }

    getCommand (): string {
        return this.message['command'];
    }

    getPayloadAsJSON (): Object {
        return this.message['payload'];
    }

    getPayloadAsJstring (): string {
        return this.message['payload'];
    }

    setProtocol(protocol: string) {
        this.message['protocol'] = protocol;
    }

    setCommand(command: string) {
        this.message['command'] = command;
    }

    setPayload (payload: string) {
        this.message['payload'] = payload;
    }

    setPayloadFromJson (payload: Object) {
        this.message['payload'] = JSON.stringify(payload);
    }

    toJSONstring (): string {
        return JSON.stringify(this.message);
    }
}
