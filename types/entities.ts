export enum MessageType{
    CONTROL_INFO = "controlInfo",
    MONITOR_INFO = "monitorInfo",
    CONTROL_UPDATE = "controlPut",
    MONITOR_UPDATE = "monitorPut",
}


export interface IMessageValue{
    id: number;
    status: "on"|"off";
    voltage: number;
    current: number;
}
export interface IMessage{
    type: MessageType;
    values: IMessageValue[];
}