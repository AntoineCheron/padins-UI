/**
 * Created by antoine on 15/06/2017.
 */

export class FBPMessage {
    message: Object;

    constructor (protocol: string, command: string, payload: Object) {
        this.message = {
            protocol: protocol,
            command: command,
            payload: payload
        };
    }

    /* =================================================================================================================
                                                GETTERS AND SETTERS
     ===============================================================================================================*/

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
