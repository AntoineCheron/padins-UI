/**
 * Created by antoine on 15/06/2017.
 */

export class FBPMessage {
    message: Object;

    constructor (protocol: String, command: String, payload: Object) {
        this.message = {
            protocol: protocol,
            command: command,
            payload: payload
        };
    }

    /* =================================================================================================================
                                                GETTERS AND SETTERS
     ===============================================================================================================*/

    getProtocol (): String {
        return this.message['protocol'];
    }

    getCommand (): String {
        return this.message['command'];
    }

    getPayloadAsJSON (): Object {
        return this.message['payload'];
    }

    getPayloadAsJString (): String {
        return this.message['payload'];
    }

    setProtocol(protocol: String) {
        this.message['protocol'] = protocol;
    }

    setCommand(command: String) {
        this.message['command'] = command;
    }

    setPayload (payload: String) {
        this.message['payload'] = payload;
    }

    setPayloadFromJson (payload: Object) {
        this.message['payload'] = JSON.stringify(payload);
    }

    toJSONString (): String {
        return JSON.stringify(this.message);
    }
}
