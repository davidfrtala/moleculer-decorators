"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const blacklist = [
    'created',
    'started',
    'stopped',
    'actions',
    'methods',
    'events',
    'broker',
    'logger'
];
const blacklist2 = ['metadata', 'settings', 'mixins', 'name', 'version'].concat(blacklist);
const defaultServiceOptions = {
    constructOverride: true,
    skipHandler: false
};
function Method(target, key, descriptor) {
    (target.methods || (target.methods = {}))[key] = descriptor.value;
}
exports.Method = Method;
function Event(options) {
    return function (target, key, descriptor) {
        (target.events || (target.events = {}))[key] = options
            ? Object.assign({}, options, { handler: descriptor.value }) : descriptor.value;
    };
}
exports.Event = Event;
function Action(options = {}) {
    return function (target, key, descriptor) {
        if (!options.skipHandler) {
            options.handler = descriptor.value;
        }
        else {
            delete options.skipHandler;
        }
        (target.actions || (target.actions = {}))[key] = options
            ? Object.assign({}, options) : options.skipHandler
            ? ''
            : descriptor.value;
    };
}
exports.Action = Action;
const mockServiceBroker = new Object({ Promise });
function Service(options = {}) {
    return function (constructor) {
        let base = {
            name: ''
        };
        const _options = _.extend({}, defaultServiceOptions, options);
        Object.defineProperty(base, 'name', {
            value: options.name || constructor.name,
            writable: false,
            enumerable: true
        });
        if (options.name) {
            delete options.name;
        }
        Object.assign(base, _.omit(options, _.keys(defaultServiceOptions)));
        const parentService = constructor.prototype;
        const vars = [];
        Object.getOwnPropertyNames(parentService).forEach(function (key) {
            if (key === 'constructor') {
                if (_options.constructOverride) {
                    const ServiceClass = new parentService.constructor(mockServiceBroker);
                    Object.getOwnPropertyNames(ServiceClass).forEach(function (key) {
                        if (blacklist.indexOf(key) === -1 &&
                            !_.isFunction(ServiceClass[key])) {
                            base[key] = Object.getOwnPropertyDescriptor(ServiceClass, key).value;
                            if (blacklist2.indexOf(key) === -1) {
                                vars[key] = Object.getOwnPropertyDescriptor(ServiceClass, key).value;
                            }
                        }
                    });
                    const bypass = Object.defineProperty;
                    const obj = {};
                    bypass(obj, 'created', {
                        value: function created(broker) {
                            for (let key in vars) {
                                this[key] = vars[key];
                            }
                            if (!_.isNil(Object.getOwnPropertyDescriptor(parentService, 'created'))) {
                                Object.getOwnPropertyDescriptor(parentService, 'created').value.call(this, broker);
                            }
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                    base['created'] = obj.created;
                }
                return;
            }
            const descriptor = Object.getOwnPropertyDescriptor(parentService, key);
            if (key === 'created' && !_options.constructOverride) {
                base[key] = descriptor.value;
            }
            if (key === 'started' || key === 'stopped') {
                base[key] = descriptor.value;
                return;
            }
            if (key === 'events' || key === 'methods' || key === 'actions') {
                base[key]
                    ? Object.assign(base[key], descriptor.value)
                    : (base[key] = descriptor.value);
                return;
            }
            if (key === 'afterConnected'
                || key === 'entityCreated'
                || key === 'entityUpdated'
                || key === 'entityRemoved') {
                base[key] = descriptor.value;
                return;
            }
        });
        return class extends parentService.constructor {
            constructor(broker, schema) {
                super(broker, schema);
                this.parseServiceSchema(base);
            }
        };
    };
}
exports.Service = Service;
