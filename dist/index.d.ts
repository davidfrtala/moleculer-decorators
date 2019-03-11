import { ServiceSchema, Action, ActionHandler, LoggerInstance, ServiceMethods, ServiceEvents, Actions, ServiceSettingSchema, GenericObject, ServiceBroker, ServiceEvent, ServiceEventHandler } from 'moleculer';
export declare class BaseSchema {
    [x: string]: any;
    logger: LoggerInstance;
    name: string;
    broker: ServiceBroker;
    version: string | number;
    settings: ServiceSettingSchema;
    metadata: GenericObject;
    mixins: Array<ServiceSchema>;
    actions: Actions;
    methods: ServiceMethods;
    events: ServiceEvents;
}
export interface Options extends Partial<ServiceSchema> {
    name?: string;
    constructOverride?: boolean;
}
export interface ActionOptions extends Partial<Action> {
    name?: string;
    handler?: ActionHandler<any>;
    skipHandler?: boolean;
}
export interface EventOptions extends Partial<ServiceEvent> {
    name?: string;
    group?: string;
    handler?: ServiceEventHandler;
}
export declare function Method(target: any, key: any, descriptor: any): void;
export declare function Event(options?: EventOptions): (target: any, key: any, descriptor: any) => void;
export declare function Action(options?: ActionOptions): (target: any, key: any, descriptor: any) => void;
export declare function Service(options?: Options): Function;
