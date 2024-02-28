import { createRequire as __WEBPACK_EXTERNAL_createRequire } from "module";
/******/ var __webpack_modules__ = ({

/***/ 7171:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContextAPI = void 0;
const NoopContextManager_1 = __nccwpck_require__(4118);
const global_utils_1 = __nccwpck_require__(5135);
const diag_1 = __nccwpck_require__(1877);
const API_NAME = 'context';
const NOOP_CONTEXT_MANAGER = new NoopContextManager_1.NoopContextManager();
/**
 * Singleton object which represents the entry point to the OpenTelemetry Context API
 */
class ContextAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() { }
    /** Get the singleton instance of the Context API */
    static getInstance() {
        if (!this._instance) {
            this._instance = new ContextAPI();
        }
        return this._instance;
    }
    /**
     * Set the current context manager.
     *
     * @returns true if the context manager was successfully registered, else false
     */
    setGlobalContextManager(contextManager) {
        return (0, global_utils_1.registerGlobal)(API_NAME, contextManager, diag_1.DiagAPI.instance());
    }
    /**
     * Get the currently active context
     */
    active() {
        return this._getContextManager().active();
    }
    /**
     * Execute a function with an active context
     *
     * @param context context to be active during function execution
     * @param fn function to execute in a context
     * @param thisArg optional receiver to be used for calling fn
     * @param args optional arguments forwarded to fn
     */
    with(context, fn, thisArg, ...args) {
        return this._getContextManager().with(context, fn, thisArg, ...args);
    }
    /**
     * Bind a context to a target function or event emitter
     *
     * @param context context to bind to the event emitter or function. Defaults to the currently active context
     * @param target function or event emitter to bind
     */
    bind(context, target) {
        return this._getContextManager().bind(context, target);
    }
    _getContextManager() {
        return (0, global_utils_1.getGlobal)(API_NAME) || NOOP_CONTEXT_MANAGER;
    }
    /** Disable and remove the global context manager */
    disable() {
        this._getContextManager().disable();
        (0, global_utils_1.unregisterGlobal)(API_NAME, diag_1.DiagAPI.instance());
    }
}
exports.ContextAPI = ContextAPI;
//# sourceMappingURL=context.js.map

/***/ }),

/***/ 1877:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DiagAPI = void 0;
const ComponentLogger_1 = __nccwpck_require__(7978);
const logLevelLogger_1 = __nccwpck_require__(9639);
const types_1 = __nccwpck_require__(8077);
const global_utils_1 = __nccwpck_require__(5135);
const API_NAME = 'diag';
/**
 * Singleton object which represents the entry point to the OpenTelemetry internal
 * diagnostic API
 */
class DiagAPI {
    /**
     * Private internal constructor
     * @private
     */
    constructor() {
        function _logProxy(funcName) {
            return function (...args) {
                const logger = (0, global_utils_1.getGlobal)('diag');
                // shortcut if logger not set
                if (!logger)
                    return;
                return logger[funcName](...args);
            };
        }
        // Using self local variable for minification purposes as 'this' cannot be minified
        const self = this;
        // DiagAPI specific functions
        const setLogger = (logger, optionsOrLogLevel = { logLevel: types_1.DiagLogLevel.INFO }) => {
            var _a, _b, _c;
            if (logger === self) {
                // There isn't much we can do here.
                // Logging to the console might break the user application.
                // Try to log to self. If a logger was previously registered it will receive the log.
                const err = new Error('Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation');
                self.error((_a = err.stack) !== null && _a !== void 0 ? _a : err.message);
                return false;
            }
            if (typeof optionsOrLogLevel === 'number') {
                optionsOrLogLevel = {
                    logLevel: optionsOrLogLevel,
                };
            }
            const oldLogger = (0, global_utils_1.getGlobal)('diag');
            const newLogger = (0, logLevelLogger_1.createLogLevelDiagLogger)((_b = optionsOrLogLevel.logLevel) !== null && _b !== void 0 ? _b : types_1.DiagLogLevel.INFO, logger);
            // There already is an logger registered. We'll let it know before overwriting it.
            if (oldLogger && !optionsOrLogLevel.suppressOverrideMessage) {
                const stack = (_c = new Error().stack) !== null && _c !== void 0 ? _c : '<failed to generate stacktrace>';
                oldLogger.warn(`Current logger will be overwritten from ${stack}`);
                newLogger.warn(`Current logger will overwrite one already registered from ${stack}`);
            }
            return (0, global_utils_1.registerGlobal)('diag', newLogger, self, true);
        };
        self.setLogger = setLogger;
        self.disable = () => {
            (0, global_utils_1.unregisterGlobal)(API_NAME, self);
        };
        self.createComponentLogger = (options) => {
            return new ComponentLogger_1.DiagComponentLogger(options);
        };
        self.verbose = _logProxy('verbose');
        self.debug = _logProxy('debug');
        self.info = _logProxy('info');
        self.warn = _logProxy('warn');
        self.error = _logProxy('error');
    }
    /** Get the singleton instance of the DiagAPI API */
    static instance() {
        if (!this._instance) {
            this._instance = new DiagAPI();
        }
        return this._instance;
    }
}
exports.DiagAPI = DiagAPI;
//# sourceMappingURL=diag.js.map

/***/ }),

/***/ 7696:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MetricsAPI = void 0;
const NoopMeterProvider_1 = __nccwpck_require__(2647);
const global_utils_1 = __nccwpck_require__(5135);
const diag_1 = __nccwpck_require__(1877);
const API_NAME = 'metrics';
/**
 * Singleton object which represents the entry point to the OpenTelemetry Metrics API
 */
class MetricsAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() { }
    /** Get the singleton instance of the Metrics API */
    static getInstance() {
        if (!this._instance) {
            this._instance = new MetricsAPI();
        }
        return this._instance;
    }
    /**
     * Set the current global meter provider.
     * Returns true if the meter provider was successfully registered, else false.
     */
    setGlobalMeterProvider(provider) {
        return (0, global_utils_1.registerGlobal)(API_NAME, provider, diag_1.DiagAPI.instance());
    }
    /**
     * Returns the global meter provider.
     */
    getMeterProvider() {
        return (0, global_utils_1.getGlobal)(API_NAME) || NoopMeterProvider_1.NOOP_METER_PROVIDER;
    }
    /**
     * Returns a meter from the global meter provider.
     */
    getMeter(name, version, options) {
        return this.getMeterProvider().getMeter(name, version, options);
    }
    /** Remove the global meter provider */
    disable() {
        (0, global_utils_1.unregisterGlobal)(API_NAME, diag_1.DiagAPI.instance());
    }
}
exports.MetricsAPI = MetricsAPI;
//# sourceMappingURL=metrics.js.map

/***/ }),

/***/ 9909:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PropagationAPI = void 0;
const global_utils_1 = __nccwpck_require__(5135);
const NoopTextMapPropagator_1 = __nccwpck_require__(2368);
const TextMapPropagator_1 = __nccwpck_require__(865);
const context_helpers_1 = __nccwpck_require__(7682);
const utils_1 = __nccwpck_require__(8136);
const diag_1 = __nccwpck_require__(1877);
const API_NAME = 'propagation';
const NOOP_TEXT_MAP_PROPAGATOR = new NoopTextMapPropagator_1.NoopTextMapPropagator();
/**
 * Singleton object which represents the entry point to the OpenTelemetry Propagation API
 */
class PropagationAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
        this.createBaggage = utils_1.createBaggage;
        this.getBaggage = context_helpers_1.getBaggage;
        this.getActiveBaggage = context_helpers_1.getActiveBaggage;
        this.setBaggage = context_helpers_1.setBaggage;
        this.deleteBaggage = context_helpers_1.deleteBaggage;
    }
    /** Get the singleton instance of the Propagator API */
    static getInstance() {
        if (!this._instance) {
            this._instance = new PropagationAPI();
        }
        return this._instance;
    }
    /**
     * Set the current propagator.
     *
     * @returns true if the propagator was successfully registered, else false
     */
    setGlobalPropagator(propagator) {
        return (0, global_utils_1.registerGlobal)(API_NAME, propagator, diag_1.DiagAPI.instance());
    }
    /**
     * Inject context into a carrier to be propagated inter-process
     *
     * @param context Context carrying tracing data to inject
     * @param carrier carrier to inject context into
     * @param setter Function used to set values on the carrier
     */
    inject(context, carrier, setter = TextMapPropagator_1.defaultTextMapSetter) {
        return this._getGlobalPropagator().inject(context, carrier, setter);
    }
    /**
     * Extract context from a carrier
     *
     * @param context Context which the newly created context will inherit from
     * @param carrier Carrier to extract context from
     * @param getter Function used to extract keys from a carrier
     */
    extract(context, carrier, getter = TextMapPropagator_1.defaultTextMapGetter) {
        return this._getGlobalPropagator().extract(context, carrier, getter);
    }
    /**
     * Return a list of all fields which may be used by the propagator.
     */
    fields() {
        return this._getGlobalPropagator().fields();
    }
    /** Remove the global propagator */
    disable() {
        (0, global_utils_1.unregisterGlobal)(API_NAME, diag_1.DiagAPI.instance());
    }
    _getGlobalPropagator() {
        return (0, global_utils_1.getGlobal)(API_NAME) || NOOP_TEXT_MAP_PROPAGATOR;
    }
}
exports.PropagationAPI = PropagationAPI;
//# sourceMappingURL=propagation.js.map

/***/ }),

/***/ 1539:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TraceAPI = void 0;
const global_utils_1 = __nccwpck_require__(5135);
const ProxyTracerProvider_1 = __nccwpck_require__(2285);
const spancontext_utils_1 = __nccwpck_require__(9745);
const context_utils_1 = __nccwpck_require__(3326);
const diag_1 = __nccwpck_require__(1877);
const API_NAME = 'trace';
/**
 * Singleton object which represents the entry point to the OpenTelemetry Tracing API
 */
class TraceAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
        this._proxyTracerProvider = new ProxyTracerProvider_1.ProxyTracerProvider();
        this.wrapSpanContext = spancontext_utils_1.wrapSpanContext;
        this.isSpanContextValid = spancontext_utils_1.isSpanContextValid;
        this.deleteSpan = context_utils_1.deleteSpan;
        this.getSpan = context_utils_1.getSpan;
        this.getActiveSpan = context_utils_1.getActiveSpan;
        this.getSpanContext = context_utils_1.getSpanContext;
        this.setSpan = context_utils_1.setSpan;
        this.setSpanContext = context_utils_1.setSpanContext;
    }
    /** Get the singleton instance of the Trace API */
    static getInstance() {
        if (!this._instance) {
            this._instance = new TraceAPI();
        }
        return this._instance;
    }
    /**
     * Set the current global tracer.
     *
     * @returns true if the tracer provider was successfully registered, else false
     */
    setGlobalTracerProvider(provider) {
        const success = (0, global_utils_1.registerGlobal)(API_NAME, this._proxyTracerProvider, diag_1.DiagAPI.instance());
        if (success) {
            this._proxyTracerProvider.setDelegate(provider);
        }
        return success;
    }
    /**
     * Returns the global tracer provider.
     */
    getTracerProvider() {
        return (0, global_utils_1.getGlobal)(API_NAME) || this._proxyTracerProvider;
    }
    /**
     * Returns a tracer from the global tracer provider.
     */
    getTracer(name, version) {
        return this.getTracerProvider().getTracer(name, version);
    }
    /** Remove the global tracer provider */
    disable() {
        (0, global_utils_1.unregisterGlobal)(API_NAME, diag_1.DiagAPI.instance());
        this._proxyTracerProvider = new ProxyTracerProvider_1.ProxyTracerProvider();
    }
}
exports.TraceAPI = TraceAPI;
//# sourceMappingURL=trace.js.map

/***/ }),

/***/ 7682:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deleteBaggage = exports.setBaggage = exports.getActiveBaggage = exports.getBaggage = void 0;
const context_1 = __nccwpck_require__(7171);
const context_2 = __nccwpck_require__(8242);
/**
 * Baggage key
 */
const BAGGAGE_KEY = (0, context_2.createContextKey)('OpenTelemetry Baggage Key');
/**
 * Retrieve the current baggage from the given context
 *
 * @param {Context} Context that manage all context values
 * @returns {Baggage} Extracted baggage from the context
 */
function getBaggage(context) {
    return context.getValue(BAGGAGE_KEY) || undefined;
}
exports.getBaggage = getBaggage;
/**
 * Retrieve the current baggage from the active/current context
 *
 * @returns {Baggage} Extracted baggage from the context
 */
function getActiveBaggage() {
    return getBaggage(context_1.ContextAPI.getInstance().active());
}
exports.getActiveBaggage = getActiveBaggage;
/**
 * Store a baggage in the given context
 *
 * @param {Context} Context that manage all context values
 * @param {Baggage} baggage that will be set in the actual context
 */
function setBaggage(context, baggage) {
    return context.setValue(BAGGAGE_KEY, baggage);
}
exports.setBaggage = setBaggage;
/**
 * Delete the baggage stored in the given context
 *
 * @param {Context} Context that manage all context values
 */
function deleteBaggage(context) {
    return context.deleteValue(BAGGAGE_KEY);
}
exports.deleteBaggage = deleteBaggage;
//# sourceMappingURL=context-helpers.js.map

/***/ }),

/***/ 4811:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaggageImpl = void 0;
class BaggageImpl {
    constructor(entries) {
        this._entries = entries ? new Map(entries) : new Map();
    }
    getEntry(key) {
        const entry = this._entries.get(key);
        if (!entry) {
            return undefined;
        }
        return Object.assign({}, entry);
    }
    getAllEntries() {
        return Array.from(this._entries.entries()).map(([k, v]) => [k, v]);
    }
    setEntry(key, entry) {
        const newBaggage = new BaggageImpl(this._entries);
        newBaggage._entries.set(key, entry);
        return newBaggage;
    }
    removeEntry(key) {
        const newBaggage = new BaggageImpl(this._entries);
        newBaggage._entries.delete(key);
        return newBaggage;
    }
    removeEntries(...keys) {
        const newBaggage = new BaggageImpl(this._entries);
        for (const key of keys) {
            newBaggage._entries.delete(key);
        }
        return newBaggage;
    }
    clear() {
        return new BaggageImpl();
    }
}
exports.BaggageImpl = BaggageImpl;
//# sourceMappingURL=baggage-impl.js.map

/***/ }),

/***/ 3542:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.baggageEntryMetadataSymbol = void 0;
/**
 * Symbol used to make BaggageEntryMetadata an opaque type
 */
exports.baggageEntryMetadataSymbol = Symbol('BaggageEntryMetadata');
//# sourceMappingURL=symbol.js.map

/***/ }),

/***/ 8136:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.baggageEntryMetadataFromString = exports.createBaggage = void 0;
const diag_1 = __nccwpck_require__(1877);
const baggage_impl_1 = __nccwpck_require__(4811);
const symbol_1 = __nccwpck_require__(3542);
const diag = diag_1.DiagAPI.instance();
/**
 * Create a new Baggage with optional entries
 *
 * @param entries An array of baggage entries the new baggage should contain
 */
function createBaggage(entries = {}) {
    return new baggage_impl_1.BaggageImpl(new Map(Object.entries(entries)));
}
exports.createBaggage = createBaggage;
/**
 * Create a serializable BaggageEntryMetadata object from a string.
 *
 * @param str string metadata. Format is currently not defined by the spec and has no special meaning.
 *
 */
function baggageEntryMetadataFromString(str) {
    if (typeof str !== 'string') {
        diag.error(`Cannot create baggage metadata from unknown type: ${typeof str}`);
        str = '';
    }
    return {
        __TYPE__: symbol_1.baggageEntryMetadataSymbol,
        toString() {
            return str;
        },
    };
}
exports.baggageEntryMetadataFromString = baggageEntryMetadataFromString;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 7393:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.context = void 0;
// Split module-level variable definition into separate files to allow
// tree-shaking on each api instance.
const context_1 = __nccwpck_require__(7171);
/** Entrypoint for context API */
exports.context = context_1.ContextAPI.getInstance();
//# sourceMappingURL=context-api.js.map

/***/ }),

/***/ 4118:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NoopContextManager = void 0;
const context_1 = __nccwpck_require__(8242);
class NoopContextManager {
    active() {
        return context_1.ROOT_CONTEXT;
    }
    with(_context, fn, thisArg, ...args) {
        return fn.call(thisArg, ...args);
    }
    bind(_context, target) {
        return target;
    }
    enable() {
        return this;
    }
    disable() {
        return this;
    }
}
exports.NoopContextManager = NoopContextManager;
//# sourceMappingURL=NoopContextManager.js.map

/***/ }),

/***/ 8242:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ROOT_CONTEXT = exports.createContextKey = void 0;
/** Get a key to uniquely identify a context value */
function createContextKey(description) {
    // The specification states that for the same input, multiple calls should
    // return different keys. Due to the nature of the JS dependency management
    // system, this creates problems where multiple versions of some package
    // could hold different keys for the same property.
    //
    // Therefore, we use Symbol.for which returns the same key for the same input.
    return Symbol.for(description);
}
exports.createContextKey = createContextKey;
class BaseContext {
    /**
     * Construct a new context which inherits values from an optional parent context.
     *
     * @param parentContext a context from which to inherit values
     */
    constructor(parentContext) {
        // for minification
        const self = this;
        self._currentContext = parentContext ? new Map(parentContext) : new Map();
        self.getValue = (key) => self._currentContext.get(key);
        self.setValue = (key, value) => {
            const context = new BaseContext(self._currentContext);
            context._currentContext.set(key, value);
            return context;
        };
        self.deleteValue = (key) => {
            const context = new BaseContext(self._currentContext);
            context._currentContext.delete(key);
            return context;
        };
    }
}
/** The root context is used as the default parent context when there is no active context */
exports.ROOT_CONTEXT = new BaseContext();
//# sourceMappingURL=context.js.map

/***/ }),

/***/ 9721:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.diag = void 0;
// Split module-level variable definition into separate files to allow
// tree-shaking on each api instance.
const diag_1 = __nccwpck_require__(1877);
/**
 * Entrypoint for Diag API.
 * Defines Diagnostic handler used for internal diagnostic logging operations.
 * The default provides a Noop DiagLogger implementation which may be changed via the
 * diag.setLogger(logger: DiagLogger) function.
 */
exports.diag = diag_1.DiagAPI.instance();
//# sourceMappingURL=diag-api.js.map

/***/ }),

/***/ 7978:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DiagComponentLogger = void 0;
const global_utils_1 = __nccwpck_require__(5135);
/**
 * Component Logger which is meant to be used as part of any component which
 * will add automatically additional namespace in front of the log message.
 * It will then forward all message to global diag logger
 * @example
 * const cLogger = diag.createComponentLogger({ namespace: '@opentelemetry/instrumentation-http' });
 * cLogger.debug('test');
 * // @opentelemetry/instrumentation-http test
 */
class DiagComponentLogger {
    constructor(props) {
        this._namespace = props.namespace || 'DiagComponentLogger';
    }
    debug(...args) {
        return logProxy('debug', this._namespace, args);
    }
    error(...args) {
        return logProxy('error', this._namespace, args);
    }
    info(...args) {
        return logProxy('info', this._namespace, args);
    }
    warn(...args) {
        return logProxy('warn', this._namespace, args);
    }
    verbose(...args) {
        return logProxy('verbose', this._namespace, args);
    }
}
exports.DiagComponentLogger = DiagComponentLogger;
function logProxy(funcName, namespace, args) {
    const logger = (0, global_utils_1.getGlobal)('diag');
    // shortcut if logger not set
    if (!logger) {
        return;
    }
    args.unshift(namespace);
    return logger[funcName](...args);
}
//# sourceMappingURL=ComponentLogger.js.map

/***/ }),

/***/ 3041:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DiagConsoleLogger = void 0;
const consoleMap = [
    { n: 'error', c: 'error' },
    { n: 'warn', c: 'warn' },
    { n: 'info', c: 'info' },
    { n: 'debug', c: 'debug' },
    { n: 'verbose', c: 'trace' },
];
/**
 * A simple Immutable Console based diagnostic logger which will output any messages to the Console.
 * If you want to limit the amount of logging to a specific level or lower use the
 * {@link createLogLevelDiagLogger}
 */
class DiagConsoleLogger {
    constructor() {
        function _consoleFunc(funcName) {
            return function (...args) {
                if (console) {
                    // Some environments only expose the console when the F12 developer console is open
                    // eslint-disable-next-line no-console
                    let theFunc = console[funcName];
                    if (typeof theFunc !== 'function') {
                        // Not all environments support all functions
                        // eslint-disable-next-line no-console
                        theFunc = console.log;
                    }
                    // One last final check
                    if (typeof theFunc === 'function') {
                        return theFunc.apply(console, args);
                    }
                }
            };
        }
        for (let i = 0; i < consoleMap.length; i++) {
            this[consoleMap[i].n] = _consoleFunc(consoleMap[i].c);
        }
    }
}
exports.DiagConsoleLogger = DiagConsoleLogger;
//# sourceMappingURL=consoleLogger.js.map

/***/ }),

/***/ 9639:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createLogLevelDiagLogger = void 0;
const types_1 = __nccwpck_require__(8077);
function createLogLevelDiagLogger(maxLevel, logger) {
    if (maxLevel < types_1.DiagLogLevel.NONE) {
        maxLevel = types_1.DiagLogLevel.NONE;
    }
    else if (maxLevel > types_1.DiagLogLevel.ALL) {
        maxLevel = types_1.DiagLogLevel.ALL;
    }
    // In case the logger is null or undefined
    logger = logger || {};
    function _filterFunc(funcName, theLevel) {
        const theFunc = logger[funcName];
        if (typeof theFunc === 'function' && maxLevel >= theLevel) {
            return theFunc.bind(logger);
        }
        return function () { };
    }
    return {
        error: _filterFunc('error', types_1.DiagLogLevel.ERROR),
        warn: _filterFunc('warn', types_1.DiagLogLevel.WARN),
        info: _filterFunc('info', types_1.DiagLogLevel.INFO),
        debug: _filterFunc('debug', types_1.DiagLogLevel.DEBUG),
        verbose: _filterFunc('verbose', types_1.DiagLogLevel.VERBOSE),
    };
}
exports.createLogLevelDiagLogger = createLogLevelDiagLogger;
//# sourceMappingURL=logLevelLogger.js.map

/***/ }),

/***/ 8077:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DiagLogLevel = void 0;
/**
 * Defines the available internal logging levels for the diagnostic logger, the numeric values
 * of the levels are defined to match the original values from the initial LogLevel to avoid
 * compatibility/migration issues for any implementation that assume the numeric ordering.
 */
var DiagLogLevel;
(function (DiagLogLevel) {
    /** Diagnostic Logging level setting to disable all logging (except and forced logs) */
    DiagLogLevel[DiagLogLevel["NONE"] = 0] = "NONE";
    /** Identifies an error scenario */
    DiagLogLevel[DiagLogLevel["ERROR"] = 30] = "ERROR";
    /** Identifies a warning scenario */
    DiagLogLevel[DiagLogLevel["WARN"] = 50] = "WARN";
    /** General informational log message */
    DiagLogLevel[DiagLogLevel["INFO"] = 60] = "INFO";
    /** General debug log message */
    DiagLogLevel[DiagLogLevel["DEBUG"] = 70] = "DEBUG";
    /**
     * Detailed trace level logging should only be used for development, should only be set
     * in a development environment.
     */
    DiagLogLevel[DiagLogLevel["VERBOSE"] = 80] = "VERBOSE";
    /** Used to set the logging level to include all logging */
    DiagLogLevel[DiagLogLevel["ALL"] = 9999] = "ALL";
})(DiagLogLevel = exports.DiagLogLevel || (exports.DiagLogLevel = {}));
//# sourceMappingURL=types.js.map

/***/ }),

/***/ 5163:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.trace = exports.propagation = exports.metrics = exports.diag = exports.context = exports.INVALID_SPAN_CONTEXT = exports.INVALID_TRACEID = exports.INVALID_SPANID = exports.isValidSpanId = exports.isValidTraceId = exports.isSpanContextValid = exports.createTraceState = exports.TraceFlags = exports.SpanStatusCode = exports.SpanKind = exports.SamplingDecision = exports.ProxyTracerProvider = exports.ProxyTracer = exports.defaultTextMapSetter = exports.defaultTextMapGetter = exports.ValueType = exports.createNoopMeter = exports.DiagLogLevel = exports.DiagConsoleLogger = exports.ROOT_CONTEXT = exports.createContextKey = exports.baggageEntryMetadataFromString = void 0;
var utils_1 = __nccwpck_require__(8136);
Object.defineProperty(exports, "baggageEntryMetadataFromString", ({ enumerable: true, get: function () { return utils_1.baggageEntryMetadataFromString; } }));
// Context APIs
var context_1 = __nccwpck_require__(8242);
Object.defineProperty(exports, "createContextKey", ({ enumerable: true, get: function () { return context_1.createContextKey; } }));
Object.defineProperty(exports, "ROOT_CONTEXT", ({ enumerable: true, get: function () { return context_1.ROOT_CONTEXT; } }));
// Diag APIs
var consoleLogger_1 = __nccwpck_require__(3041);
Object.defineProperty(exports, "DiagConsoleLogger", ({ enumerable: true, get: function () { return consoleLogger_1.DiagConsoleLogger; } }));
var types_1 = __nccwpck_require__(8077);
Object.defineProperty(exports, "DiagLogLevel", ({ enumerable: true, get: function () { return types_1.DiagLogLevel; } }));
// Metrics APIs
var NoopMeter_1 = __nccwpck_require__(4837);
Object.defineProperty(exports, "createNoopMeter", ({ enumerable: true, get: function () { return NoopMeter_1.createNoopMeter; } }));
var Metric_1 = __nccwpck_require__(9999);
Object.defineProperty(exports, "ValueType", ({ enumerable: true, get: function () { return Metric_1.ValueType; } }));
// Propagation APIs
var TextMapPropagator_1 = __nccwpck_require__(865);
Object.defineProperty(exports, "defaultTextMapGetter", ({ enumerable: true, get: function () { return TextMapPropagator_1.defaultTextMapGetter; } }));
Object.defineProperty(exports, "defaultTextMapSetter", ({ enumerable: true, get: function () { return TextMapPropagator_1.defaultTextMapSetter; } }));
var ProxyTracer_1 = __nccwpck_require__(3503);
Object.defineProperty(exports, "ProxyTracer", ({ enumerable: true, get: function () { return ProxyTracer_1.ProxyTracer; } }));
var ProxyTracerProvider_1 = __nccwpck_require__(2285);
Object.defineProperty(exports, "ProxyTracerProvider", ({ enumerable: true, get: function () { return ProxyTracerProvider_1.ProxyTracerProvider; } }));
var SamplingResult_1 = __nccwpck_require__(3209);
Object.defineProperty(exports, "SamplingDecision", ({ enumerable: true, get: function () { return SamplingResult_1.SamplingDecision; } }));
var span_kind_1 = __nccwpck_require__(1424);
Object.defineProperty(exports, "SpanKind", ({ enumerable: true, get: function () { return span_kind_1.SpanKind; } }));
var status_1 = __nccwpck_require__(8845);
Object.defineProperty(exports, "SpanStatusCode", ({ enumerable: true, get: function () { return status_1.SpanStatusCode; } }));
var trace_flags_1 = __nccwpck_require__(6905);
Object.defineProperty(exports, "TraceFlags", ({ enumerable: true, get: function () { return trace_flags_1.TraceFlags; } }));
var utils_2 = __nccwpck_require__(2615);
Object.defineProperty(exports, "createTraceState", ({ enumerable: true, get: function () { return utils_2.createTraceState; } }));
var spancontext_utils_1 = __nccwpck_require__(9745);
Object.defineProperty(exports, "isSpanContextValid", ({ enumerable: true, get: function () { return spancontext_utils_1.isSpanContextValid; } }));
Object.defineProperty(exports, "isValidTraceId", ({ enumerable: true, get: function () { return spancontext_utils_1.isValidTraceId; } }));
Object.defineProperty(exports, "isValidSpanId", ({ enumerable: true, get: function () { return spancontext_utils_1.isValidSpanId; } }));
var invalid_span_constants_1 = __nccwpck_require__(1760);
Object.defineProperty(exports, "INVALID_SPANID", ({ enumerable: true, get: function () { return invalid_span_constants_1.INVALID_SPANID; } }));
Object.defineProperty(exports, "INVALID_TRACEID", ({ enumerable: true, get: function () { return invalid_span_constants_1.INVALID_TRACEID; } }));
Object.defineProperty(exports, "INVALID_SPAN_CONTEXT", ({ enumerable: true, get: function () { return invalid_span_constants_1.INVALID_SPAN_CONTEXT; } }));
// Split module-level variable definition into separate files to allow
// tree-shaking on each api instance.
const context_api_1 = __nccwpck_require__(7393);
Object.defineProperty(exports, "context", ({ enumerable: true, get: function () { return context_api_1.context; } }));
const diag_api_1 = __nccwpck_require__(9721);
Object.defineProperty(exports, "diag", ({ enumerable: true, get: function () { return diag_api_1.diag; } }));
const metrics_api_1 = __nccwpck_require__(2601);
Object.defineProperty(exports, "metrics", ({ enumerable: true, get: function () { return metrics_api_1.metrics; } }));
const propagation_api_1 = __nccwpck_require__(7591);
Object.defineProperty(exports, "propagation", ({ enumerable: true, get: function () { return propagation_api_1.propagation; } }));
const trace_api_1 = __nccwpck_require__(8989);
Object.defineProperty(exports, "trace", ({ enumerable: true, get: function () { return trace_api_1.trace; } }));
// Default export.
exports["default"] = {
    context: context_api_1.context,
    diag: diag_api_1.diag,
    metrics: metrics_api_1.metrics,
    propagation: propagation_api_1.propagation,
    trace: trace_api_1.trace,
};
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 5135:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.unregisterGlobal = exports.getGlobal = exports.registerGlobal = void 0;
const platform_1 = __nccwpck_require__(9957);
const version_1 = __nccwpck_require__(8996);
const semver_1 = __nccwpck_require__(1522);
const major = version_1.VERSION.split('.')[0];
const GLOBAL_OPENTELEMETRY_API_KEY = Symbol.for(`opentelemetry.js.api.${major}`);
const _global = platform_1._globalThis;
function registerGlobal(type, instance, diag, allowOverride = false) {
    var _a;
    const api = (_global[GLOBAL_OPENTELEMETRY_API_KEY] = (_a = _global[GLOBAL_OPENTELEMETRY_API_KEY]) !== null && _a !== void 0 ? _a : {
        version: version_1.VERSION,
    });
    if (!allowOverride && api[type]) {
        // already registered an API of this type
        const err = new Error(`@opentelemetry/api: Attempted duplicate registration of API: ${type}`);
        diag.error(err.stack || err.message);
        return false;
    }
    if (api.version !== version_1.VERSION) {
        // All registered APIs must be of the same version exactly
        const err = new Error(`@opentelemetry/api: Registration of version v${api.version} for ${type} does not match previously registered API v${version_1.VERSION}`);
        diag.error(err.stack || err.message);
        return false;
    }
    api[type] = instance;
    diag.debug(`@opentelemetry/api: Registered a global for ${type} v${version_1.VERSION}.`);
    return true;
}
exports.registerGlobal = registerGlobal;
function getGlobal(type) {
    var _a, _b;
    const globalVersion = (_a = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _a === void 0 ? void 0 : _a.version;
    if (!globalVersion || !(0, semver_1.isCompatible)(globalVersion)) {
        return;
    }
    return (_b = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _b === void 0 ? void 0 : _b[type];
}
exports.getGlobal = getGlobal;
function unregisterGlobal(type, diag) {
    diag.debug(`@opentelemetry/api: Unregistering a global for ${type} v${version_1.VERSION}.`);
    const api = _global[GLOBAL_OPENTELEMETRY_API_KEY];
    if (api) {
        delete api[type];
    }
}
exports.unregisterGlobal = unregisterGlobal;
//# sourceMappingURL=global-utils.js.map

/***/ }),

/***/ 1522:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isCompatible = exports._makeCompatibilityCheck = void 0;
const version_1 = __nccwpck_require__(8996);
const re = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
/**
 * Create a function to test an API version to see if it is compatible with the provided ownVersion.
 *
 * The returned function has the following semantics:
 * - Exact match is always compatible
 * - Major versions must match exactly
 *    - 1.x package cannot use global 2.x package
 *    - 2.x package cannot use global 1.x package
 * - The minor version of the API module requesting access to the global API must be less than or equal to the minor version of this API
 *    - 1.3 package may use 1.4 global because the later global contains all functions 1.3 expects
 *    - 1.4 package may NOT use 1.3 global because it may try to call functions which don't exist on 1.3
 * - If the major version is 0, the minor version is treated as the major and the patch is treated as the minor
 * - Patch and build tag differences are not considered at this time
 *
 * @param ownVersion version which should be checked against
 */
function _makeCompatibilityCheck(ownVersion) {
    const acceptedVersions = new Set([ownVersion]);
    const rejectedVersions = new Set();
    const myVersionMatch = ownVersion.match(re);
    if (!myVersionMatch) {
        // we cannot guarantee compatibility so we always return noop
        return () => false;
    }
    const ownVersionParsed = {
        major: +myVersionMatch[1],
        minor: +myVersionMatch[2],
        patch: +myVersionMatch[3],
        prerelease: myVersionMatch[4],
    };
    // if ownVersion has a prerelease tag, versions must match exactly
    if (ownVersionParsed.prerelease != null) {
        return function isExactmatch(globalVersion) {
            return globalVersion === ownVersion;
        };
    }
    function _reject(v) {
        rejectedVersions.add(v);
        return false;
    }
    function _accept(v) {
        acceptedVersions.add(v);
        return true;
    }
    return function isCompatible(globalVersion) {
        if (acceptedVersions.has(globalVersion)) {
            return true;
        }
        if (rejectedVersions.has(globalVersion)) {
            return false;
        }
        const globalVersionMatch = globalVersion.match(re);
        if (!globalVersionMatch) {
            // cannot parse other version
            // we cannot guarantee compatibility so we always noop
            return _reject(globalVersion);
        }
        const globalVersionParsed = {
            major: +globalVersionMatch[1],
            minor: +globalVersionMatch[2],
            patch: +globalVersionMatch[3],
            prerelease: globalVersionMatch[4],
        };
        // if globalVersion has a prerelease tag, versions must match exactly
        if (globalVersionParsed.prerelease != null) {
            return _reject(globalVersion);
        }
        // major versions must match
        if (ownVersionParsed.major !== globalVersionParsed.major) {
            return _reject(globalVersion);
        }
        if (ownVersionParsed.major === 0) {
            if (ownVersionParsed.minor === globalVersionParsed.minor &&
                ownVersionParsed.patch <= globalVersionParsed.patch) {
                return _accept(globalVersion);
            }
            return _reject(globalVersion);
        }
        if (ownVersionParsed.minor <= globalVersionParsed.minor) {
            return _accept(globalVersion);
        }
        return _reject(globalVersion);
    };
}
exports._makeCompatibilityCheck = _makeCompatibilityCheck;
/**
 * Test an API version to see if it is compatible with this API.
 *
 * - Exact match is always compatible
 * - Major versions must match exactly
 *    - 1.x package cannot use global 2.x package
 *    - 2.x package cannot use global 1.x package
 * - The minor version of the API module requesting access to the global API must be less than or equal to the minor version of this API
 *    - 1.3 package may use 1.4 global because the later global contains all functions 1.3 expects
 *    - 1.4 package may NOT use 1.3 global because it may try to call functions which don't exist on 1.3
 * - If the major version is 0, the minor version is treated as the major and the patch is treated as the minor
 * - Patch and build tag differences are not considered at this time
 *
 * @param version version of the API requesting an instance of the global API
 */
exports.isCompatible = _makeCompatibilityCheck(version_1.VERSION);
//# sourceMappingURL=semver.js.map

/***/ }),

/***/ 2601:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.metrics = void 0;
// Split module-level variable definition into separate files to allow
// tree-shaking on each api instance.
const metrics_1 = __nccwpck_require__(7696);
/** Entrypoint for metrics API */
exports.metrics = metrics_1.MetricsAPI.getInstance();
//# sourceMappingURL=metrics-api.js.map

/***/ }),

/***/ 9999:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ValueType = void 0;
/** The Type of value. It describes how the data is reported. */
var ValueType;
(function (ValueType) {
    ValueType[ValueType["INT"] = 0] = "INT";
    ValueType[ValueType["DOUBLE"] = 1] = "DOUBLE";
})(ValueType = exports.ValueType || (exports.ValueType = {}));
//# sourceMappingURL=Metric.js.map

/***/ }),

/***/ 4837:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createNoopMeter = exports.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = exports.NOOP_OBSERVABLE_GAUGE_METRIC = exports.NOOP_OBSERVABLE_COUNTER_METRIC = exports.NOOP_UP_DOWN_COUNTER_METRIC = exports.NOOP_HISTOGRAM_METRIC = exports.NOOP_COUNTER_METRIC = exports.NOOP_METER = exports.NoopObservableUpDownCounterMetric = exports.NoopObservableGaugeMetric = exports.NoopObservableCounterMetric = exports.NoopObservableMetric = exports.NoopHistogramMetric = exports.NoopUpDownCounterMetric = exports.NoopCounterMetric = exports.NoopMetric = exports.NoopMeter = void 0;
/**
 * NoopMeter is a noop implementation of the {@link Meter} interface. It reuses
 * constant NoopMetrics for all of its methods.
 */
class NoopMeter {
    constructor() { }
    /**
     * @see {@link Meter.createHistogram}
     */
    createHistogram(_name, _options) {
        return exports.NOOP_HISTOGRAM_METRIC;
    }
    /**
     * @see {@link Meter.createCounter}
     */
    createCounter(_name, _options) {
        return exports.NOOP_COUNTER_METRIC;
    }
    /**
     * @see {@link Meter.createUpDownCounter}
     */
    createUpDownCounter(_name, _options) {
        return exports.NOOP_UP_DOWN_COUNTER_METRIC;
    }
    /**
     * @see {@link Meter.createObservableGauge}
     */
    createObservableGauge(_name, _options) {
        return exports.NOOP_OBSERVABLE_GAUGE_METRIC;
    }
    /**
     * @see {@link Meter.createObservableCounter}
     */
    createObservableCounter(_name, _options) {
        return exports.NOOP_OBSERVABLE_COUNTER_METRIC;
    }
    /**
     * @see {@link Meter.createObservableUpDownCounter}
     */
    createObservableUpDownCounter(_name, _options) {
        return exports.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
    }
    /**
     * @see {@link Meter.addBatchObservableCallback}
     */
    addBatchObservableCallback(_callback, _observables) { }
    /**
     * @see {@link Meter.removeBatchObservableCallback}
     */
    removeBatchObservableCallback(_callback) { }
}
exports.NoopMeter = NoopMeter;
class NoopMetric {
}
exports.NoopMetric = NoopMetric;
class NoopCounterMetric extends NoopMetric {
    add(_value, _attributes) { }
}
exports.NoopCounterMetric = NoopCounterMetric;
class NoopUpDownCounterMetric extends NoopMetric {
    add(_value, _attributes) { }
}
exports.NoopUpDownCounterMetric = NoopUpDownCounterMetric;
class NoopHistogramMetric extends NoopMetric {
    record(_value, _attributes) { }
}
exports.NoopHistogramMetric = NoopHistogramMetric;
class NoopObservableMetric {
    addCallback(_callback) { }
    removeCallback(_callback) { }
}
exports.NoopObservableMetric = NoopObservableMetric;
class NoopObservableCounterMetric extends NoopObservableMetric {
}
exports.NoopObservableCounterMetric = NoopObservableCounterMetric;
class NoopObservableGaugeMetric extends NoopObservableMetric {
}
exports.NoopObservableGaugeMetric = NoopObservableGaugeMetric;
class NoopObservableUpDownCounterMetric extends NoopObservableMetric {
}
exports.NoopObservableUpDownCounterMetric = NoopObservableUpDownCounterMetric;
exports.NOOP_METER = new NoopMeter();
// Synchronous instruments
exports.NOOP_COUNTER_METRIC = new NoopCounterMetric();
exports.NOOP_HISTOGRAM_METRIC = new NoopHistogramMetric();
exports.NOOP_UP_DOWN_COUNTER_METRIC = new NoopUpDownCounterMetric();
// Asynchronous instruments
exports.NOOP_OBSERVABLE_COUNTER_METRIC = new NoopObservableCounterMetric();
exports.NOOP_OBSERVABLE_GAUGE_METRIC = new NoopObservableGaugeMetric();
exports.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new NoopObservableUpDownCounterMetric();
/**
 * Create a no-op Meter
 */
function createNoopMeter() {
    return exports.NOOP_METER;
}
exports.createNoopMeter = createNoopMeter;
//# sourceMappingURL=NoopMeter.js.map

/***/ }),

/***/ 2647:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NOOP_METER_PROVIDER = exports.NoopMeterProvider = void 0;
const NoopMeter_1 = __nccwpck_require__(4837);
/**
 * An implementation of the {@link MeterProvider} which returns an impotent Meter
 * for all calls to `getMeter`
 */
class NoopMeterProvider {
    getMeter(_name, _version, _options) {
        return NoopMeter_1.NOOP_METER;
    }
}
exports.NoopMeterProvider = NoopMeterProvider;
exports.NOOP_METER_PROVIDER = new NoopMeterProvider();
//# sourceMappingURL=NoopMeterProvider.js.map

/***/ }),

/***/ 9957:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(7200), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 9406:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports._globalThis = void 0;
/** only globals that common to node and browsers are allowed */
// eslint-disable-next-line node/no-unsupported-features/es-builtins
exports._globalThis = typeof globalThis === 'object' ? globalThis : global;
//# sourceMappingURL=globalThis.js.map

/***/ }),

/***/ 7200:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(9406), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 7591:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.propagation = void 0;
// Split module-level variable definition into separate files to allow
// tree-shaking on each api instance.
const propagation_1 = __nccwpck_require__(9909);
/** Entrypoint for propagation API */
exports.propagation = propagation_1.PropagationAPI.getInstance();
//# sourceMappingURL=propagation-api.js.map

/***/ }),

/***/ 2368:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NoopTextMapPropagator = void 0;
/**
 * No-op implementations of {@link TextMapPropagator}.
 */
class NoopTextMapPropagator {
    /** Noop inject function does nothing */
    inject(_context, _carrier) { }
    /** Noop extract function does nothing and returns the input context */
    extract(context, _carrier) {
        return context;
    }
    fields() {
        return [];
    }
}
exports.NoopTextMapPropagator = NoopTextMapPropagator;
//# sourceMappingURL=NoopTextMapPropagator.js.map

/***/ }),

/***/ 865:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultTextMapSetter = exports.defaultTextMapGetter = void 0;
exports.defaultTextMapGetter = {
    get(carrier, key) {
        if (carrier == null) {
            return undefined;
        }
        return carrier[key];
    },
    keys(carrier) {
        if (carrier == null) {
            return [];
        }
        return Object.keys(carrier);
    },
};
exports.defaultTextMapSetter = {
    set(carrier, key, value) {
        if (carrier == null) {
            return;
        }
        carrier[key] = value;
    },
};
//# sourceMappingURL=TextMapPropagator.js.map

/***/ }),

/***/ 8989:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.trace = void 0;
// Split module-level variable definition into separate files to allow
// tree-shaking on each api instance.
const trace_1 = __nccwpck_require__(1539);
/** Entrypoint for trace API */
exports.trace = trace_1.TraceAPI.getInstance();
//# sourceMappingURL=trace-api.js.map

/***/ }),

/***/ 1462:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NonRecordingSpan = void 0;
const invalid_span_constants_1 = __nccwpck_require__(1760);
/**
 * The NonRecordingSpan is the default {@link Span} that is used when no Span
 * implementation is available. All operations are no-op including context
 * propagation.
 */
class NonRecordingSpan {
    constructor(_spanContext = invalid_span_constants_1.INVALID_SPAN_CONTEXT) {
        this._spanContext = _spanContext;
    }
    // Returns a SpanContext.
    spanContext() {
        return this._spanContext;
    }
    // By default does nothing
    setAttribute(_key, _value) {
        return this;
    }
    // By default does nothing
    setAttributes(_attributes) {
        return this;
    }
    // By default does nothing
    addEvent(_name, _attributes) {
        return this;
    }
    // By default does nothing
    setStatus(_status) {
        return this;
    }
    // By default does nothing
    updateName(_name) {
        return this;
    }
    // By default does nothing
    end(_endTime) { }
    // isRecording always returns false for NonRecordingSpan.
    isRecording() {
        return false;
    }
    // By default does nothing
    recordException(_exception, _time) { }
}
exports.NonRecordingSpan = NonRecordingSpan;
//# sourceMappingURL=NonRecordingSpan.js.map

/***/ }),

/***/ 7606:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NoopTracer = void 0;
const context_1 = __nccwpck_require__(7171);
const context_utils_1 = __nccwpck_require__(3326);
const NonRecordingSpan_1 = __nccwpck_require__(1462);
const spancontext_utils_1 = __nccwpck_require__(9745);
const contextApi = context_1.ContextAPI.getInstance();
/**
 * No-op implementations of {@link Tracer}.
 */
class NoopTracer {
    // startSpan starts a noop span.
    startSpan(name, options, context = contextApi.active()) {
        const root = Boolean(options === null || options === void 0 ? void 0 : options.root);
        if (root) {
            return new NonRecordingSpan_1.NonRecordingSpan();
        }
        const parentFromContext = context && (0, context_utils_1.getSpanContext)(context);
        if (isSpanContext(parentFromContext) &&
            (0, spancontext_utils_1.isSpanContextValid)(parentFromContext)) {
            return new NonRecordingSpan_1.NonRecordingSpan(parentFromContext);
        }
        else {
            return new NonRecordingSpan_1.NonRecordingSpan();
        }
    }
    startActiveSpan(name, arg2, arg3, arg4) {
        let opts;
        let ctx;
        let fn;
        if (arguments.length < 2) {
            return;
        }
        else if (arguments.length === 2) {
            fn = arg2;
        }
        else if (arguments.length === 3) {
            opts = arg2;
            fn = arg3;
        }
        else {
            opts = arg2;
            ctx = arg3;
            fn = arg4;
        }
        const parentContext = ctx !== null && ctx !== void 0 ? ctx : contextApi.active();
        const span = this.startSpan(name, opts, parentContext);
        const contextWithSpanSet = (0, context_utils_1.setSpan)(parentContext, span);
        return contextApi.with(contextWithSpanSet, fn, undefined, span);
    }
}
exports.NoopTracer = NoopTracer;
function isSpanContext(spanContext) {
    return (typeof spanContext === 'object' &&
        typeof spanContext['spanId'] === 'string' &&
        typeof spanContext['traceId'] === 'string' &&
        typeof spanContext['traceFlags'] === 'number');
}
//# sourceMappingURL=NoopTracer.js.map

/***/ }),

/***/ 3259:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NoopTracerProvider = void 0;
const NoopTracer_1 = __nccwpck_require__(7606);
/**
 * An implementation of the {@link TracerProvider} which returns an impotent
 * Tracer for all calls to `getTracer`.
 *
 * All operations are no-op.
 */
class NoopTracerProvider {
    getTracer(_name, _version, _options) {
        return new NoopTracer_1.NoopTracer();
    }
}
exports.NoopTracerProvider = NoopTracerProvider;
//# sourceMappingURL=NoopTracerProvider.js.map

/***/ }),

/***/ 3503:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProxyTracer = void 0;
const NoopTracer_1 = __nccwpck_require__(7606);
const NOOP_TRACER = new NoopTracer_1.NoopTracer();
/**
 * Proxy tracer provided by the proxy tracer provider
 */
class ProxyTracer {
    constructor(_provider, name, version, options) {
        this._provider = _provider;
        this.name = name;
        this.version = version;
        this.options = options;
    }
    startSpan(name, options, context) {
        return this._getTracer().startSpan(name, options, context);
    }
    startActiveSpan(_name, _options, _context, _fn) {
        const tracer = this._getTracer();
        return Reflect.apply(tracer.startActiveSpan, tracer, arguments);
    }
    /**
     * Try to get a tracer from the proxy tracer provider.
     * If the proxy tracer provider has no delegate, return a noop tracer.
     */
    _getTracer() {
        if (this._delegate) {
            return this._delegate;
        }
        const tracer = this._provider.getDelegateTracer(this.name, this.version, this.options);
        if (!tracer) {
            return NOOP_TRACER;
        }
        this._delegate = tracer;
        return this._delegate;
    }
}
exports.ProxyTracer = ProxyTracer;
//# sourceMappingURL=ProxyTracer.js.map

/***/ }),

/***/ 2285:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProxyTracerProvider = void 0;
const ProxyTracer_1 = __nccwpck_require__(3503);
const NoopTracerProvider_1 = __nccwpck_require__(3259);
const NOOP_TRACER_PROVIDER = new NoopTracerProvider_1.NoopTracerProvider();
/**
 * Tracer provider which provides {@link ProxyTracer}s.
 *
 * Before a delegate is set, tracers provided are NoOp.
 *   When a delegate is set, traces are provided from the delegate.
 *   When a delegate is set after tracers have already been provided,
 *   all tracers already provided will use the provided delegate implementation.
 */
class ProxyTracerProvider {
    /**
     * Get a {@link ProxyTracer}
     */
    getTracer(name, version, options) {
        var _a;
        return ((_a = this.getDelegateTracer(name, version, options)) !== null && _a !== void 0 ? _a : new ProxyTracer_1.ProxyTracer(this, name, version, options));
    }
    getDelegate() {
        var _a;
        return (_a = this._delegate) !== null && _a !== void 0 ? _a : NOOP_TRACER_PROVIDER;
    }
    /**
     * Set the delegate tracer provider
     */
    setDelegate(delegate) {
        this._delegate = delegate;
    }
    getDelegateTracer(name, version, options) {
        var _a;
        return (_a = this._delegate) === null || _a === void 0 ? void 0 : _a.getTracer(name, version, options);
    }
}
exports.ProxyTracerProvider = ProxyTracerProvider;
//# sourceMappingURL=ProxyTracerProvider.js.map

/***/ }),

/***/ 3209:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SamplingDecision = void 0;
/**
 * @deprecated use the one declared in @opentelemetry/sdk-trace-base instead.
 * A sampling decision that determines how a {@link Span} will be recorded
 * and collected.
 */
var SamplingDecision;
(function (SamplingDecision) {
    /**
     * `Span.isRecording() === false`, span will not be recorded and all events
     * and attributes will be dropped.
     */
    SamplingDecision[SamplingDecision["NOT_RECORD"] = 0] = "NOT_RECORD";
    /**
     * `Span.isRecording() === true`, but `Sampled` flag in {@link TraceFlags}
     * MUST NOT be set.
     */
    SamplingDecision[SamplingDecision["RECORD"] = 1] = "RECORD";
    /**
     * `Span.isRecording() === true` AND `Sampled` flag in {@link TraceFlags}
     * MUST be set.
     */
    SamplingDecision[SamplingDecision["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
})(SamplingDecision = exports.SamplingDecision || (exports.SamplingDecision = {}));
//# sourceMappingURL=SamplingResult.js.map

/***/ }),

/***/ 3326:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getSpanContext = exports.setSpanContext = exports.deleteSpan = exports.setSpan = exports.getActiveSpan = exports.getSpan = void 0;
const context_1 = __nccwpck_require__(8242);
const NonRecordingSpan_1 = __nccwpck_require__(1462);
const context_2 = __nccwpck_require__(7171);
/**
 * span key
 */
const SPAN_KEY = (0, context_1.createContextKey)('OpenTelemetry Context Key SPAN');
/**
 * Return the span if one exists
 *
 * @param context context to get span from
 */
function getSpan(context) {
    return context.getValue(SPAN_KEY) || undefined;
}
exports.getSpan = getSpan;
/**
 * Gets the span from the current context, if one exists.
 */
function getActiveSpan() {
    return getSpan(context_2.ContextAPI.getInstance().active());
}
exports.getActiveSpan = getActiveSpan;
/**
 * Set the span on a context
 *
 * @param context context to use as parent
 * @param span span to set active
 */
function setSpan(context, span) {
    return context.setValue(SPAN_KEY, span);
}
exports.setSpan = setSpan;
/**
 * Remove current span stored in the context
 *
 * @param context context to delete span from
 */
function deleteSpan(context) {
    return context.deleteValue(SPAN_KEY);
}
exports.deleteSpan = deleteSpan;
/**
 * Wrap span context in a NoopSpan and set as span in a new
 * context
 *
 * @param context context to set active span on
 * @param spanContext span context to be wrapped
 */
function setSpanContext(context, spanContext) {
    return setSpan(context, new NonRecordingSpan_1.NonRecordingSpan(spanContext));
}
exports.setSpanContext = setSpanContext;
/**
 * Get the span context of the span if it exists.
 *
 * @param context context to get values from
 */
function getSpanContext(context) {
    var _a;
    return (_a = getSpan(context)) === null || _a === void 0 ? void 0 : _a.spanContext();
}
exports.getSpanContext = getSpanContext;
//# sourceMappingURL=context-utils.js.map

/***/ }),

/***/ 2110:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TraceStateImpl = void 0;
const tracestate_validators_1 = __nccwpck_require__(4864);
const MAX_TRACE_STATE_ITEMS = 32;
const MAX_TRACE_STATE_LEN = 512;
const LIST_MEMBERS_SEPARATOR = ',';
const LIST_MEMBER_KEY_VALUE_SPLITTER = '=';
/**
 * TraceState must be a class and not a simple object type because of the spec
 * requirement (https://www.w3.org/TR/trace-context/#tracestate-field).
 *
 * Here is the list of allowed mutations:
 * - New key-value pair should be added into the beginning of the list
 * - The value of any key can be updated. Modified keys MUST be moved to the
 * beginning of the list.
 */
class TraceStateImpl {
    constructor(rawTraceState) {
        this._internalState = new Map();
        if (rawTraceState)
            this._parse(rawTraceState);
    }
    set(key, value) {
        // TODO: Benchmark the different approaches(map vs list) and
        // use the faster one.
        const traceState = this._clone();
        if (traceState._internalState.has(key)) {
            traceState._internalState.delete(key);
        }
        traceState._internalState.set(key, value);
        return traceState;
    }
    unset(key) {
        const traceState = this._clone();
        traceState._internalState.delete(key);
        return traceState;
    }
    get(key) {
        return this._internalState.get(key);
    }
    serialize() {
        return this._keys()
            .reduce((agg, key) => {
            agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER + this.get(key));
            return agg;
        }, [])
            .join(LIST_MEMBERS_SEPARATOR);
    }
    _parse(rawTraceState) {
        if (rawTraceState.length > MAX_TRACE_STATE_LEN)
            return;
        this._internalState = rawTraceState
            .split(LIST_MEMBERS_SEPARATOR)
            .reverse() // Store in reverse so new keys (.set(...)) will be placed at the beginning
            .reduce((agg, part) => {
            const listMember = part.trim(); // Optional Whitespace (OWS) handling
            const i = listMember.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
            if (i !== -1) {
                const key = listMember.slice(0, i);
                const value = listMember.slice(i + 1, part.length);
                if ((0, tracestate_validators_1.validateKey)(key) && (0, tracestate_validators_1.validateValue)(value)) {
                    agg.set(key, value);
                }
                else {
                    // TODO: Consider to add warning log
                }
            }
            return agg;
        }, new Map());
        // Because of the reverse() requirement, trunc must be done after map is created
        if (this._internalState.size > MAX_TRACE_STATE_ITEMS) {
            this._internalState = new Map(Array.from(this._internalState.entries())
                .reverse() // Use reverse same as original tracestate parse chain
                .slice(0, MAX_TRACE_STATE_ITEMS));
        }
    }
    _keys() {
        return Array.from(this._internalState.keys()).reverse();
    }
    _clone() {
        const traceState = new TraceStateImpl();
        traceState._internalState = new Map(this._internalState);
        return traceState;
    }
}
exports.TraceStateImpl = TraceStateImpl;
//# sourceMappingURL=tracestate-impl.js.map

/***/ }),

/***/ 4864:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateValue = exports.validateKey = void 0;
const VALID_KEY_CHAR_RANGE = '[_0-9a-z-*/]';
const VALID_KEY = `[a-z]${VALID_KEY_CHAR_RANGE}{0,255}`;
const VALID_VENDOR_KEY = `[a-z0-9]${VALID_KEY_CHAR_RANGE}{0,240}@[a-z]${VALID_KEY_CHAR_RANGE}{0,13}`;
const VALID_KEY_REGEX = new RegExp(`^(?:${VALID_KEY}|${VALID_VENDOR_KEY})$`);
const VALID_VALUE_BASE_REGEX = /^[ -~]{0,255}[!-~]$/;
const INVALID_VALUE_COMMA_EQUAL_REGEX = /,|=/;
/**
 * Key is opaque string up to 256 characters printable. It MUST begin with a
 * lowercase letter, and can only contain lowercase letters a-z, digits 0-9,
 * underscores _, dashes -, asterisks *, and forward slashes /.
 * For multi-tenant vendor scenarios, an at sign (@) can be used to prefix the
 * vendor name. Vendors SHOULD set the tenant ID at the beginning of the key.
 * see https://www.w3.org/TR/trace-context/#key
 */
function validateKey(key) {
    return VALID_KEY_REGEX.test(key);
}
exports.validateKey = validateKey;
/**
 * Value is opaque string up to 256 characters printable ASCII RFC0020
 * characters (i.e., the range 0x20 to 0x7E) except comma , and =.
 */
function validateValue(value) {
    return (VALID_VALUE_BASE_REGEX.test(value) &&
        !INVALID_VALUE_COMMA_EQUAL_REGEX.test(value));
}
exports.validateValue = validateValue;
//# sourceMappingURL=tracestate-validators.js.map

/***/ }),

/***/ 2615:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createTraceState = void 0;
const tracestate_impl_1 = __nccwpck_require__(2110);
function createTraceState(rawTraceState) {
    return new tracestate_impl_1.TraceStateImpl(rawTraceState);
}
exports.createTraceState = createTraceState;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 1760:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.INVALID_SPAN_CONTEXT = exports.INVALID_TRACEID = exports.INVALID_SPANID = void 0;
const trace_flags_1 = __nccwpck_require__(6905);
exports.INVALID_SPANID = '0000000000000000';
exports.INVALID_TRACEID = '00000000000000000000000000000000';
exports.INVALID_SPAN_CONTEXT = {
    traceId: exports.INVALID_TRACEID,
    spanId: exports.INVALID_SPANID,
    traceFlags: trace_flags_1.TraceFlags.NONE,
};
//# sourceMappingURL=invalid-span-constants.js.map

/***/ }),

/***/ 1424:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SpanKind = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var SpanKind;
(function (SpanKind) {
    /** Default value. Indicates that the span is used internally. */
    SpanKind[SpanKind["INTERNAL"] = 0] = "INTERNAL";
    /**
     * Indicates that the span covers server-side handling of an RPC or other
     * remote request.
     */
    SpanKind[SpanKind["SERVER"] = 1] = "SERVER";
    /**
     * Indicates that the span covers the client-side wrapper around an RPC or
     * other remote request.
     */
    SpanKind[SpanKind["CLIENT"] = 2] = "CLIENT";
    /**
     * Indicates that the span describes producer sending a message to a
     * broker. Unlike client and server, there is no direct critical path latency
     * relationship between producer and consumer spans.
     */
    SpanKind[SpanKind["PRODUCER"] = 3] = "PRODUCER";
    /**
     * Indicates that the span describes consumer receiving a message from a
     * broker. Unlike client and server, there is no direct critical path latency
     * relationship between producer and consumer spans.
     */
    SpanKind[SpanKind["CONSUMER"] = 4] = "CONSUMER";
})(SpanKind = exports.SpanKind || (exports.SpanKind = {}));
//# sourceMappingURL=span_kind.js.map

/***/ }),

/***/ 9745:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.wrapSpanContext = exports.isSpanContextValid = exports.isValidSpanId = exports.isValidTraceId = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const invalid_span_constants_1 = __nccwpck_require__(1760);
const NonRecordingSpan_1 = __nccwpck_require__(1462);
const VALID_TRACEID_REGEX = /^([0-9a-f]{32})$/i;
const VALID_SPANID_REGEX = /^[0-9a-f]{16}$/i;
function isValidTraceId(traceId) {
    return VALID_TRACEID_REGEX.test(traceId) && traceId !== invalid_span_constants_1.INVALID_TRACEID;
}
exports.isValidTraceId = isValidTraceId;
function isValidSpanId(spanId) {
    return VALID_SPANID_REGEX.test(spanId) && spanId !== invalid_span_constants_1.INVALID_SPANID;
}
exports.isValidSpanId = isValidSpanId;
/**
 * Returns true if this {@link SpanContext} is valid.
 * @return true if this {@link SpanContext} is valid.
 */
function isSpanContextValid(spanContext) {
    return (isValidTraceId(spanContext.traceId) && isValidSpanId(spanContext.spanId));
}
exports.isSpanContextValid = isSpanContextValid;
/**
 * Wrap the given {@link SpanContext} in a new non-recording {@link Span}
 *
 * @param spanContext span context to be wrapped
 * @returns a new non-recording {@link Span} with the provided context
 */
function wrapSpanContext(spanContext) {
    return new NonRecordingSpan_1.NonRecordingSpan(spanContext);
}
exports.wrapSpanContext = wrapSpanContext;
//# sourceMappingURL=spancontext-utils.js.map

/***/ }),

/***/ 8845:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SpanStatusCode = void 0;
/**
 * An enumeration of status codes.
 */
var SpanStatusCode;
(function (SpanStatusCode) {
    /**
     * The default status.
     */
    SpanStatusCode[SpanStatusCode["UNSET"] = 0] = "UNSET";
    /**
     * The operation has been validated by an Application developer or
     * Operator to have completed successfully.
     */
    SpanStatusCode[SpanStatusCode["OK"] = 1] = "OK";
    /**
     * The operation contains an error.
     */
    SpanStatusCode[SpanStatusCode["ERROR"] = 2] = "ERROR";
})(SpanStatusCode = exports.SpanStatusCode || (exports.SpanStatusCode = {}));
//# sourceMappingURL=status.js.map

/***/ }),

/***/ 6905:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TraceFlags = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var TraceFlags;
(function (TraceFlags) {
    /** Represents no flag set. */
    TraceFlags[TraceFlags["NONE"] = 0] = "NONE";
    /** Bit to represent whether trace is sampled in trace flags. */
    TraceFlags[TraceFlags["SAMPLED"] = 1] = "SAMPLED";
})(TraceFlags = exports.TraceFlags || (exports.TraceFlags = {}));
//# sourceMappingURL=trace_flags.js.map

/***/ }),

/***/ 8996:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.VERSION = '1.7.0';
//# sourceMappingURL=version.js.map

/***/ }),

/***/ 7959:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExportResultCode = void 0;
var ExportResultCode;
(function (ExportResultCode) {
    ExportResultCode[ExportResultCode["SUCCESS"] = 0] = "SUCCESS";
    ExportResultCode[ExportResultCode["FAILED"] = 1] = "FAILED";
})(ExportResultCode = exports.ExportResultCode || (exports.ExportResultCode = {}));
//# sourceMappingURL=ExportResult.js.map

/***/ }),

/***/ 6178:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BAGGAGE_MAX_TOTAL_LENGTH = exports.BAGGAGE_MAX_PER_NAME_VALUE_PAIRS = exports.BAGGAGE_MAX_NAME_VALUE_PAIRS = exports.BAGGAGE_HEADER = exports.BAGGAGE_ITEMS_SEPARATOR = exports.BAGGAGE_PROPERTIES_SEPARATOR = exports.BAGGAGE_KEY_PAIR_SEPARATOR = void 0;
exports.BAGGAGE_KEY_PAIR_SEPARATOR = '=';
exports.BAGGAGE_PROPERTIES_SEPARATOR = ';';
exports.BAGGAGE_ITEMS_SEPARATOR = ',';
// Name of the http header used to propagate the baggage
exports.BAGGAGE_HEADER = 'baggage';
// Maximum number of name-value pairs allowed by w3c spec
exports.BAGGAGE_MAX_NAME_VALUE_PAIRS = 180;
// Maximum number of bytes per a single name-value pair allowed by w3c spec
exports.BAGGAGE_MAX_PER_NAME_VALUE_PAIRS = 4096;
// Maximum total length of all name-value pairs allowed by w3c spec
exports.BAGGAGE_MAX_TOTAL_LENGTH = 8192;
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ 1476:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.W3CBaggagePropagator = void 0;
const api_1 = __nccwpck_require__(5163);
const suppress_tracing_1 = __nccwpck_require__(4463);
const constants_1 = __nccwpck_require__(6178);
const utils_1 = __nccwpck_require__(9884);
/**
 * Propagates {@link Baggage} through Context format propagation.
 *
 * Based on the Baggage specification:
 * https://w3c.github.io/baggage/
 */
class W3CBaggagePropagator {
    inject(context, carrier, setter) {
        const baggage = api_1.propagation.getBaggage(context);
        if (!baggage || (0, suppress_tracing_1.isTracingSuppressed)(context))
            return;
        const keyPairs = (0, utils_1.getKeyPairs)(baggage)
            .filter((pair) => {
            return pair.length <= constants_1.BAGGAGE_MAX_PER_NAME_VALUE_PAIRS;
        })
            .slice(0, constants_1.BAGGAGE_MAX_NAME_VALUE_PAIRS);
        const headerValue = (0, utils_1.serializeKeyPairs)(keyPairs);
        if (headerValue.length > 0) {
            setter.set(carrier, constants_1.BAGGAGE_HEADER, headerValue);
        }
    }
    extract(context, carrier, getter) {
        const headerValue = getter.get(carrier, constants_1.BAGGAGE_HEADER);
        const baggageString = Array.isArray(headerValue)
            ? headerValue.join(constants_1.BAGGAGE_ITEMS_SEPARATOR)
            : headerValue;
        if (!baggageString)
            return context;
        const baggage = {};
        if (baggageString.length === 0) {
            return context;
        }
        const pairs = baggageString.split(constants_1.BAGGAGE_ITEMS_SEPARATOR);
        pairs.forEach(entry => {
            const keyPair = (0, utils_1.parsePairKeyValue)(entry);
            if (keyPair) {
                const baggageEntry = { value: keyPair.value };
                if (keyPair.metadata) {
                    baggageEntry.metadata = keyPair.metadata;
                }
                baggage[keyPair.key] = baggageEntry;
            }
        });
        if (Object.entries(baggage).length === 0) {
            return context;
        }
        return api_1.propagation.setBaggage(context, api_1.propagation.createBaggage(baggage));
    }
    fields() {
        return [constants_1.BAGGAGE_HEADER];
    }
}
exports.W3CBaggagePropagator = W3CBaggagePropagator;
//# sourceMappingURL=W3CBaggagePropagator.js.map

/***/ }),

/***/ 9884:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseKeyPairsIntoRecord = exports.parsePairKeyValue = exports.getKeyPairs = exports.serializeKeyPairs = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const api_1 = __nccwpck_require__(5163);
const constants_1 = __nccwpck_require__(6178);
function serializeKeyPairs(keyPairs) {
    return keyPairs.reduce((hValue, current) => {
        const value = `${hValue}${hValue !== '' ? constants_1.BAGGAGE_ITEMS_SEPARATOR : ''}${current}`;
        return value.length > constants_1.BAGGAGE_MAX_TOTAL_LENGTH ? hValue : value;
    }, '');
}
exports.serializeKeyPairs = serializeKeyPairs;
function getKeyPairs(baggage) {
    return baggage.getAllEntries().map(([key, value]) => {
        let entry = `${encodeURIComponent(key)}=${encodeURIComponent(value.value)}`;
        // include opaque metadata if provided
        // NOTE: we intentionally don't URI-encode the metadata - that responsibility falls on the metadata implementation
        if (value.metadata !== undefined) {
            entry += constants_1.BAGGAGE_PROPERTIES_SEPARATOR + value.metadata.toString();
        }
        return entry;
    });
}
exports.getKeyPairs = getKeyPairs;
function parsePairKeyValue(entry) {
    const valueProps = entry.split(constants_1.BAGGAGE_PROPERTIES_SEPARATOR);
    if (valueProps.length <= 0)
        return;
    const keyPairPart = valueProps.shift();
    if (!keyPairPart)
        return;
    const separatorIndex = keyPairPart.indexOf(constants_1.BAGGAGE_KEY_PAIR_SEPARATOR);
    if (separatorIndex <= 0)
        return;
    const key = decodeURIComponent(keyPairPart.substring(0, separatorIndex).trim());
    const value = decodeURIComponent(keyPairPart.substring(separatorIndex + 1).trim());
    let metadata;
    if (valueProps.length > 0) {
        metadata = (0, api_1.baggageEntryMetadataFromString)(valueProps.join(constants_1.BAGGAGE_PROPERTIES_SEPARATOR));
    }
    return { key, value, metadata };
}
exports.parsePairKeyValue = parsePairKeyValue;
/**
 * Parse a string serialized in the baggage HTTP Format (without metadata):
 * https://github.com/w3c/baggage/blob/master/baggage/HTTP_HEADER_FORMAT.md
 */
function parseKeyPairsIntoRecord(value) {
    if (typeof value !== 'string' || value.length === 0)
        return {};
    return value
        .split(constants_1.BAGGAGE_ITEMS_SEPARATOR)
        .map(entry => {
        return parsePairKeyValue(entry);
    })
        .filter(keyPair => keyPair !== undefined && keyPair.value.length > 0)
        .reduce((headers, keyPair) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        headers[keyPair.key] = keyPair.value;
        return headers;
    }, {});
}
exports.parseKeyPairsIntoRecord = parseKeyPairsIntoRecord;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 4848:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnchoredClock = void 0;
/**
 * A utility for returning wall times anchored to a given point in time. Wall time measurements will
 * not be taken from the system, but instead are computed by adding a monotonic clock time
 * to the anchor point.
 *
 * This is needed because the system time can change and result in unexpected situations like
 * spans ending before they are started. Creating an anchored clock for each local root span
 * ensures that span timings and durations are accurate while preventing span times from drifting
 * too far from the system clock.
 *
 * Only creating an anchored clock once per local trace ensures span times are correct relative
 * to each other. For example, a child span will never have a start time before its parent even
 * if the system clock is corrected during the local trace.
 *
 * Heavily inspired by the OTel Java anchored clock
 * https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk/trace/src/main/java/io/opentelemetry/sdk/trace/AnchoredClock.java
 */
class AnchoredClock {
    /**
     * Create a new AnchoredClock anchored to the current time returned by systemClock.
     *
     * @param systemClock should be a clock that returns the number of milliseconds since January 1 1970 such as Date
     * @param monotonicClock should be a clock that counts milliseconds monotonically such as window.performance or perf_hooks.performance
     */
    constructor(systemClock, monotonicClock) {
        this._monotonicClock = monotonicClock;
        this._epochMillis = systemClock.now();
        this._performanceMillis = monotonicClock.now();
    }
    /**
     * Returns the current time by adding the number of milliseconds since the
     * AnchoredClock was created to the creation epoch time
     */
    now() {
        const delta = this._monotonicClock.now() - this._performanceMillis;
        return this._epochMillis + delta;
    }
}
exports.AnchoredClock = AnchoredClock;
//# sourceMappingURL=anchored-clock.js.map

/***/ }),

/***/ 2807:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isAttributeValue = exports.isAttributeKey = exports.sanitizeAttributes = void 0;
const api_1 = __nccwpck_require__(5163);
function sanitizeAttributes(attributes) {
    const out = {};
    if (typeof attributes !== 'object' || attributes == null) {
        return out;
    }
    for (const [key, val] of Object.entries(attributes)) {
        if (!isAttributeKey(key)) {
            api_1.diag.warn(`Invalid attribute key: ${key}`);
            continue;
        }
        if (!isAttributeValue(val)) {
            api_1.diag.warn(`Invalid attribute value set for key: ${key}`);
            continue;
        }
        if (Array.isArray(val)) {
            out[key] = val.slice();
        }
        else {
            out[key] = val;
        }
    }
    return out;
}
exports.sanitizeAttributes = sanitizeAttributes;
function isAttributeKey(key) {
    return typeof key === 'string' && key.length > 0;
}
exports.isAttributeKey = isAttributeKey;
function isAttributeValue(val) {
    if (val == null) {
        return true;
    }
    if (Array.isArray(val)) {
        return isHomogeneousAttributeValueArray(val);
    }
    return isValidPrimitiveAttributeValue(val);
}
exports.isAttributeValue = isAttributeValue;
function isHomogeneousAttributeValueArray(arr) {
    let type;
    for (const element of arr) {
        // null/undefined elements are allowed
        if (element == null)
            continue;
        if (!type) {
            if (isValidPrimitiveAttributeValue(element)) {
                type = typeof element;
                continue;
            }
            // encountered an invalid primitive
            return false;
        }
        if (typeof element === type) {
            continue;
        }
        return false;
    }
    return true;
}
function isValidPrimitiveAttributeValue(val) {
    switch (typeof val) {
        case 'number':
        case 'boolean':
        case 'string':
            return true;
    }
    return false;
}
//# sourceMappingURL=attributes.js.map

/***/ }),

/***/ 9246:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.globalErrorHandler = exports.setGlobalErrorHandler = void 0;
const logging_error_handler_1 = __nccwpck_require__(2882);
/** The global error handler delegate */
let delegateHandler = (0, logging_error_handler_1.loggingErrorHandler)();
/**
 * Set the global error handler
 * @param {ErrorHandler} handler
 */
function setGlobalErrorHandler(handler) {
    delegateHandler = handler;
}
exports.setGlobalErrorHandler = setGlobalErrorHandler;
/**
 * Return the global error handler
 * @param {Exception} ex
 */
function globalErrorHandler(ex) {
    try {
        delegateHandler(ex);
    }
    catch (_a) { } // eslint-disable-line no-empty
}
exports.globalErrorHandler = globalErrorHandler;
//# sourceMappingURL=global-error-handler.js.map

/***/ }),

/***/ 4986:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.hexToBinary = void 0;
function intValue(charCode) {
    // 0-9
    if (charCode >= 48 && charCode <= 57) {
        return charCode - 48;
    }
    // a-f
    if (charCode >= 97 && charCode <= 102) {
        return charCode - 87;
    }
    // A-F
    return charCode - 55;
}
function hexToBinary(hexStr) {
    const buf = new Uint8Array(hexStr.length / 2);
    let offset = 0;
    for (let i = 0; i < hexStr.length; i += 2) {
        const hi = intValue(hexStr.charCodeAt(i));
        const lo = intValue(hexStr.charCodeAt(i + 1));
        buf[offset++] = (hi << 4) | lo;
    }
    return buf;
}
exports.hexToBinary = hexToBinary;
//# sourceMappingURL=hex-to-binary.js.map

/***/ }),

/***/ 2882:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.loggingErrorHandler = void 0;
const api_1 = __nccwpck_require__(5163);
/**
 * Returns a function that logs an error using the provided logger, or a
 * console logger if one was not provided.
 */
function loggingErrorHandler() {
    return (ex) => {
        api_1.diag.error(stringifyException(ex));
    };
}
exports.loggingErrorHandler = loggingErrorHandler;
/**
 * Converts an exception into a string representation
 * @param {Exception} ex
 */
function stringifyException(ex) {
    if (typeof ex === 'string') {
        return ex;
    }
    else {
        return JSON.stringify(flattenException(ex));
    }
}
/**
 * Flattens an exception into key-value pairs by traversing the prototype chain
 * and coercing values to strings. Duplicate properties will not be overwritten;
 * the first insert wins.
 */
function flattenException(ex) {
    const result = {};
    let current = ex;
    while (current !== null) {
        Object.getOwnPropertyNames(current).forEach(propertyName => {
            if (result[propertyName])
                return;
            const value = current[propertyName];
            if (value) {
                result[propertyName] = String(value);
            }
        });
        current = Object.getPrototypeOf(current);
    }
    return result;
}
//# sourceMappingURL=logging-error-handler.js.map

/***/ }),

/***/ 6161:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addHrTimes = exports.isTimeInput = exports.isTimeInputHrTime = exports.hrTimeToMicroseconds = exports.hrTimeToMilliseconds = exports.hrTimeToNanoseconds = exports.hrTimeToTimeStamp = exports.hrTimeDuration = exports.timeInputToHrTime = exports.hrTime = exports.getTimeOrigin = exports.millisToHrTime = void 0;
const platform_1 = __nccwpck_require__(6730);
const NANOSECOND_DIGITS = 9;
const NANOSECOND_DIGITS_IN_MILLIS = 6;
const MILLISECONDS_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS_IN_MILLIS);
const SECOND_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS);
/**
 * Converts a number of milliseconds from epoch to HrTime([seconds, remainder in nanoseconds]).
 * @param epochMillis
 */
function millisToHrTime(epochMillis) {
    const epochSeconds = epochMillis / 1000;
    // Decimals only.
    const seconds = Math.trunc(epochSeconds);
    // Round sub-nanosecond accuracy to nanosecond.
    const nanos = Math.round((epochMillis % 1000) * MILLISECONDS_TO_NANOSECONDS);
    return [seconds, nanos];
}
exports.millisToHrTime = millisToHrTime;
function getTimeOrigin() {
    let timeOrigin = platform_1.otperformance.timeOrigin;
    if (typeof timeOrigin !== 'number') {
        const perf = platform_1.otperformance;
        timeOrigin = perf.timing && perf.timing.fetchStart;
    }
    return timeOrigin;
}
exports.getTimeOrigin = getTimeOrigin;
/**
 * Returns an hrtime calculated via performance component.
 * @param performanceNow
 */
function hrTime(performanceNow) {
    const timeOrigin = millisToHrTime(getTimeOrigin());
    const now = millisToHrTime(typeof performanceNow === 'number' ? performanceNow : platform_1.otperformance.now());
    return addHrTimes(timeOrigin, now);
}
exports.hrTime = hrTime;
/**
 *
 * Converts a TimeInput to an HrTime, defaults to _hrtime().
 * @param time
 */
function timeInputToHrTime(time) {
    // process.hrtime
    if (isTimeInputHrTime(time)) {
        return time;
    }
    else if (typeof time === 'number') {
        // Must be a performance.now() if it's smaller than process start time.
        if (time < getTimeOrigin()) {
            return hrTime(time);
        }
        else {
            // epoch milliseconds or performance.timeOrigin
            return millisToHrTime(time);
        }
    }
    else if (time instanceof Date) {
        return millisToHrTime(time.getTime());
    }
    else {
        throw TypeError('Invalid input type');
    }
}
exports.timeInputToHrTime = timeInputToHrTime;
/**
 * Returns a duration of two hrTime.
 * @param startTime
 * @param endTime
 */
function hrTimeDuration(startTime, endTime) {
    let seconds = endTime[0] - startTime[0];
    let nanos = endTime[1] - startTime[1];
    // overflow
    if (nanos < 0) {
        seconds -= 1;
        // negate
        nanos += SECOND_TO_NANOSECONDS;
    }
    return [seconds, nanos];
}
exports.hrTimeDuration = hrTimeDuration;
/**
 * Convert hrTime to timestamp, for example "2019-05-14T17:00:00.000123456Z"
 * @param time
 */
function hrTimeToTimeStamp(time) {
    const precision = NANOSECOND_DIGITS;
    const tmp = `${'0'.repeat(precision)}${time[1]}Z`;
    const nanoString = tmp.substr(tmp.length - precision - 1);
    const date = new Date(time[0] * 1000).toISOString();
    return date.replace('000Z', nanoString);
}
exports.hrTimeToTimeStamp = hrTimeToTimeStamp;
/**
 * Convert hrTime to nanoseconds.
 * @param time
 */
function hrTimeToNanoseconds(time) {
    return time[0] * SECOND_TO_NANOSECONDS + time[1];
}
exports.hrTimeToNanoseconds = hrTimeToNanoseconds;
/**
 * Convert hrTime to milliseconds.
 * @param time
 */
function hrTimeToMilliseconds(time) {
    return time[0] * 1e3 + time[1] / 1e6;
}
exports.hrTimeToMilliseconds = hrTimeToMilliseconds;
/**
 * Convert hrTime to microseconds.
 * @param time
 */
function hrTimeToMicroseconds(time) {
    return time[0] * 1e6 + time[1] / 1e3;
}
exports.hrTimeToMicroseconds = hrTimeToMicroseconds;
/**
 * check if time is HrTime
 * @param value
 */
function isTimeInputHrTime(value) {
    return (Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === 'number' &&
        typeof value[1] === 'number');
}
exports.isTimeInputHrTime = isTimeInputHrTime;
/**
 * check if input value is a correct types.TimeInput
 * @param value
 */
function isTimeInput(value) {
    return (isTimeInputHrTime(value) ||
        typeof value === 'number' ||
        value instanceof Date);
}
exports.isTimeInput = isTimeInput;
/**
 * Given 2 HrTime formatted times, return their sum as an HrTime.
 */
function addHrTimes(time1, time2) {
    const out = [time1[0] + time2[0], time1[1] + time2[1]];
    // Nanoseconds
    if (out[1] >= SECOND_TO_NANOSECONDS) {
        out[1] -= SECOND_TO_NANOSECONDS;
        out[0] += 1;
    }
    return out;
}
exports.addHrTimes = addHrTimes;
//# sourceMappingURL=time.js.map

/***/ }),

/***/ 7342:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=types.js.map

/***/ }),

/***/ 9736:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.internal = exports.baggageUtils = void 0;
__exportStar(__nccwpck_require__(1476), exports);
__exportStar(__nccwpck_require__(4848), exports);
__exportStar(__nccwpck_require__(2807), exports);
__exportStar(__nccwpck_require__(9246), exports);
__exportStar(__nccwpck_require__(2882), exports);
__exportStar(__nccwpck_require__(6161), exports);
__exportStar(__nccwpck_require__(7342), exports);
__exportStar(__nccwpck_require__(4986), exports);
__exportStar(__nccwpck_require__(7959), exports);
exports.baggageUtils = __nccwpck_require__(9884);
__exportStar(__nccwpck_require__(6730), exports);
__exportStar(__nccwpck_require__(7785), exports);
__exportStar(__nccwpck_require__(1463), exports);
__exportStar(__nccwpck_require__(231), exports);
__exportStar(__nccwpck_require__(2992), exports);
__exportStar(__nccwpck_require__(6478), exports);
__exportStar(__nccwpck_require__(8317), exports);
__exportStar(__nccwpck_require__(5136), exports);
__exportStar(__nccwpck_require__(9326), exports);
__exportStar(__nccwpck_require__(4463), exports);
__exportStar(__nccwpck_require__(1914), exports);
__exportStar(__nccwpck_require__(7238), exports);
__exportStar(__nccwpck_require__(5387), exports);
__exportStar(__nccwpck_require__(8289), exports);
__exportStar(__nccwpck_require__(8400), exports);
__exportStar(__nccwpck_require__(839), exports);
__exportStar(__nccwpck_require__(7226), exports);
__exportStar(__nccwpck_require__(2408), exports);
__exportStar(__nccwpck_require__(5687), exports);
const exporter_1 = __nccwpck_require__(7795);
exports.internal = {
    _export: exporter_1._export,
};
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 7795:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports._export = void 0;
const api_1 = __nccwpck_require__(5163);
const suppress_tracing_1 = __nccwpck_require__(4463);
/**
 * @internal
 * Shared functionality used by Exporters while exporting data, including suppresion of Traces.
 */
function _export(exporter, arg) {
    return new Promise(resolve => {
        // prevent downstream exporter calls from generating spans
        api_1.context.with((0, suppress_tracing_1.suppressTracing)(api_1.context.active()), () => {
            exporter.export(arg, (result) => {
                resolve(result);
            });
        });
    });
}
exports._export = _export;
//# sourceMappingURL=exporter.js.map

/***/ }),

/***/ 6242:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateValue = exports.validateKey = void 0;
const VALID_KEY_CHAR_RANGE = '[_0-9a-z-*/]';
const VALID_KEY = `[a-z]${VALID_KEY_CHAR_RANGE}{0,255}`;
const VALID_VENDOR_KEY = `[a-z0-9]${VALID_KEY_CHAR_RANGE}{0,240}@[a-z]${VALID_KEY_CHAR_RANGE}{0,13}`;
const VALID_KEY_REGEX = new RegExp(`^(?:${VALID_KEY}|${VALID_VENDOR_KEY})$`);
const VALID_VALUE_BASE_REGEX = /^[ -~]{0,255}[!-~]$/;
const INVALID_VALUE_COMMA_EQUAL_REGEX = /,|=/;
/**
 * Key is opaque string up to 256 characters printable. It MUST begin with a
 * lowercase letter, and can only contain lowercase letters a-z, digits 0-9,
 * underscores _, dashes -, asterisks *, and forward slashes /.
 * For multi-tenant vendor scenarios, an at sign (@) can be used to prefix the
 * vendor name. Vendors SHOULD set the tenant ID at the beginning of the key.
 * see https://www.w3.org/TR/trace-context/#key
 */
function validateKey(key) {
    return VALID_KEY_REGEX.test(key);
}
exports.validateKey = validateKey;
/**
 * Value is opaque string up to 256 characters printable ASCII RFC0020
 * characters (i.e., the range 0x20 to 0x7E) except comma , and =.
 */
function validateValue(value) {
    return (VALID_VALUE_BASE_REGEX.test(value) &&
        !INVALID_VALUE_COMMA_EQUAL_REGEX.test(value));
}
exports.validateValue = validateValue;
//# sourceMappingURL=validators.js.map

/***/ }),

/***/ 2490:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports._globalThis = void 0;
// Updates to this file should also be replicated to @opentelemetry/api too.
/**
 * - globalThis (New standard)
 * - self (Will return the current window instance for supported browsers)
 * - window (fallback for older browser implementations)
 * - global (NodeJS implementation)
 * - <object> (When all else fails)
 */
/** only globals that common to node and browsers are allowed */
// eslint-disable-next-line node/no-unsupported-features/es-builtins, no-undef
exports._globalThis = typeof globalThis === 'object'
    ? globalThis
    : typeof self === 'object'
        ? self
        : typeof window === 'object'
            ? window
            : typeof global === 'object'
                ? global
                : {};
//# sourceMappingURL=globalThis.js.map

/***/ }),

/***/ 6730:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
__exportStar(__nccwpck_require__(9340), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 5476:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RandomIdGenerator = void 0;
const SPAN_ID_BYTES = 8;
const TRACE_ID_BYTES = 16;
/**
 * @deprecated Use the one defined in @opentelemetry/sdk-trace-base instead.
 */
class RandomIdGenerator {
    constructor() {
        /**
         * Returns a random 16-byte trace ID formatted/encoded as a 32 lowercase hex
         * characters corresponding to 128 bits.
         */
        this.generateTraceId = getIdGenerator(TRACE_ID_BYTES);
        /**
         * Returns a random 8-byte span ID formatted/encoded as a 16 lowercase hex
         * characters corresponding to 64 bits.
         */
        this.generateSpanId = getIdGenerator(SPAN_ID_BYTES);
    }
}
exports.RandomIdGenerator = RandomIdGenerator;
const SHARED_BUFFER = Buffer.allocUnsafe(TRACE_ID_BYTES);
function getIdGenerator(bytes) {
    return function generateId() {
        for (let i = 0; i < bytes / 4; i++) {
            // unsigned right shift drops decimal part of the number
            // it is required because if a number between 2**32 and 2**32 - 1 is generated, an out of range error is thrown by writeUInt32BE
            SHARED_BUFFER.writeUInt32BE((Math.random() * 2 ** 32) >>> 0, i * 4);
        }
        // If buffer is all 0, set the last byte to 1 to guarantee a valid w3c id is generated
        for (let i = 0; i < bytes; i++) {
            if (SHARED_BUFFER[i] > 0) {
                break;
            }
            else if (i === bytes - 1) {
                SHARED_BUFFER[bytes - 1] = 1;
            }
        }
        return SHARED_BUFFER.toString('hex', 0, bytes);
    };
}
//# sourceMappingURL=RandomIdGenerator.js.map

/***/ }),

/***/ 6494:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getEnv = void 0;
const environment_1 = __nccwpck_require__(7238);
/**
 * Gets the environment variables
 */
function getEnv() {
    const processEnv = (0, environment_1.parseEnvironment)(process.env);
    return Object.assign({}, environment_1.DEFAULT_ENVIRONMENT, processEnv);
}
exports.getEnv = getEnv;
//# sourceMappingURL=environment.js.map

/***/ }),

/***/ 7196:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports._globalThis = void 0;
/** only globals that common to node and browsers are allowed */
// eslint-disable-next-line node/no-unsupported-features/es-builtins
exports._globalThis = typeof globalThis === 'object' ? globalThis : global;
//# sourceMappingURL=globalThis.js.map

/***/ }),

/***/ 5004:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.hexToBase64 = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const hex_to_binary_1 = __nccwpck_require__(4986);
function hexToBase64(hexStr) {
    return Buffer.from((0, hex_to_binary_1.hexToBinary)(hexStr)).toString('base64');
}
exports.hexToBase64 = hexToBase64;
//# sourceMappingURL=hex-to-base64.js.map

/***/ }),

/***/ 9340:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(6494), exports);
__exportStar(__nccwpck_require__(7196), exports);
__exportStar(__nccwpck_require__(5004), exports);
__exportStar(__nccwpck_require__(5476), exports);
__exportStar(__nccwpck_require__(9338), exports);
__exportStar(__nccwpck_require__(265), exports);
__exportStar(__nccwpck_require__(1027), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 9338:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.otperformance = void 0;
const perf_hooks_1 = __nccwpck_require__(4074);
exports.otperformance = perf_hooks_1.performance;
//# sourceMappingURL=performance.js.map

/***/ }),

/***/ 265:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SDK_INFO = void 0;
const version_1 = __nccwpck_require__(5687);
const semantic_conventions_1 = __nccwpck_require__(7275);
/** Constants describing the SDK in use */
exports.SDK_INFO = {
    [semantic_conventions_1.SemanticResourceAttributes.TELEMETRY_SDK_NAME]: 'opentelemetry',
    [semantic_conventions_1.SemanticResourceAttributes.PROCESS_RUNTIME_NAME]: 'node',
    [semantic_conventions_1.SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE]: semantic_conventions_1.TelemetrySdkLanguageValues.NODEJS,
    [semantic_conventions_1.SemanticResourceAttributes.TELEMETRY_SDK_VERSION]: version_1.VERSION,
};
//# sourceMappingURL=sdk-info.js.map

/***/ }),

/***/ 1027:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.unrefTimer = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function unrefTimer(timer) {
    timer.unref();
}
exports.unrefTimer = unrefTimer;
//# sourceMappingURL=timer-util.js.map

/***/ }),

/***/ 7785:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CompositePropagator = void 0;
const api_1 = __nccwpck_require__(5163);
/** Combines multiple propagators into a single propagator. */
class CompositePropagator {
    /**
     * Construct a composite propagator from a list of propagators.
     *
     * @param [config] Configuration object for composite propagator
     */
    constructor(config = {}) {
        var _a;
        this._propagators = (_a = config.propagators) !== null && _a !== void 0 ? _a : [];
        this._fields = Array.from(new Set(this._propagators
            // older propagators may not have fields function, null check to be sure
            .map(p => (typeof p.fields === 'function' ? p.fields() : []))
            .reduce((x, y) => x.concat(y), [])));
    }
    /**
     * Run each of the configured propagators with the given context and carrier.
     * Propagators are run in the order they are configured, so if multiple
     * propagators write the same carrier key, the propagator later in the list
     * will "win".
     *
     * @param context Context to inject
     * @param carrier Carrier into which context will be injected
     */
    inject(context, carrier, setter) {
        for (const propagator of this._propagators) {
            try {
                propagator.inject(context, carrier, setter);
            }
            catch (err) {
                api_1.diag.warn(`Failed to inject with ${propagator.constructor.name}. Err: ${err.message}`);
            }
        }
    }
    /**
     * Run each of the configured propagators with the given context and carrier.
     * Propagators are run in the order they are configured, so if multiple
     * propagators write the same context key, the propagator later in the list
     * will "win".
     *
     * @param context Context to add values to
     * @param carrier Carrier from which to extract context
     */
    extract(context, carrier, getter) {
        return this._propagators.reduce((ctx, propagator) => {
            try {
                return propagator.extract(ctx, carrier, getter);
            }
            catch (err) {
                api_1.diag.warn(`Failed to inject with ${propagator.constructor.name}. Err: ${err.message}`);
            }
            return ctx;
        }, context);
    }
    fields() {
        // return a new array so our fields cannot be modified
        return this._fields.slice();
    }
}
exports.CompositePropagator = CompositePropagator;
//# sourceMappingURL=composite.js.map

/***/ }),

/***/ 231:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=IdGenerator.js.map

/***/ }),

/***/ 1914:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TraceState = void 0;
const validators_1 = __nccwpck_require__(6242);
const MAX_TRACE_STATE_ITEMS = 32;
const MAX_TRACE_STATE_LEN = 512;
const LIST_MEMBERS_SEPARATOR = ',';
const LIST_MEMBER_KEY_VALUE_SPLITTER = '=';
/**
 * TraceState must be a class and not a simple object type because of the spec
 * requirement (https://www.w3.org/TR/trace-context/#tracestate-field).
 *
 * Here is the list of allowed mutations:
 * - New key-value pair should be added into the beginning of the list
 * - The value of any key can be updated. Modified keys MUST be moved to the
 * beginning of the list.
 */
class TraceState {
    constructor(rawTraceState) {
        this._internalState = new Map();
        if (rawTraceState)
            this._parse(rawTraceState);
    }
    set(key, value) {
        // TODO: Benchmark the different approaches(map vs list) and
        // use the faster one.
        const traceState = this._clone();
        if (traceState._internalState.has(key)) {
            traceState._internalState.delete(key);
        }
        traceState._internalState.set(key, value);
        return traceState;
    }
    unset(key) {
        const traceState = this._clone();
        traceState._internalState.delete(key);
        return traceState;
    }
    get(key) {
        return this._internalState.get(key);
    }
    serialize() {
        return this._keys()
            .reduce((agg, key) => {
            agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER + this.get(key));
            return agg;
        }, [])
            .join(LIST_MEMBERS_SEPARATOR);
    }
    _parse(rawTraceState) {
        if (rawTraceState.length > MAX_TRACE_STATE_LEN)
            return;
        this._internalState = rawTraceState
            .split(LIST_MEMBERS_SEPARATOR)
            .reverse() // Store in reverse so new keys (.set(...)) will be placed at the beginning
            .reduce((agg, part) => {
            const listMember = part.trim(); // Optional Whitespace (OWS) handling
            const i = listMember.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
            if (i !== -1) {
                const key = listMember.slice(0, i);
                const value = listMember.slice(i + 1, part.length);
                if ((0, validators_1.validateKey)(key) && (0, validators_1.validateValue)(value)) {
                    agg.set(key, value);
                }
                else {
                    // TODO: Consider to add warning log
                }
            }
            return agg;
        }, new Map());
        // Because of the reverse() requirement, trunc must be done after map is created
        if (this._internalState.size > MAX_TRACE_STATE_ITEMS) {
            this._internalState = new Map(Array.from(this._internalState.entries())
                .reverse() // Use reverse same as original tracestate parse chain
                .slice(0, MAX_TRACE_STATE_ITEMS));
        }
    }
    _keys() {
        return Array.from(this._internalState.keys()).reverse();
    }
    _clone() {
        const traceState = new TraceState();
        traceState._internalState = new Map(this._internalState);
        return traceState;
    }
}
exports.TraceState = TraceState;
//# sourceMappingURL=TraceState.js.map

/***/ }),

/***/ 1463:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.W3CTraceContextPropagator = exports.parseTraceParent = exports.TRACE_STATE_HEADER = exports.TRACE_PARENT_HEADER = void 0;
const api_1 = __nccwpck_require__(5163);
const suppress_tracing_1 = __nccwpck_require__(4463);
const TraceState_1 = __nccwpck_require__(1914);
exports.TRACE_PARENT_HEADER = 'traceparent';
exports.TRACE_STATE_HEADER = 'tracestate';
const VERSION = '00';
const VERSION_PART = '(?!ff)[\\da-f]{2}';
const TRACE_ID_PART = '(?![0]{32})[\\da-f]{32}';
const PARENT_ID_PART = '(?![0]{16})[\\da-f]{16}';
const FLAGS_PART = '[\\da-f]{2}';
const TRACE_PARENT_REGEX = new RegExp(`^\\s?(${VERSION_PART})-(${TRACE_ID_PART})-(${PARENT_ID_PART})-(${FLAGS_PART})(-.*)?\\s?$`);
/**
 * Parses information from the [traceparent] span tag and converts it into {@link SpanContext}
 * @param traceParent - A meta property that comes from server.
 *     It should be dynamically generated server side to have the server's request trace Id,
 *     a parent span Id that was set on the server's request span,
 *     and the trace flags to indicate the server's sampling decision
 *     (01 = sampled, 00 = not sampled).
 *     for example: '{version}-{traceId}-{spanId}-{sampleDecision}'
 *     For more information see {@link https://www.w3.org/TR/trace-context/}
 */
function parseTraceParent(traceParent) {
    const match = TRACE_PARENT_REGEX.exec(traceParent);
    if (!match)
        return null;
    // According to the specification the implementation should be compatible
    // with future versions. If there are more parts, we only reject it if it's using version 00
    // See https://www.w3.org/TR/trace-context/#versioning-of-traceparent
    if (match[1] === '00' && match[5])
        return null;
    return {
        traceId: match[2],
        spanId: match[3],
        traceFlags: parseInt(match[4], 16),
    };
}
exports.parseTraceParent = parseTraceParent;
/**
 * Propagates {@link SpanContext} through Trace Context format propagation.
 *
 * Based on the Trace Context specification:
 * https://www.w3.org/TR/trace-context/
 */
class W3CTraceContextPropagator {
    inject(context, carrier, setter) {
        const spanContext = api_1.trace.getSpanContext(context);
        if (!spanContext ||
            (0, suppress_tracing_1.isTracingSuppressed)(context) ||
            !(0, api_1.isSpanContextValid)(spanContext))
            return;
        const traceParent = `${VERSION}-${spanContext.traceId}-${spanContext.spanId}-0${Number(spanContext.traceFlags || api_1.TraceFlags.NONE).toString(16)}`;
        setter.set(carrier, exports.TRACE_PARENT_HEADER, traceParent);
        if (spanContext.traceState) {
            setter.set(carrier, exports.TRACE_STATE_HEADER, spanContext.traceState.serialize());
        }
    }
    extract(context, carrier, getter) {
        const traceParentHeader = getter.get(carrier, exports.TRACE_PARENT_HEADER);
        if (!traceParentHeader)
            return context;
        const traceParent = Array.isArray(traceParentHeader)
            ? traceParentHeader[0]
            : traceParentHeader;
        if (typeof traceParent !== 'string')
            return context;
        const spanContext = parseTraceParent(traceParent);
        if (!spanContext)
            return context;
        spanContext.isRemote = true;
        const traceStateHeader = getter.get(carrier, exports.TRACE_STATE_HEADER);
        if (traceStateHeader) {
            // If more than one `tracestate` header is found, we merge them into a
            // single header.
            const state = Array.isArray(traceStateHeader)
                ? traceStateHeader.join(',')
                : traceStateHeader;
            spanContext.traceState = new TraceState_1.TraceState(typeof state === 'string' ? state : undefined);
        }
        return api_1.trace.setSpanContext(context, spanContext);
    }
    fields() {
        return [exports.TRACE_PARENT_HEADER, exports.TRACE_STATE_HEADER];
    }
}
exports.W3CTraceContextPropagator = W3CTraceContextPropagator;
//# sourceMappingURL=W3CTraceContextPropagator.js.map

/***/ }),

/***/ 2992:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getRPCMetadata = exports.deleteRPCMetadata = exports.setRPCMetadata = exports.RPCType = void 0;
const api_1 = __nccwpck_require__(5163);
const RPC_METADATA_KEY = (0, api_1.createContextKey)('OpenTelemetry SDK Context Key RPC_METADATA');
var RPCType;
(function (RPCType) {
    RPCType["HTTP"] = "http";
})(RPCType = exports.RPCType || (exports.RPCType = {}));
function setRPCMetadata(context, meta) {
    return context.setValue(RPC_METADATA_KEY, meta);
}
exports.setRPCMetadata = setRPCMetadata;
function deleteRPCMetadata(context) {
    return context.deleteValue(RPC_METADATA_KEY);
}
exports.deleteRPCMetadata = deleteRPCMetadata;
function getRPCMetadata(context) {
    return context.getValue(RPC_METADATA_KEY);
}
exports.getRPCMetadata = getRPCMetadata;
//# sourceMappingURL=rpc-metadata.js.map

/***/ }),

/***/ 6478:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AlwaysOffSampler = void 0;
const api_1 = __nccwpck_require__(5163);
/**
 * @deprecated Use the one defined in @opentelemetry/sdk-trace-base instead.
 * Sampler that samples no traces.
 */
class AlwaysOffSampler {
    shouldSample() {
        return {
            decision: api_1.SamplingDecision.NOT_RECORD,
        };
    }
    toString() {
        return 'AlwaysOffSampler';
    }
}
exports.AlwaysOffSampler = AlwaysOffSampler;
//# sourceMappingURL=AlwaysOffSampler.js.map

/***/ }),

/***/ 8317:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AlwaysOnSampler = void 0;
const api_1 = __nccwpck_require__(5163);
/**
 * @deprecated Use the one defined in @opentelemetry/sdk-trace-base instead.
 * Sampler that samples all traces.
 */
class AlwaysOnSampler {
    shouldSample() {
        return {
            decision: api_1.SamplingDecision.RECORD_AND_SAMPLED,
        };
    }
    toString() {
        return 'AlwaysOnSampler';
    }
}
exports.AlwaysOnSampler = AlwaysOnSampler;
//# sourceMappingURL=AlwaysOnSampler.js.map

/***/ }),

/***/ 5136:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ParentBasedSampler = void 0;
const api_1 = __nccwpck_require__(5163);
const global_error_handler_1 = __nccwpck_require__(9246);
const AlwaysOffSampler_1 = __nccwpck_require__(6478);
const AlwaysOnSampler_1 = __nccwpck_require__(8317);
/**
 * @deprecated Use the one defined in @opentelemetry/sdk-trace-base instead.
 * A composite sampler that either respects the parent span's sampling decision
 * or delegates to `delegateSampler` for root spans.
 */
class ParentBasedSampler {
    constructor(config) {
        var _a, _b, _c, _d;
        this._root = config.root;
        if (!this._root) {
            (0, global_error_handler_1.globalErrorHandler)(new Error('ParentBasedSampler must have a root sampler configured'));
            this._root = new AlwaysOnSampler_1.AlwaysOnSampler();
        }
        this._remoteParentSampled =
            (_a = config.remoteParentSampled) !== null && _a !== void 0 ? _a : new AlwaysOnSampler_1.AlwaysOnSampler();
        this._remoteParentNotSampled =
            (_b = config.remoteParentNotSampled) !== null && _b !== void 0 ? _b : new AlwaysOffSampler_1.AlwaysOffSampler();
        this._localParentSampled =
            (_c = config.localParentSampled) !== null && _c !== void 0 ? _c : new AlwaysOnSampler_1.AlwaysOnSampler();
        this._localParentNotSampled =
            (_d = config.localParentNotSampled) !== null && _d !== void 0 ? _d : new AlwaysOffSampler_1.AlwaysOffSampler();
    }
    shouldSample(context, traceId, spanName, spanKind, attributes, links) {
        const parentContext = api_1.trace.getSpanContext(context);
        if (!parentContext || !(0, api_1.isSpanContextValid)(parentContext)) {
            return this._root.shouldSample(context, traceId, spanName, spanKind, attributes, links);
        }
        if (parentContext.isRemote) {
            if (parentContext.traceFlags & api_1.TraceFlags.SAMPLED) {
                return this._remoteParentSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
            }
            return this._remoteParentNotSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
        }
        if (parentContext.traceFlags & api_1.TraceFlags.SAMPLED) {
            return this._localParentSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
        }
        return this._localParentNotSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
    }
    toString() {
        return `ParentBased{root=${this._root.toString()}, remoteParentSampled=${this._remoteParentSampled.toString()}, remoteParentNotSampled=${this._remoteParentNotSampled.toString()}, localParentSampled=${this._localParentSampled.toString()}, localParentNotSampled=${this._localParentNotSampled.toString()}}`;
    }
}
exports.ParentBasedSampler = ParentBasedSampler;
//# sourceMappingURL=ParentBasedSampler.js.map

/***/ }),

/***/ 9326:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TraceIdRatioBasedSampler = void 0;
const api_1 = __nccwpck_require__(5163);
/**
 * @deprecated Use the one defined in @opentelemetry/sdk-trace-base instead.
 * Sampler that samples a given fraction of traces based of trace id deterministically.
 */
class TraceIdRatioBasedSampler {
    constructor(_ratio = 0) {
        this._ratio = _ratio;
        this._ratio = this._normalize(_ratio);
        this._upperBound = Math.floor(this._ratio * 0xffffffff);
    }
    shouldSample(context, traceId) {
        return {
            decision: (0, api_1.isValidTraceId)(traceId) && this._accumulate(traceId) < this._upperBound
                ? api_1.SamplingDecision.RECORD_AND_SAMPLED
                : api_1.SamplingDecision.NOT_RECORD,
        };
    }
    toString() {
        return `TraceIdRatioBased{${this._ratio}}`;
    }
    _normalize(ratio) {
        if (typeof ratio !== 'number' || isNaN(ratio))
            return 0;
        return ratio >= 1 ? 1 : ratio <= 0 ? 0 : ratio;
    }
    _accumulate(traceId) {
        let accumulation = 0;
        for (let i = 0; i < traceId.length / 8; i++) {
            const pos = i * 8;
            const part = parseInt(traceId.slice(pos, pos + 8), 16);
            accumulation = (accumulation ^ part) >>> 0;
        }
        return accumulation;
    }
}
exports.TraceIdRatioBasedSampler = TraceIdRatioBasedSampler;
//# sourceMappingURL=TraceIdRatioBasedSampler.js.map

/***/ }),

/***/ 4463:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isTracingSuppressed = exports.unsuppressTracing = exports.suppressTracing = void 0;
const api_1 = __nccwpck_require__(5163);
const SUPPRESS_TRACING_KEY = (0, api_1.createContextKey)('OpenTelemetry SDK Context Key SUPPRESS_TRACING');
function suppressTracing(context) {
    return context.setValue(SUPPRESS_TRACING_KEY, true);
}
exports.suppressTracing = suppressTracing;
function unsuppressTracing(context) {
    return context.deleteValue(SUPPRESS_TRACING_KEY);
}
exports.unsuppressTracing = unsuppressTracing;
function isTracingSuppressed(context) {
    return context.getValue(SUPPRESS_TRACING_KEY) === true;
}
exports.isTracingSuppressed = isTracingSuppressed;
//# sourceMappingURL=suppress-tracing.js.map

/***/ }),

/***/ 2408:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BindOnceFuture = void 0;
const promise_1 = __nccwpck_require__(8329);
/**
 * Bind the callback and only invoke the callback once regardless how many times `BindOnceFuture.call` is invoked.
 */
class BindOnceFuture {
    constructor(_callback, _that) {
        this._callback = _callback;
        this._that = _that;
        this._isCalled = false;
        this._deferred = new promise_1.Deferred();
    }
    get isCalled() {
        return this._isCalled;
    }
    get promise() {
        return this._deferred.promise;
    }
    call(...args) {
        if (!this._isCalled) {
            this._isCalled = true;
            try {
                Promise.resolve(this._callback.call(this._that, ...args)).then(val => this._deferred.resolve(val), err => this._deferred.reject(err));
            }
            catch (err) {
                this._deferred.reject(err);
            }
        }
        return this._deferred.promise;
    }
}
exports.BindOnceFuture = BindOnceFuture;
//# sourceMappingURL=callback.js.map

/***/ }),

/***/ 7238:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getEnvWithoutDefaults = exports.parseEnvironment = exports.DEFAULT_ENVIRONMENT = exports.DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT = exports.DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT = exports.DEFAULT_ATTRIBUTE_COUNT_LIMIT = exports.DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT = void 0;
const api_1 = __nccwpck_require__(5163);
const sampling_1 = __nccwpck_require__(8289);
const globalThis_1 = __nccwpck_require__(2490);
const DEFAULT_LIST_SEPARATOR = ',';
/**
 * Environment interface to define all names
 */
const ENVIRONMENT_BOOLEAN_KEYS = ['OTEL_SDK_DISABLED'];
function isEnvVarABoolean(key) {
    return (ENVIRONMENT_BOOLEAN_KEYS.indexOf(key) > -1);
}
const ENVIRONMENT_NUMBERS_KEYS = [
    'OTEL_BSP_EXPORT_TIMEOUT',
    'OTEL_BSP_MAX_EXPORT_BATCH_SIZE',
    'OTEL_BSP_MAX_QUEUE_SIZE',
    'OTEL_BSP_SCHEDULE_DELAY',
    'OTEL_BLRP_EXPORT_TIMEOUT',
    'OTEL_BLRP_MAX_EXPORT_BATCH_SIZE',
    'OTEL_BLRP_MAX_QUEUE_SIZE',
    'OTEL_BLRP_SCHEDULE_DELAY',
    'OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT',
    'OTEL_ATTRIBUTE_COUNT_LIMIT',
    'OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT',
    'OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT',
    'OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT',
    'OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT',
    'OTEL_SPAN_EVENT_COUNT_LIMIT',
    'OTEL_SPAN_LINK_COUNT_LIMIT',
    'OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT',
    'OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT',
    'OTEL_EXPORTER_OTLP_TIMEOUT',
    'OTEL_EXPORTER_OTLP_TRACES_TIMEOUT',
    'OTEL_EXPORTER_OTLP_METRICS_TIMEOUT',
    'OTEL_EXPORTER_OTLP_LOGS_TIMEOUT',
    'OTEL_EXPORTER_JAEGER_AGENT_PORT',
];
function isEnvVarANumber(key) {
    return (ENVIRONMENT_NUMBERS_KEYS.indexOf(key) > -1);
}
const ENVIRONMENT_LISTS_KEYS = [
    'OTEL_NO_PATCH_MODULES',
    'OTEL_PROPAGATORS',
];
function isEnvVarAList(key) {
    return ENVIRONMENT_LISTS_KEYS.indexOf(key) > -1;
}
exports.DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT = Infinity;
exports.DEFAULT_ATTRIBUTE_COUNT_LIMIT = 128;
exports.DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT = 128;
exports.DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT = 128;
/**
 * Default environment variables
 */
exports.DEFAULT_ENVIRONMENT = {
    OTEL_SDK_DISABLED: false,
    CONTAINER_NAME: '',
    ECS_CONTAINER_METADATA_URI_V4: '',
    ECS_CONTAINER_METADATA_URI: '',
    HOSTNAME: '',
    KUBERNETES_SERVICE_HOST: '',
    NAMESPACE: '',
    OTEL_BSP_EXPORT_TIMEOUT: 30000,
    OTEL_BSP_MAX_EXPORT_BATCH_SIZE: 512,
    OTEL_BSP_MAX_QUEUE_SIZE: 2048,
    OTEL_BSP_SCHEDULE_DELAY: 5000,
    OTEL_BLRP_EXPORT_TIMEOUT: 30000,
    OTEL_BLRP_MAX_EXPORT_BATCH_SIZE: 512,
    OTEL_BLRP_MAX_QUEUE_SIZE: 2048,
    OTEL_BLRP_SCHEDULE_DELAY: 5000,
    OTEL_EXPORTER_JAEGER_AGENT_HOST: '',
    OTEL_EXPORTER_JAEGER_AGENT_PORT: 6832,
    OTEL_EXPORTER_JAEGER_ENDPOINT: '',
    OTEL_EXPORTER_JAEGER_PASSWORD: '',
    OTEL_EXPORTER_JAEGER_USER: '',
    OTEL_EXPORTER_OTLP_ENDPOINT: '',
    OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: '',
    OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: '',
    OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: '',
    OTEL_EXPORTER_OTLP_HEADERS: '',
    OTEL_EXPORTER_OTLP_TRACES_HEADERS: '',
    OTEL_EXPORTER_OTLP_METRICS_HEADERS: '',
    OTEL_EXPORTER_OTLP_LOGS_HEADERS: '',
    OTEL_EXPORTER_OTLP_TIMEOUT: 10000,
    OTEL_EXPORTER_OTLP_TRACES_TIMEOUT: 10000,
    OTEL_EXPORTER_OTLP_METRICS_TIMEOUT: 10000,
    OTEL_EXPORTER_OTLP_LOGS_TIMEOUT: 10000,
    OTEL_EXPORTER_ZIPKIN_ENDPOINT: 'http://localhost:9411/api/v2/spans',
    OTEL_LOG_LEVEL: api_1.DiagLogLevel.INFO,
    OTEL_NO_PATCH_MODULES: [],
    OTEL_PROPAGATORS: ['tracecontext', 'baggage'],
    OTEL_RESOURCE_ATTRIBUTES: '',
    OTEL_SERVICE_NAME: '',
    OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT: exports.DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT,
    OTEL_ATTRIBUTE_COUNT_LIMIT: exports.DEFAULT_ATTRIBUTE_COUNT_LIMIT,
    OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT: exports.DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT,
    OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT: exports.DEFAULT_ATTRIBUTE_COUNT_LIMIT,
    OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT: exports.DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT,
    OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT: exports.DEFAULT_ATTRIBUTE_COUNT_LIMIT,
    OTEL_SPAN_EVENT_COUNT_LIMIT: 128,
    OTEL_SPAN_LINK_COUNT_LIMIT: 128,
    OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT: exports.DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT,
    OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT: exports.DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT,
    OTEL_TRACES_EXPORTER: '',
    OTEL_TRACES_SAMPLER: sampling_1.TracesSamplerValues.ParentBasedAlwaysOn,
    OTEL_TRACES_SAMPLER_ARG: '',
    OTEL_LOGS_EXPORTER: '',
    OTEL_EXPORTER_OTLP_INSECURE: '',
    OTEL_EXPORTER_OTLP_TRACES_INSECURE: '',
    OTEL_EXPORTER_OTLP_METRICS_INSECURE: '',
    OTEL_EXPORTER_OTLP_LOGS_INSECURE: '',
    OTEL_EXPORTER_OTLP_CERTIFICATE: '',
    OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE: '',
    OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE: '',
    OTEL_EXPORTER_OTLP_LOGS_CERTIFICATE: '',
    OTEL_EXPORTER_OTLP_COMPRESSION: '',
    OTEL_EXPORTER_OTLP_TRACES_COMPRESSION: '',
    OTEL_EXPORTER_OTLP_METRICS_COMPRESSION: '',
    OTEL_EXPORTER_OTLP_LOGS_COMPRESSION: '',
    OTEL_EXPORTER_OTLP_CLIENT_KEY: '',
    OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY: '',
    OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY: '',
    OTEL_EXPORTER_OTLP_LOGS_CLIENT_KEY: '',
    OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE: '',
    OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE: '',
    OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE: '',
    OTEL_EXPORTER_OTLP_LOGS_CLIENT_CERTIFICATE: '',
    OTEL_EXPORTER_OTLP_PROTOCOL: 'http/protobuf',
    OTEL_EXPORTER_OTLP_TRACES_PROTOCOL: 'http/protobuf',
    OTEL_EXPORTER_OTLP_METRICS_PROTOCOL: 'http/protobuf',
    OTEL_EXPORTER_OTLP_LOGS_PROTOCOL: 'http/protobuf',
    OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE: 'cumulative',
};
/**
 * @param key
 * @param environment
 * @param values
 */
function parseBoolean(key, environment, values) {
    if (typeof values[key] === 'undefined') {
        return;
    }
    const value = String(values[key]);
    // support case-insensitive "true"
    environment[key] = value.toLowerCase() === 'true';
}
/**
 * Parses a variable as number with number validation
 * @param name
 * @param environment
 * @param values
 * @param min
 * @param max
 */
function parseNumber(name, environment, values, min = -Infinity, max = Infinity) {
    if (typeof values[name] !== 'undefined') {
        const value = Number(values[name]);
        if (!isNaN(value)) {
            if (value < min) {
                environment[name] = min;
            }
            else if (value > max) {
                environment[name] = max;
            }
            else {
                environment[name] = value;
            }
        }
    }
}
/**
 * Parses list-like strings from input into output.
 * @param name
 * @param environment
 * @param values
 * @param separator
 */
function parseStringList(name, output, input, separator = DEFAULT_LIST_SEPARATOR) {
    const givenValue = input[name];
    if (typeof givenValue === 'string') {
        output[name] = givenValue.split(separator).map(v => v.trim());
    }
}
// The support string -> DiagLogLevel mappings
const logLevelMap = {
    ALL: api_1.DiagLogLevel.ALL,
    VERBOSE: api_1.DiagLogLevel.VERBOSE,
    DEBUG: api_1.DiagLogLevel.DEBUG,
    INFO: api_1.DiagLogLevel.INFO,
    WARN: api_1.DiagLogLevel.WARN,
    ERROR: api_1.DiagLogLevel.ERROR,
    NONE: api_1.DiagLogLevel.NONE,
};
/**
 * Environmentally sets log level if valid log level string is provided
 * @param key
 * @param environment
 * @param values
 */
function setLogLevelFromEnv(key, environment, values) {
    const value = values[key];
    if (typeof value === 'string') {
        const theLevel = logLevelMap[value.toUpperCase()];
        if (theLevel != null) {
            environment[key] = theLevel;
        }
    }
}
/**
 * Parses environment values
 * @param values
 */
function parseEnvironment(values) {
    const environment = {};
    for (const env in exports.DEFAULT_ENVIRONMENT) {
        const key = env;
        switch (key) {
            case 'OTEL_LOG_LEVEL':
                setLogLevelFromEnv(key, environment, values);
                break;
            default:
                if (isEnvVarABoolean(key)) {
                    parseBoolean(key, environment, values);
                }
                else if (isEnvVarANumber(key)) {
                    parseNumber(key, environment, values);
                }
                else if (isEnvVarAList(key)) {
                    parseStringList(key, environment, values);
                }
                else {
                    const value = values[key];
                    if (typeof value !== 'undefined' && value !== null) {
                        environment[key] = String(value);
                    }
                }
        }
    }
    return environment;
}
exports.parseEnvironment = parseEnvironment;
/**
 * Get environment in node or browser without
 * populating default values.
 */
function getEnvWithoutDefaults() {
    return typeof process !== 'undefined' && process && process.env
        ? parseEnvironment(process.env)
        : parseEnvironment(globalThis_1._globalThis);
}
exports.getEnvWithoutDefaults = getEnvWithoutDefaults;
//# sourceMappingURL=environment.js.map

/***/ }),

/***/ 1780:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isPlainObject = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * based on lodash in order to support esm builds without esModuleInterop.
 * lodash is using MIT License.
 **/
const objectTag = '[object Object]';
const nullTag = '[object Null]';
const undefinedTag = '[object Undefined]';
const funcProto = Function.prototype;
const funcToString = funcProto.toString;
const objectCtorString = funcToString.call(Object);
const getPrototype = overArg(Object.getPrototypeOf, Object);
const objectProto = Object.prototype;
const hasOwnProperty = objectProto.hasOwnProperty;
const symToStringTag = Symbol ? Symbol.toStringTag : undefined;
const nativeObjectToString = objectProto.toString;
/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
    return function (arg) {
        return func(transform(arg));
    };
}
/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
    if (!isObjectLike(value) || baseGetTag(value) !== objectTag) {
        return false;
    }
    const proto = getPrototype(value);
    if (proto === null) {
        return true;
    }
    const Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
    return (typeof Ctor == 'function' &&
        Ctor instanceof Ctor &&
        funcToString.call(Ctor) === objectCtorString);
}
exports.isPlainObject = isPlainObject;
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
    return value != null && typeof value == 'object';
}
/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
    if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
    }
    return symToStringTag && symToStringTag in Object(value)
        ? getRawTag(value)
        : objectToString(value);
}
/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
    const isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
    let unmasked = false;
    try {
        value[symToStringTag] = undefined;
        unmasked = true;
    }
    catch (e) {
        // silence
    }
    const result = nativeObjectToString.call(value);
    if (unmasked) {
        if (isOwn) {
            value[symToStringTag] = tag;
        }
        else {
            delete value[symToStringTag];
        }
    }
    return result;
}
/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
    return nativeObjectToString.call(value);
}
//# sourceMappingURL=lodash.merge.js.map

/***/ }),

/***/ 5387:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.merge = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const lodash_merge_1 = __nccwpck_require__(1780);
const MAX_LEVEL = 20;
/**
 * Merges objects together
 * @param args - objects / values to be merged
 */
function merge(...args) {
    let result = args.shift();
    const objects = new WeakMap();
    while (args.length > 0) {
        result = mergeTwoObjects(result, args.shift(), 0, objects);
    }
    return result;
}
exports.merge = merge;
function takeValue(value) {
    if (isArray(value)) {
        return value.slice();
    }
    return value;
}
/**
 * Merges two objects
 * @param one - first object
 * @param two - second object
 * @param level - current deep level
 * @param objects - objects holder that has been already referenced - to prevent
 * cyclic dependency
 */
function mergeTwoObjects(one, two, level = 0, objects) {
    let result;
    if (level > MAX_LEVEL) {
        return undefined;
    }
    level++;
    if (isPrimitive(one) || isPrimitive(two) || isFunction(two)) {
        result = takeValue(two);
    }
    else if (isArray(one)) {
        result = one.slice();
        if (isArray(two)) {
            for (let i = 0, j = two.length; i < j; i++) {
                result.push(takeValue(two[i]));
            }
        }
        else if (isObject(two)) {
            const keys = Object.keys(two);
            for (let i = 0, j = keys.length; i < j; i++) {
                const key = keys[i];
                result[key] = takeValue(two[key]);
            }
        }
    }
    else if (isObject(one)) {
        if (isObject(two)) {
            if (!shouldMerge(one, two)) {
                return two;
            }
            result = Object.assign({}, one);
            const keys = Object.keys(two);
            for (let i = 0, j = keys.length; i < j; i++) {
                const key = keys[i];
                const twoValue = two[key];
                if (isPrimitive(twoValue)) {
                    if (typeof twoValue === 'undefined') {
                        delete result[key];
                    }
                    else {
                        // result[key] = takeValue(twoValue);
                        result[key] = twoValue;
                    }
                }
                else {
                    const obj1 = result[key];
                    const obj2 = twoValue;
                    if (wasObjectReferenced(one, key, objects) ||
                        wasObjectReferenced(two, key, objects)) {
                        delete result[key];
                    }
                    else {
                        if (isObject(obj1) && isObject(obj2)) {
                            const arr1 = objects.get(obj1) || [];
                            const arr2 = objects.get(obj2) || [];
                            arr1.push({ obj: one, key });
                            arr2.push({ obj: two, key });
                            objects.set(obj1, arr1);
                            objects.set(obj2, arr2);
                        }
                        result[key] = mergeTwoObjects(result[key], twoValue, level, objects);
                    }
                }
            }
        }
        else {
            result = two;
        }
    }
    return result;
}
/**
 * Function to check if object has been already reference
 * @param obj
 * @param key
 * @param objects
 */
function wasObjectReferenced(obj, key, objects) {
    const arr = objects.get(obj[key]) || [];
    for (let i = 0, j = arr.length; i < j; i++) {
        const info = arr[i];
        if (info.key === key && info.obj === obj) {
            return true;
        }
    }
    return false;
}
function isArray(value) {
    return Array.isArray(value);
}
function isFunction(value) {
    return typeof value === 'function';
}
function isObject(value) {
    return (!isPrimitive(value) &&
        !isArray(value) &&
        !isFunction(value) &&
        typeof value === 'object');
}
function isPrimitive(value) {
    return (typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        typeof value === 'undefined' ||
        value instanceof Date ||
        value instanceof RegExp ||
        value === null);
}
function shouldMerge(one, two) {
    if (!(0, lodash_merge_1.isPlainObject)(one) || !(0, lodash_merge_1.isPlainObject)(two)) {
        return false;
    }
    return true;
}
//# sourceMappingURL=merge.js.map

/***/ }),

/***/ 8329:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Deferred = void 0;
class Deferred {
    constructor() {
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }
    get promise() {
        return this._promise;
    }
    resolve(val) {
        this._resolve(val);
    }
    reject(err) {
        this._reject(err);
    }
}
exports.Deferred = Deferred;
//# sourceMappingURL=promise.js.map

/***/ }),

/***/ 8289:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TracesSamplerValues = void 0;
var TracesSamplerValues;
(function (TracesSamplerValues) {
    TracesSamplerValues["AlwaysOff"] = "always_off";
    TracesSamplerValues["AlwaysOn"] = "always_on";
    TracesSamplerValues["ParentBasedAlwaysOff"] = "parentbased_always_off";
    TracesSamplerValues["ParentBasedAlwaysOn"] = "parentbased_always_on";
    TracesSamplerValues["ParentBasedTraceIdRatio"] = "parentbased_traceidratio";
    TracesSamplerValues["TraceIdRatio"] = "traceidratio";
})(TracesSamplerValues = exports.TracesSamplerValues || (exports.TracesSamplerValues = {}));
//# sourceMappingURL=sampling.js.map

/***/ }),

/***/ 8400:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.callWithTimeout = exports.TimeoutError = void 0;
/**
 * Error that is thrown on timeouts.
 */
class TimeoutError extends Error {
    constructor(message) {
        super(message);
        // manually adjust prototype to retain `instanceof` functionality when targeting ES5, see:
        // https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, TimeoutError.prototype);
    }
}
exports.TimeoutError = TimeoutError;
/**
 * Adds a timeout to a promise and rejects if the specified timeout has elapsed. Also rejects if the specified promise
 * rejects, and resolves if the specified promise resolves.
 *
 * <p> NOTE: this operation will continue even after it throws a {@link TimeoutError}.
 *
 * @param promise promise to use with timeout.
 * @param timeout the timeout in milliseconds until the returned promise is rejected.
 */
function callWithTimeout(promise, timeout) {
    let timeoutHandle;
    const timeoutPromise = new Promise(function timeoutFunction(_resolve, reject) {
        timeoutHandle = setTimeout(function timeoutHandler() {
            reject(new TimeoutError('Operation timed out.'));
        }, timeout);
    });
    return Promise.race([promise, timeoutPromise]).then(result => {
        clearTimeout(timeoutHandle);
        return result;
    }, reason => {
        clearTimeout(timeoutHandle);
        throw reason;
    });
}
exports.callWithTimeout = callWithTimeout;
//# sourceMappingURL=timeout.js.map

/***/ }),

/***/ 839:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isUrlIgnored = exports.urlMatches = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function urlMatches(url, urlToMatch) {
    if (typeof urlToMatch === 'string') {
        return url === urlToMatch;
    }
    else {
        return !!url.match(urlToMatch);
    }
}
exports.urlMatches = urlMatches;
/**
 * Check if {@param url} should be ignored when comparing against {@param ignoredUrls}
 * @param url
 * @param ignoredUrls
 */
function isUrlIgnored(url, ignoredUrls) {
    if (!ignoredUrls) {
        return false;
    }
    for (const ignoreUrl of ignoredUrls) {
        if (urlMatches(url, ignoreUrl)) {
            return true;
        }
    }
    return false;
}
exports.isUrlIgnored = isUrlIgnored;
//# sourceMappingURL=url.js.map

/***/ }),

/***/ 7226:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isWrapped = void 0;
/**
 * Checks if certain function has been already wrapped
 * @param func
 */
function isWrapped(func) {
    return (typeof func === 'function' &&
        typeof func.__original === 'function' &&
        typeof func.__unwrap === 'function' &&
        func.__wrapped === true);
}
exports.isWrapped = isWrapped;
//# sourceMappingURL=wrap.js.map

/***/ }),

/***/ 5687:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.VERSION = '1.21.0';
//# sourceMappingURL=version.js.map

/***/ }),

/***/ 9105:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrometheusExporter = void 0;
const api_1 = __nccwpck_require__(5163);
const core_1 = __nccwpck_require__(9736);
const sdk_metrics_1 = __nccwpck_require__(7349);
const http_1 = __nccwpck_require__(3685);
const PrometheusSerializer_1 = __nccwpck_require__(2460);
/** Node.js v8.x compat */
const url_1 = __nccwpck_require__(7310);
class PrometheusExporter extends sdk_metrics_1.MetricReader {
    // This will be required when histogram is implemented. Leaving here so it is not forgotten
    // Histogram cannot have a attribute named 'le'
    // private static readonly RESERVED_HISTOGRAM_LABEL = 'le';
    /**
     * Constructor
     * @param config Exporter configuration
     * @param callback Callback to be called after a server was started
     */
    constructor(config = {}, callback = () => { }) {
        super({
            aggregationSelector: _instrumentType => sdk_metrics_1.Aggregation.Default(),
            aggregationTemporalitySelector: _instrumentType => sdk_metrics_1.AggregationTemporality.CUMULATIVE,
            metricProducers: config.metricProducers,
        });
        /**
         * Request handler used by http library to respond to incoming requests
         * for the current state of metrics by the Prometheus backend.
         *
         * @param request Incoming HTTP request to export server
         * @param response HTTP response object used to respond to request
         */
        this._requestHandler = (request, response) => {
            if (request.url != null &&
                new url_1.URL(request.url, this._baseUrl).pathname === this._endpoint) {
                this._exportMetrics(response);
            }
            else {
                this._notFound(response);
            }
        };
        /**
         * Responds to incoming message with current state of all metrics.
         */
        this._exportMetrics = (response) => {
            response.statusCode = 200;
            response.setHeader('content-type', 'text/plain');
            this.collect().then(collectionResult => {
                const { resourceMetrics, errors } = collectionResult;
                if (errors.length) {
                    api_1.diag.error('PrometheusExporter: metrics collection errors', ...errors);
                }
                response.end(this._serializer.serialize(resourceMetrics));
            }, err => {
                response.end(`# failed to export metrics: ${err}`);
            });
        };
        /**
         * Responds with 404 status code to all requests that do not match the configured endpoint.
         */
        this._notFound = (response) => {
            response.statusCode = 404;
            response.end();
        };
        this._host =
            config.host ||
                process.env.OTEL_EXPORTER_PROMETHEUS_HOST ||
                PrometheusExporter.DEFAULT_OPTIONS.host;
        this._port =
            config.port ||
                Number(process.env.OTEL_EXPORTER_PROMETHEUS_PORT) ||
                PrometheusExporter.DEFAULT_OPTIONS.port;
        this._prefix = config.prefix || PrometheusExporter.DEFAULT_OPTIONS.prefix;
        this._appendTimestamp =
            typeof config.appendTimestamp === 'boolean'
                ? config.appendTimestamp
                : PrometheusExporter.DEFAULT_OPTIONS.appendTimestamp;
        // unref to prevent prometheus exporter from holding the process open on exit
        this._server = (0, http_1.createServer)(this._requestHandler).unref();
        this._serializer = new PrometheusSerializer_1.PrometheusSerializer(this._prefix, this._appendTimestamp);
        this._baseUrl = `http://${this._host}:${this._port}/`;
        this._endpoint = (config.endpoint || PrometheusExporter.DEFAULT_OPTIONS.endpoint).replace(/^([^/])/, '/$1');
        if (config.preventServerStart !== true) {
            this.startServer().then(callback, err => {
                api_1.diag.error(err);
                callback(err);
            });
        }
        else if (callback) {
            // Do not invoke callback immediately to avoid zalgo problem.
            queueMicrotask(callback);
        }
    }
    async onForceFlush() {
        /** do nothing */
    }
    /**
     * Shuts down the export server and clears the registry
     */
    onShutdown() {
        return this.stopServer();
    }
    /**
     * Stops the Prometheus export server
     */
    stopServer() {
        if (!this._server) {
            api_1.diag.debug('Prometheus stopServer() was called but server was never started.');
            return Promise.resolve();
        }
        else {
            return new Promise(resolve => {
                this._server.close(err => {
                    if (!err) {
                        api_1.diag.debug('Prometheus exporter was stopped');
                    }
                    else {
                        if (err.code !==
                            'ERR_SERVER_NOT_RUNNING') {
                            (0, core_1.globalErrorHandler)(err);
                        }
                    }
                    resolve();
                });
            });
        }
    }
    /**
     * Starts the Prometheus export server
     */
    startServer() {
        var _a;
        (_a = this._startServerPromise) !== null && _a !== void 0 ? _a : (this._startServerPromise = new Promise((resolve, reject) => {
            this._server.once('error', reject);
            this._server.listen({
                port: this._port,
                host: this._host,
            }, () => {
                api_1.diag.debug(`Prometheus exporter server started: ${this._host}:${this._port}/${this._endpoint}`);
                resolve();
            });
        }));
        return this._startServerPromise;
    }
    /**
     * Request handler that responds with the current state of metrics
     * @param _request Incoming HTTP request of server instance
     * @param response HTTP response object used to response to request
     */
    getMetricsRequestHandler(_request, response) {
        this._exportMetrics(response);
    }
}
exports.PrometheusExporter = PrometheusExporter;
PrometheusExporter.DEFAULT_OPTIONS = {
    host: undefined,
    port: 9464,
    endpoint: '/metrics',
    prefix: '',
    appendTimestamp: false,
};
//# sourceMappingURL=PrometheusExporter.js.map

/***/ }),

/***/ 2460:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrometheusSerializer = void 0;
const api_1 = __nccwpck_require__(5163);
const sdk_metrics_1 = __nccwpck_require__(7349);
const core_1 = __nccwpck_require__(9736);
function escapeString(str) {
    return str.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
}
/**
 * String Attribute values are converted directly to Prometheus attribute values.
 * Non-string values are represented as JSON-encoded strings.
 *
 * `undefined` is converted to an empty string.
 */
function escapeAttributeValue(str = '') {
    if (typeof str !== 'string') {
        str = JSON.stringify(str);
    }
    return escapeString(str).replace(/"/g, '\\"');
}
const invalidCharacterRegex = /[^a-z0-9_]/gi;
const multipleUnderscoreRegex = /_{2,}/g;
/**
 * Ensures metric names are valid Prometheus metric names by removing
 * characters allowed by OpenTelemetry but disallowed by Prometheus.
 *
 * https://prometheus.io/docs/concepts/data_model/#metric-names-and-attributes
 *
 * 1. Names must match `[a-zA-Z_:][a-zA-Z0-9_:]*`
 *
 * 2. Colons are reserved for user defined recording rules.
 * They should not be used by exporters or direct instrumentation.
 *
 * OpenTelemetry metric names are already validated in the Meter when they are created,
 * and they match the format `[a-zA-Z][a-zA-Z0-9_.\-]*` which is very close to a valid
 * prometheus metric name, so we only need to strip characters valid in OpenTelemetry
 * but not valid in prometheus and replace them with '_'.
 *
 * @param name name to be sanitized
 */
function sanitizePrometheusMetricName(name) {
    // replace all invalid characters with '_'
    return name
        .replace(invalidCharacterRegex, '_')
        .replace(multipleUnderscoreRegex, '_');
}
/**
 * @private
 *
 * Helper method which assists in enforcing the naming conventions for metric
 * names in Prometheus
 * @param name the name of the metric
 * @param type the kind of metric
 * @returns string
 */
function enforcePrometheusNamingConvention(name, type) {
    // Prometheus requires that metrics of the Counter kind have "_total" suffix
    if (!name.endsWith('_total') && type === sdk_metrics_1.InstrumentType.COUNTER) {
        name = name + '_total';
    }
    return name;
}
function valueString(value) {
    if (Number.isNaN(value)) {
        return 'NaN';
    }
    else if (!Number.isFinite(value)) {
        if (value < 0) {
            return '-Inf';
        }
        else {
            return '+Inf';
        }
    }
    else {
        return `${value}`;
    }
}
function toPrometheusType(metricData) {
    switch (metricData.dataPointType) {
        case sdk_metrics_1.DataPointType.SUM:
            if (metricData.isMonotonic) {
                return 'counter';
            }
            return 'gauge';
        case sdk_metrics_1.DataPointType.GAUGE:
            return 'gauge';
        case sdk_metrics_1.DataPointType.HISTOGRAM:
            return 'histogram';
        default:
            return 'untyped';
    }
}
function stringify(metricName, attributes, value, timestamp, additionalAttributes) {
    let hasAttribute = false;
    let attributesStr = '';
    for (const [key, val] of Object.entries(attributes)) {
        const sanitizedAttributeName = sanitizePrometheusMetricName(key);
        hasAttribute = true;
        attributesStr += `${attributesStr.length > 0 ? ',' : ''}${sanitizedAttributeName}="${escapeAttributeValue(val)}"`;
    }
    if (additionalAttributes) {
        for (const [key, val] of Object.entries(additionalAttributes)) {
            const sanitizedAttributeName = sanitizePrometheusMetricName(key);
            hasAttribute = true;
            attributesStr += `${attributesStr.length > 0 ? ',' : ''}${sanitizedAttributeName}="${escapeAttributeValue(val)}"`;
        }
    }
    if (hasAttribute) {
        metricName += `{${attributesStr}}`;
    }
    return `${metricName} ${valueString(value)}${timestamp !== undefined ? ' ' + String(timestamp) : ''}\n`;
}
const NO_REGISTERED_METRICS = '# no registered metrics';
class PrometheusSerializer {
    constructor(prefix, appendTimestamp = false) {
        if (prefix) {
            this._prefix = prefix + '_';
        }
        this._appendTimestamp = appendTimestamp;
    }
    serialize(resourceMetrics) {
        let str = '';
        for (const scopeMetrics of resourceMetrics.scopeMetrics) {
            str += this._serializeScopeMetrics(scopeMetrics);
        }
        if (str === '') {
            str += NO_REGISTERED_METRICS;
        }
        return this._serializeResource(resourceMetrics.resource) + str;
    }
    _serializeScopeMetrics(scopeMetrics) {
        let str = '';
        for (const metric of scopeMetrics.metrics) {
            str += this._serializeMetricData(metric) + '\n';
        }
        return str;
    }
    _serializeMetricData(metricData) {
        let name = sanitizePrometheusMetricName(escapeString(metricData.descriptor.name));
        if (this._prefix) {
            name = `${this._prefix}${name}`;
        }
        const dataPointType = metricData.dataPointType;
        name = enforcePrometheusNamingConvention(name, metricData.descriptor.type);
        const help = `# HELP ${name} ${escapeString(metricData.descriptor.description || 'description missing')}`;
        const unit = metricData.descriptor.unit
            ? `\n# UNIT ${name} ${escapeString(metricData.descriptor.unit)}`
            : '';
        const type = `# TYPE ${name} ${toPrometheusType(metricData)}`;
        let results = '';
        switch (dataPointType) {
            case sdk_metrics_1.DataPointType.SUM:
            case sdk_metrics_1.DataPointType.GAUGE: {
                results = metricData.dataPoints
                    .map(it => this._serializeSingularDataPoint(name, metricData.descriptor.type, it))
                    .join('');
                break;
            }
            case sdk_metrics_1.DataPointType.HISTOGRAM: {
                results = metricData.dataPoints
                    .map(it => this._serializeHistogramDataPoint(name, metricData.descriptor.type, it))
                    .join('');
                break;
            }
            default: {
                api_1.diag.error(`Unrecognizable DataPointType: ${dataPointType} for metric "${name}"`);
            }
        }
        return `${help}${unit}\n${type}\n${results}`.trim();
    }
    _serializeSingularDataPoint(name, type, dataPoint) {
        let results = '';
        name = enforcePrometheusNamingConvention(name, type);
        const { value, attributes } = dataPoint;
        const timestamp = (0, core_1.hrTimeToMilliseconds)(dataPoint.endTime);
        results += stringify(name, attributes, value, this._appendTimestamp ? timestamp : undefined, undefined);
        return results;
    }
    _serializeHistogramDataPoint(name, type, dataPoint) {
        let results = '';
        name = enforcePrometheusNamingConvention(name, type);
        const attributes = dataPoint.attributes;
        const histogram = dataPoint.value;
        const timestamp = (0, core_1.hrTimeToMilliseconds)(dataPoint.endTime);
        /** Histogram["bucket"] is not typed with `number` */
        for (const key of ['count', 'sum']) {
            const value = histogram[key];
            if (value != null)
                results += stringify(name + '_' + key, attributes, value, this._appendTimestamp ? timestamp : undefined, undefined);
        }
        let cumulativeSum = 0;
        const countEntries = histogram.buckets.counts.entries();
        let infiniteBoundaryDefined = false;
        for (const [idx, val] of countEntries) {
            cumulativeSum += val;
            const upperBound = histogram.buckets.boundaries[idx];
            /** HistogramAggregator is producing different boundary output -
             * in one case not including infinity values, in other -
             * full, e.g. [0, 100] and [0, 100, Infinity]
             * we should consider that in export, if Infinity is defined, use it
             * as boundary
             */
            if (upperBound === undefined && infiniteBoundaryDefined) {
                break;
            }
            if (upperBound === Infinity) {
                infiniteBoundaryDefined = true;
            }
            results += stringify(name + '_bucket', attributes, cumulativeSum, this._appendTimestamp ? timestamp : undefined, {
                le: upperBound === undefined || upperBound === Infinity
                    ? '+Inf'
                    : String(upperBound),
            });
        }
        return results;
    }
    _serializeResource(resource) {
        const name = 'target_info';
        const help = `# HELP ${name} Target metadata`;
        const type = `# TYPE ${name} gauge`;
        const results = stringify(name, resource.attributes, 1).trim();
        return `${help}\n${type}\n${results}\n`;
    }
}
exports.PrometheusSerializer = PrometheusSerializer;
//# sourceMappingURL=PrometheusSerializer.js.map

/***/ }),

/***/ 6059:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=types.js.map

/***/ }),

/***/ 3976:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(9105), exports);
__exportStar(__nccwpck_require__(2460), exports);
__exportStar(__nccwpck_require__(6059), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 920:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=IResource.js.map

/***/ }),

/***/ 2723:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Resource = void 0;
const api_1 = __nccwpck_require__(5163);
const semantic_conventions_1 = __nccwpck_require__(7275);
const core_1 = __nccwpck_require__(9736);
const platform_1 = __nccwpck_require__(7784);
/**
 * A Resource describes the entity for which a signals (metrics or trace) are
 * collected.
 */
class Resource {
    constructor(
    /**
     * A dictionary of attributes with string keys and values that provide
     * information about the entity as numbers, strings or booleans
     * TODO: Consider to add check/validation on attributes.
     */
    attributes, asyncAttributesPromise) {
        var _a;
        this._attributes = attributes;
        this.asyncAttributesPending = asyncAttributesPromise != null;
        this._syncAttributes = (_a = this._attributes) !== null && _a !== void 0 ? _a : {};
        this._asyncAttributesPromise = asyncAttributesPromise === null || asyncAttributesPromise === void 0 ? void 0 : asyncAttributesPromise.then(asyncAttributes => {
            this._attributes = Object.assign({}, this._attributes, asyncAttributes);
            this.asyncAttributesPending = false;
            return asyncAttributes;
        }, err => {
            api_1.diag.debug("a resource's async attributes promise rejected: %s", err);
            this.asyncAttributesPending = false;
            return {};
        });
    }
    /**
     * Returns an empty Resource
     */
    static empty() {
        return Resource.EMPTY;
    }
    /**
     * Returns a Resource that identifies the SDK in use.
     */
    static default() {
        return new Resource({
            [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]: (0, platform_1.defaultServiceName)(),
            [semantic_conventions_1.SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE]: core_1.SDK_INFO[semantic_conventions_1.SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE],
            [semantic_conventions_1.SemanticResourceAttributes.TELEMETRY_SDK_NAME]: core_1.SDK_INFO[semantic_conventions_1.SemanticResourceAttributes.TELEMETRY_SDK_NAME],
            [semantic_conventions_1.SemanticResourceAttributes.TELEMETRY_SDK_VERSION]: core_1.SDK_INFO[semantic_conventions_1.SemanticResourceAttributes.TELEMETRY_SDK_VERSION],
        });
    }
    get attributes() {
        var _a;
        if (this.asyncAttributesPending) {
            api_1.diag.error('Accessing resource attributes before async attributes settled');
        }
        return (_a = this._attributes) !== null && _a !== void 0 ? _a : {};
    }
    /**
     * Returns a promise that will never be rejected. Resolves when all async attributes have finished being added to
     * this Resource's attributes. This is useful in exporters to block until resource detection
     * has finished.
     */
    async waitForAsyncAttributes() {
        if (this.asyncAttributesPending) {
            await this._asyncAttributesPromise;
        }
    }
    /**
     * Returns a new, merged {@link Resource} by merging the current Resource
     * with the other Resource. In case of a collision, other Resource takes
     * precedence.
     *
     * @param other the Resource that will be merged with this.
     * @returns the newly merged Resource.
     */
    merge(other) {
        var _a;
        if (!other)
            return this;
        // SpanAttributes from other resource overwrite attributes from this resource.
        const mergedSyncAttributes = Object.assign(Object.assign({}, this._syncAttributes), ((_a = other._syncAttributes) !== null && _a !== void 0 ? _a : other.attributes));
        if (!this._asyncAttributesPromise &&
            !other._asyncAttributesPromise) {
            return new Resource(mergedSyncAttributes);
        }
        const mergedAttributesPromise = Promise.all([
            this._asyncAttributesPromise,
            other._asyncAttributesPromise,
        ]).then(([thisAsyncAttributes, otherAsyncAttributes]) => {
            var _a;
            return Object.assign(Object.assign(Object.assign(Object.assign({}, this._syncAttributes), thisAsyncAttributes), ((_a = other._syncAttributes) !== null && _a !== void 0 ? _a : other.attributes)), otherAsyncAttributes);
        });
        return new Resource(mergedSyncAttributes, mergedAttributesPromise);
    }
}
exports.Resource = Resource;
Resource.EMPTY = new Resource({});
//# sourceMappingURL=Resource.js.map

/***/ }),

/***/ 1565:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=config.js.map

/***/ }),

/***/ 990:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.detectResourcesSync = exports.detectResources = void 0;
const Resource_1 = __nccwpck_require__(2723);
const api_1 = __nccwpck_require__(5163);
const utils_1 = __nccwpck_require__(4298);
/**
 * Runs all resource detectors and returns the results merged into a single Resource. Promise
 * does not resolve until all the underlying detectors have resolved, unlike
 * detectResourcesSync.
 *
 * @deprecated use detectResourcesSync() instead.
 * @param config Configuration for resource detection
 */
const detectResources = async (config = {}) => {
    const resources = await Promise.all((config.detectors || []).map(async (d) => {
        try {
            const resource = await d.detect(config);
            api_1.diag.debug(`${d.constructor.name} found resource.`, resource);
            return resource;
        }
        catch (e) {
            api_1.diag.debug(`${d.constructor.name} failed: ${e.message}`);
            return Resource_1.Resource.empty();
        }
    }));
    // Future check if verbose logging is enabled issue #1903
    logResources(resources);
    return resources.reduce((acc, resource) => acc.merge(resource), Resource_1.Resource.empty());
};
exports.detectResources = detectResources;
/**
 * Runs all resource detectors synchronously, merging their results. In case of attribute collision later resources will take precedence.
 *
 * @param config Configuration for resource detection
 */
const detectResourcesSync = (config = {}) => {
    var _a;
    const resources = ((_a = config.detectors) !== null && _a !== void 0 ? _a : []).map((d) => {
        try {
            const resourceOrPromise = d.detect(config);
            let resource;
            if ((0, utils_1.isPromiseLike)(resourceOrPromise)) {
                const createPromise = async () => {
                    const resolvedResource = await resourceOrPromise;
                    return resolvedResource.attributes;
                };
                resource = new Resource_1.Resource({}, createPromise());
            }
            else {
                resource = resourceOrPromise;
            }
            if (resource.waitForAsyncAttributes) {
                void resource
                    .waitForAsyncAttributes()
                    .then(() => api_1.diag.debug(`${d.constructor.name} found resource.`, resource));
            }
            else {
                api_1.diag.debug(`${d.constructor.name} found resource.`, resource);
            }
            return resource;
        }
        catch (e) {
            api_1.diag.error(`${d.constructor.name} failed: ${e.message}`);
            return Resource_1.Resource.empty();
        }
    });
    const mergedResources = resources.reduce((acc, resource) => acc.merge(resource), Resource_1.Resource.empty());
    if (mergedResources.waitForAsyncAttributes) {
        void mergedResources.waitForAsyncAttributes().then(() => {
            // Future check if verbose logging is enabled issue #1903
            logResources(resources);
        });
    }
    return mergedResources;
};
exports.detectResourcesSync = detectResourcesSync;
/**
 * Writes debug information about the detected resources to the logger defined in the resource detection config, if one is provided.
 *
 * @param resources The array of {@link Resource} that should be logged. Empty entries will be ignored.
 */
const logResources = (resources) => {
    resources.forEach(resource => {
        // Print only populated resources
        if (Object.keys(resource.attributes).length > 0) {
            const resourceDebugString = JSON.stringify(resource.attributes, null, 4);
            api_1.diag.verbose(resourceDebugString);
        }
    });
};
//# sourceMappingURL=detect-resources.js.map

/***/ }),

/***/ 5969:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.browserDetector = void 0;
const __1 = __nccwpck_require__(3871);
/**
 * BrowserDetector will be used to detect the resources related to browser.
 */
class BrowserDetector {
    detect(config) {
        return Promise.resolve(__1.browserDetectorSync.detect(config));
    }
}
exports.browserDetector = new BrowserDetector();
//# sourceMappingURL=BrowserDetector.js.map

/***/ }),

/***/ 3010:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.browserDetectorSync = void 0;
const semantic_conventions_1 = __nccwpck_require__(7275);
const __1 = __nccwpck_require__(3871);
const api_1 = __nccwpck_require__(5163);
/**
 * BrowserDetectorSync will be used to detect the resources related to browser.
 */
class BrowserDetectorSync {
    detect(config) {
        const isBrowser = typeof navigator !== 'undefined';
        if (!isBrowser) {
            return __1.Resource.empty();
        }
        const browserResource = {
            [semantic_conventions_1.SemanticResourceAttributes.PROCESS_RUNTIME_NAME]: 'browser',
            [semantic_conventions_1.SemanticResourceAttributes.PROCESS_RUNTIME_DESCRIPTION]: 'Web Browser',
            [semantic_conventions_1.SemanticResourceAttributes.PROCESS_RUNTIME_VERSION]: navigator.userAgent,
        };
        return this._getResourceAttributes(browserResource, config);
    }
    /**
     * Validates process resource attribute map from process variables
     *
     * @param browserResource The un-sanitized resource attributes from process as key/value pairs.
     * @param config: Config
     * @returns The sanitized resource attributes.
     */
    _getResourceAttributes(browserResource, _config) {
        if (browserResource[semantic_conventions_1.SemanticResourceAttributes.PROCESS_RUNTIME_VERSION] === '') {
            api_1.diag.debug('BrowserDetector failed: Unable to find required browser resources. ');
            return __1.Resource.empty();
        }
        else {
            return new __1.Resource(Object.assign({}, browserResource));
        }
    }
}
exports.browserDetectorSync = new BrowserDetectorSync();
//# sourceMappingURL=BrowserDetectorSync.js.map

/***/ }),

/***/ 2474:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.envDetector = void 0;
const EnvDetectorSync_1 = __nccwpck_require__(4565);
/**
 * EnvDetector can be used to detect the presence of and create a Resource
 * from the OTEL_RESOURCE_ATTRIBUTES environment variable.
 */
class EnvDetector {
    /**
     * Returns a {@link Resource} populated with attributes from the
     * OTEL_RESOURCE_ATTRIBUTES environment variable. Note this is an async
     * function to conform to the Detector interface.
     *
     * @param config The resource detection config
     */
    detect(config) {
        return Promise.resolve(EnvDetectorSync_1.envDetectorSync.detect(config));
    }
}
exports.envDetector = new EnvDetector();
//# sourceMappingURL=EnvDetector.js.map

/***/ }),

/***/ 4565:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.envDetectorSync = void 0;
const api_1 = __nccwpck_require__(5163);
const core_1 = __nccwpck_require__(9736);
const semantic_conventions_1 = __nccwpck_require__(7275);
const Resource_1 = __nccwpck_require__(2723);
/**
 * EnvDetectorSync can be used to detect the presence of and create a Resource
 * from the OTEL_RESOURCE_ATTRIBUTES environment variable.
 */
class EnvDetectorSync {
    constructor() {
        // Type, attribute keys, and attribute values should not exceed 256 characters.
        this._MAX_LENGTH = 255;
        // OTEL_RESOURCE_ATTRIBUTES is a comma-separated list of attributes.
        this._COMMA_SEPARATOR = ',';
        // OTEL_RESOURCE_ATTRIBUTES contains key value pair separated by '='.
        this._LABEL_KEY_VALUE_SPLITTER = '=';
        this._ERROR_MESSAGE_INVALID_CHARS = 'should be a ASCII string with a length greater than 0 and not exceed ' +
            this._MAX_LENGTH +
            ' characters.';
        this._ERROR_MESSAGE_INVALID_VALUE = 'should be a ASCII string with a length not exceed ' +
            this._MAX_LENGTH +
            ' characters.';
    }
    /**
     * Returns a {@link Resource} populated with attributes from the
     * OTEL_RESOURCE_ATTRIBUTES environment variable. Note this is an async
     * function to conform to the Detector interface.
     *
     * @param config The resource detection config
     */
    detect(_config) {
        const attributes = {};
        const env = (0, core_1.getEnv)();
        const rawAttributes = env.OTEL_RESOURCE_ATTRIBUTES;
        const serviceName = env.OTEL_SERVICE_NAME;
        if (rawAttributes) {
            try {
                const parsedAttributes = this._parseResourceAttributes(rawAttributes);
                Object.assign(attributes, parsedAttributes);
            }
            catch (e) {
                api_1.diag.debug(`EnvDetector failed: ${e.message}`);
            }
        }
        if (serviceName) {
            attributes[semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME] = serviceName;
        }
        return new Resource_1.Resource(attributes);
    }
    /**
     * Creates an attribute map from the OTEL_RESOURCE_ATTRIBUTES environment
     * variable.
     *
     * OTEL_RESOURCE_ATTRIBUTES: A comma-separated list of attributes describing
     * the source in more detail, e.g. “key1=val1,key2=val2”. Domain names and
     * paths are accepted as attribute keys. Values may be quoted or unquoted in
     * general. If a value contains whitespaces, =, or " characters, it must
     * always be quoted.
     *
     * @param rawEnvAttributes The resource attributes as a comma-seperated list
     * of key/value pairs.
     * @returns The sanitized resource attributes.
     */
    _parseResourceAttributes(rawEnvAttributes) {
        if (!rawEnvAttributes)
            return {};
        const attributes = {};
        const rawAttributes = rawEnvAttributes.split(this._COMMA_SEPARATOR, -1);
        for (const rawAttribute of rawAttributes) {
            const keyValuePair = rawAttribute.split(this._LABEL_KEY_VALUE_SPLITTER, -1);
            if (keyValuePair.length !== 2) {
                continue;
            }
            let [key, value] = keyValuePair;
            // Leading and trailing whitespaces are trimmed.
            key = key.trim();
            value = value.trim().split(/^"|"$/).join('');
            if (!this._isValidAndNotEmpty(key)) {
                throw new Error(`Attribute key ${this._ERROR_MESSAGE_INVALID_CHARS}`);
            }
            if (!this._isValid(value)) {
                throw new Error(`Attribute value ${this._ERROR_MESSAGE_INVALID_VALUE}`);
            }
            attributes[key] = decodeURIComponent(value);
        }
        return attributes;
    }
    /**
     * Determines whether the given String is a valid printable ASCII string with
     * a length not exceed _MAX_LENGTH characters.
     *
     * @param str The String to be validated.
     * @returns Whether the String is valid.
     */
    _isValid(name) {
        return name.length <= this._MAX_LENGTH && this._isBaggageOctetString(name);
    }
    // https://www.w3.org/TR/baggage/#definition
    _isBaggageOctetString(str) {
        for (let i = 0; i < str.length; i++) {
            const ch = str.charCodeAt(i);
            if (ch < 0x21 || ch === 0x2c || ch === 0x3b || ch === 0x5c || ch > 0x7e) {
                return false;
            }
        }
        return true;
    }
    /**
     * Determines whether the given String is a valid printable ASCII string with
     * a length greater than 0 and not exceed _MAX_LENGTH characters.
     *
     * @param str The String to be validated.
     * @returns Whether the String is valid and not empty.
     */
    _isValidAndNotEmpty(str) {
        return str.length > 0 && this._isValid(str);
    }
}
exports.envDetectorSync = new EnvDetectorSync();
//# sourceMappingURL=EnvDetectorSync.js.map

/***/ }),

/***/ 4918:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(5969), exports);
__exportStar(__nccwpck_require__(2474), exports);
__exportStar(__nccwpck_require__(3010), exports);
__exportStar(__nccwpck_require__(4565), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 3871:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(2723), exports);
__exportStar(__nccwpck_require__(920), exports);
__exportStar(__nccwpck_require__(7784), exports);
__exportStar(__nccwpck_require__(9566), exports);
__exportStar(__nccwpck_require__(1565), exports);
__exportStar(__nccwpck_require__(4918), exports);
__exportStar(__nccwpck_require__(990), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 7784:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(342), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 9056:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.hostDetector = void 0;
const HostDetectorSync_1 = __nccwpck_require__(6511);
/**
 * HostDetector detects the resources related to the host current process is
 * running on. Currently only non-cloud-based attributes are included.
 */
class HostDetector {
    detect(_config) {
        return Promise.resolve(HostDetectorSync_1.hostDetectorSync.detect(_config));
    }
}
exports.hostDetector = new HostDetector();
//# sourceMappingURL=HostDetector.js.map

/***/ }),

/***/ 6511:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.hostDetectorSync = void 0;
const semantic_conventions_1 = __nccwpck_require__(7275);
const Resource_1 = __nccwpck_require__(2723);
const os_1 = __nccwpck_require__(2037);
const utils_1 = __nccwpck_require__(5892);
const getMachineId_1 = __nccwpck_require__(9223);
/**
 * HostDetectorSync detects the resources related to the host current process is
 * running on. Currently only non-cloud-based attributes are included.
 */
class HostDetectorSync {
    detect(_config) {
        const attributes = {
            [semantic_conventions_1.SemanticResourceAttributes.HOST_NAME]: (0, os_1.hostname)(),
            [semantic_conventions_1.SemanticResourceAttributes.HOST_ARCH]: (0, utils_1.normalizeArch)((0, os_1.arch)()),
        };
        return new Resource_1.Resource(attributes, this._getAsyncAttributes());
    }
    _getAsyncAttributes() {
        return (0, getMachineId_1.getMachineId)().then(machineId => {
            const attributes = {};
            if (machineId) {
                attributes[semantic_conventions_1.SemanticResourceAttributes.HOST_ID] = machineId;
            }
            return attributes;
        });
    }
}
exports.hostDetectorSync = new HostDetectorSync();
//# sourceMappingURL=HostDetectorSync.js.map

/***/ }),

/***/ 4618:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.osDetector = void 0;
const OSDetectorSync_1 = __nccwpck_require__(2411);
/**
 * OSDetector detects the resources related to the operating system (OS) on
 * which the process represented by this resource is running.
 */
class OSDetector {
    detect(_config) {
        return Promise.resolve(OSDetectorSync_1.osDetectorSync.detect(_config));
    }
}
exports.osDetector = new OSDetector();
//# sourceMappingURL=OSDetector.js.map

/***/ }),

/***/ 2411:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.osDetectorSync = void 0;
const semantic_conventions_1 = __nccwpck_require__(7275);
const Resource_1 = __nccwpck_require__(2723);
const os_1 = __nccwpck_require__(2037);
const utils_1 = __nccwpck_require__(5892);
/**
 * OSDetectorSync detects the resources related to the operating system (OS) on
 * which the process represented by this resource is running.
 */
class OSDetectorSync {
    detect(_config) {
        const attributes = {
            [semantic_conventions_1.SemanticResourceAttributes.OS_TYPE]: (0, utils_1.normalizeType)((0, os_1.platform)()),
            [semantic_conventions_1.SemanticResourceAttributes.OS_VERSION]: (0, os_1.release)(),
        };
        return new Resource_1.Resource(attributes);
    }
}
exports.osDetectorSync = new OSDetectorSync();
//# sourceMappingURL=OSDetectorSync.js.map

/***/ }),

/***/ 5650:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.processDetector = void 0;
const ProcessDetectorSync_1 = __nccwpck_require__(4225);
/**
 * ProcessDetector will be used to detect the resources related current process running
 * and being instrumented from the NodeJS Process module.
 */
class ProcessDetector {
    detect(config) {
        return Promise.resolve(ProcessDetectorSync_1.processDetectorSync.detect(config));
    }
}
exports.processDetector = new ProcessDetector();
//# sourceMappingURL=ProcessDetector.js.map

/***/ }),

/***/ 4225:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.processDetectorSync = void 0;
const api_1 = __nccwpck_require__(5163);
const semantic_conventions_1 = __nccwpck_require__(7275);
const Resource_1 = __nccwpck_require__(2723);
const os = __nccwpck_require__(2037);
/**
 * ProcessDetectorSync will be used to detect the resources related current process running
 * and being instrumented from the NodeJS Process module.
 */
class ProcessDetectorSync {
    detect(_config) {
        const attributes = {
            [semantic_conventions_1.SemanticResourceAttributes.PROCESS_PID]: process.pid,
            [semantic_conventions_1.SemanticResourceAttributes.PROCESS_EXECUTABLE_NAME]: process.title,
            [semantic_conventions_1.SemanticResourceAttributes.PROCESS_EXECUTABLE_PATH]: process.execPath,
            [semantic_conventions_1.SemanticResourceAttributes.PROCESS_COMMAND_ARGS]: [
                process.argv[0],
                ...process.execArgv,
                ...process.argv.slice(1),
            ],
            [semantic_conventions_1.SemanticResourceAttributes.PROCESS_RUNTIME_VERSION]: process.versions.node,
            [semantic_conventions_1.SemanticResourceAttributes.PROCESS_RUNTIME_NAME]: 'nodejs',
            [semantic_conventions_1.SemanticResourceAttributes.PROCESS_RUNTIME_DESCRIPTION]: 'Node.js',
        };
        if (process.argv.length > 1) {
            attributes[semantic_conventions_1.SemanticResourceAttributes.PROCESS_COMMAND] = process.argv[1];
        }
        try {
            const userInfo = os.userInfo();
            attributes[semantic_conventions_1.SemanticResourceAttributes.PROCESS_OWNER] = userInfo.username;
        }
        catch (e) {
            api_1.diag.debug(`error obtaining process owner: ${e}`);
        }
        return new Resource_1.Resource(attributes);
    }
}
exports.processDetectorSync = new ProcessDetectorSync();
//# sourceMappingURL=ProcessDetectorSync.js.map

/***/ }),

/***/ 5671:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultServiceName = void 0;
function defaultServiceName() {
    return `unknown_service:${process.argv0}`;
}
exports.defaultServiceName = defaultServiceName;
//# sourceMappingURL=default-service-name.js.map

/***/ }),

/***/ 342:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(5671), exports);
__exportStar(__nccwpck_require__(9056), exports);
__exportStar(__nccwpck_require__(4618), exports);
__exportStar(__nccwpck_require__(6511), exports);
__exportStar(__nccwpck_require__(2411), exports);
__exportStar(__nccwpck_require__(5650), exports);
__exportStar(__nccwpck_require__(4225), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 1062:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.execAsync = void 0;
const child_process = __nccwpck_require__(2081);
const util = __nccwpck_require__(3837);
exports.execAsync = util.promisify(child_process.exec);
//# sourceMappingURL=execAsync.js.map

/***/ }),

/***/ 1755:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

var __webpack_unused_export__;

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
__webpack_unused_export__ = ({ value: true });
exports.$ = void 0;
const fs_1 = __nccwpck_require__(7147);
const execAsync_1 = __nccwpck_require__(1062);
const api_1 = __nccwpck_require__(5163);
async function getMachineId() {
    try {
        const result = await fs_1.promises.readFile('/etc/hostid', { encoding: 'utf8' });
        return result.trim();
    }
    catch (e) {
        api_1.diag.debug(`error reading machine id: ${e}`);
    }
    try {
        const result = await (0, execAsync_1.execAsync)('kenv -q smbios.system.uuid');
        return result.stdout.trim();
    }
    catch (e) {
        api_1.diag.debug(`error reading machine id: ${e}`);
    }
    return '';
}
exports.$ = getMachineId;
//# sourceMappingURL=getMachineId-bsd.js.map

/***/ }),

/***/ 1622:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

var __webpack_unused_export__;

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
__webpack_unused_export__ = ({ value: true });
exports.$ = void 0;
const execAsync_1 = __nccwpck_require__(1062);
const api_1 = __nccwpck_require__(5163);
async function getMachineId() {
    try {
        const result = await (0, execAsync_1.execAsync)('ioreg -rd1 -c "IOPlatformExpertDevice"');
        const idLine = result.stdout
            .split('\n')
            .find(line => line.includes('IOPlatformUUID'));
        if (!idLine) {
            return '';
        }
        const parts = idLine.split('" = "');
        if (parts.length === 2) {
            return parts[1].slice(0, -1);
        }
    }
    catch (e) {
        api_1.diag.debug(`error reading machine id: ${e}`);
    }
    return '';
}
exports.$ = getMachineId;
//# sourceMappingURL=getMachineId-darwin.js.map

/***/ }),

/***/ 8142:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.$ = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const fs_1 = __nccwpck_require__(7147);
const api_1 = __nccwpck_require__(5163);
async function getMachineId() {
    const paths = ['/etc/machine-id', '/var/lib/dbus/machine-id'];
    for (const path of paths) {
        try {
            const result = await fs_1.promises.readFile(path, { encoding: 'utf8' });
            return result.trim();
        }
        catch (e) {
            api_1.diag.debug(`error reading machine id: ${e}`);
        }
    }
    return '';
}
exports.$ = getMachineId;
//# sourceMappingURL=getMachineId-linux.js.map

/***/ }),

/***/ 9375:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

var __webpack_unused_export__;

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
__webpack_unused_export__ = ({ value: true });
exports.$ = void 0;
const api_1 = __nccwpck_require__(5163);
async function getMachineId() {
    api_1.diag.debug('could not read machine-id: unsupported platform');
    return '';
}
exports.$ = getMachineId;
//# sourceMappingURL=getMachineId-unsupported.js.map

/***/ }),

/***/ 4475:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

var __webpack_unused_export__;

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
__webpack_unused_export__ = ({ value: true });
exports.$ = void 0;
const process = __nccwpck_require__(7282);
const execAsync_1 = __nccwpck_require__(1062);
const api_1 = __nccwpck_require__(5163);
async function getMachineId() {
    const args = 'QUERY HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography /v MachineGuid';
    let command = '%windir%\\System32\\REG.exe';
    if (process.arch === 'ia32' && 'PROCESSOR_ARCHITEW6432' in process.env) {
        command = '%windir%\\sysnative\\cmd.exe /c ' + command;
    }
    try {
        const result = await (0, execAsync_1.execAsync)(`${command} ${args}`);
        const parts = result.stdout.split('REG_SZ');
        if (parts.length === 2) {
            return parts[1].trim();
        }
    }
    catch (e) {
        api_1.diag.debug(`error reading machine id: ${e}`);
    }
    return '';
}
exports.$ = getMachineId;
//# sourceMappingURL=getMachineId-win.js.map

/***/ }),

/***/ 9223:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getMachineId = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const process = __nccwpck_require__(7282);
let getMachineId;
exports.getMachineId = getMachineId;
switch (process.platform) {
    case 'darwin':
        (exports.getMachineId = getMachineId = (__nccwpck_require__(1622)/* .getMachineId */ .$));
        break;
    case 'linux':
        (exports.getMachineId = getMachineId = (__nccwpck_require__(8142)/* .getMachineId */ .$));
        break;
    case 'freebsd':
        (exports.getMachineId = getMachineId = (__nccwpck_require__(1755)/* .getMachineId */ .$));
        break;
    case 'win32':
        (exports.getMachineId = getMachineId = (__nccwpck_require__(4475)/* .getMachineId */ .$));
        break;
    default:
        (exports.getMachineId = getMachineId = (__nccwpck_require__(9375)/* .getMachineId */ .$));
}
//# sourceMappingURL=getMachineId.js.map

/***/ }),

/***/ 5892:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.normalizeType = exports.normalizeArch = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const normalizeArch = (nodeArchString) => {
    // Maps from https://nodejs.org/api/os.html#osarch to arch values in spec:
    // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/semantic_conventions/host.md
    switch (nodeArchString) {
        case 'arm':
            return 'arm32';
        case 'ppc':
            return 'ppc32';
        case 'x64':
            return 'amd64';
        default:
            return nodeArchString;
    }
};
exports.normalizeArch = normalizeArch;
const normalizeType = (nodePlatform) => {
    // Maps from https://nodejs.org/api/os.html#osplatform to arch values in spec:
    // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/semantic_conventions/os.md
    switch (nodePlatform) {
        case 'sunos':
            return 'solaris';
        case 'win32':
            return 'windows';
        default:
            return nodePlatform;
    }
};
exports.normalizeType = normalizeType;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 9566:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=types.js.map

/***/ }),

/***/ 4298:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isPromiseLike = void 0;
const isPromiseLike = (val) => {
    return (val !== null && typeof val === 'object' && typeof val.then === 'function');
};
exports.isPromiseLike = isPromiseLike;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 2671:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isValidName = exports.isDescriptorCompatibleWith = exports.createInstrumentDescriptorWithView = exports.createInstrumentDescriptor = exports.InstrumentType = void 0;
const api_1 = __nccwpck_require__(5163);
const utils_1 = __nccwpck_require__(9158);
/**
 * Supported types of metric instruments.
 */
var InstrumentType;
(function (InstrumentType) {
    InstrumentType["COUNTER"] = "COUNTER";
    InstrumentType["HISTOGRAM"] = "HISTOGRAM";
    InstrumentType["UP_DOWN_COUNTER"] = "UP_DOWN_COUNTER";
    InstrumentType["OBSERVABLE_COUNTER"] = "OBSERVABLE_COUNTER";
    InstrumentType["OBSERVABLE_GAUGE"] = "OBSERVABLE_GAUGE";
    InstrumentType["OBSERVABLE_UP_DOWN_COUNTER"] = "OBSERVABLE_UP_DOWN_COUNTER";
})(InstrumentType = exports.InstrumentType || (exports.InstrumentType = {}));
function createInstrumentDescriptor(name, type, options) {
    var _a, _b, _c, _d;
    if (!isValidName(name)) {
        api_1.diag.warn(`Invalid metric name: "${name}". The metric name should be a ASCII string with a length no greater than 255 characters.`);
    }
    return {
        name,
        type,
        description: (_a = options === null || options === void 0 ? void 0 : options.description) !== null && _a !== void 0 ? _a : '',
        unit: (_b = options === null || options === void 0 ? void 0 : options.unit) !== null && _b !== void 0 ? _b : '',
        valueType: (_c = options === null || options === void 0 ? void 0 : options.valueType) !== null && _c !== void 0 ? _c : api_1.ValueType.DOUBLE,
        advice: (_d = options === null || options === void 0 ? void 0 : options.advice) !== null && _d !== void 0 ? _d : {},
    };
}
exports.createInstrumentDescriptor = createInstrumentDescriptor;
function createInstrumentDescriptorWithView(view, instrument) {
    var _a, _b;
    return {
        name: (_a = view.name) !== null && _a !== void 0 ? _a : instrument.name,
        description: (_b = view.description) !== null && _b !== void 0 ? _b : instrument.description,
        type: instrument.type,
        unit: instrument.unit,
        valueType: instrument.valueType,
        advice: instrument.advice,
    };
}
exports.createInstrumentDescriptorWithView = createInstrumentDescriptorWithView;
function isDescriptorCompatibleWith(descriptor, otherDescriptor) {
    // Names are case-insensitive strings.
    return ((0, utils_1.equalsCaseInsensitive)(descriptor.name, otherDescriptor.name) &&
        descriptor.unit === otherDescriptor.unit &&
        descriptor.type === otherDescriptor.type &&
        descriptor.valueType === otherDescriptor.valueType);
}
exports.isDescriptorCompatibleWith = isDescriptorCompatibleWith;
// ASCII string with a length no greater than 255 characters.
// NB: the first character counted separately from the rest.
const NAME_REGEXP = /^[a-z][a-z0-9_.\-/]{0,254}$/i;
function isValidName(name) {
    return name.match(NAME_REGEXP) != null;
}
exports.isValidName = isValidName;
//# sourceMappingURL=InstrumentDescriptor.js.map

/***/ }),

/***/ 667:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isObservableInstrument = exports.ObservableUpDownCounterInstrument = exports.ObservableGaugeInstrument = exports.ObservableCounterInstrument = exports.ObservableInstrument = exports.HistogramInstrument = exports.CounterInstrument = exports.UpDownCounterInstrument = exports.SyncInstrument = void 0;
const api_1 = __nccwpck_require__(5163);
const core_1 = __nccwpck_require__(9736);
class SyncInstrument {
    constructor(_writableMetricStorage, _descriptor) {
        this._writableMetricStorage = _writableMetricStorage;
        this._descriptor = _descriptor;
    }
    _record(value, attributes = {}, context = api_1.context.active()) {
        if (typeof value !== 'number') {
            api_1.diag.warn(`non-number value provided to metric ${this._descriptor.name}: ${value}`);
            return;
        }
        if (this._descriptor.valueType === api_1.ValueType.INT &&
            !Number.isInteger(value)) {
            api_1.diag.warn(`INT value type cannot accept a floating-point value for ${this._descriptor.name}, ignoring the fractional digits.`);
            value = Math.trunc(value);
            // ignore non-finite values.
            if (!Number.isInteger(value)) {
                return;
            }
        }
        this._writableMetricStorage.record(value, attributes, context, (0, core_1.millisToHrTime)(Date.now()));
    }
}
exports.SyncInstrument = SyncInstrument;
/**
 * The class implements {@link UpDownCounter} interface.
 */
class UpDownCounterInstrument extends SyncInstrument {
    /**
     * Increment value of counter by the input. Inputs may be negative.
     */
    add(value, attributes, ctx) {
        this._record(value, attributes, ctx);
    }
}
exports.UpDownCounterInstrument = UpDownCounterInstrument;
/**
 * The class implements {@link Counter} interface.
 */
class CounterInstrument extends SyncInstrument {
    /**
     * Increment value of counter by the input. Inputs may not be negative.
     */
    add(value, attributes, ctx) {
        if (value < 0) {
            api_1.diag.warn(`negative value provided to counter ${this._descriptor.name}: ${value}`);
            return;
        }
        this._record(value, attributes, ctx);
    }
}
exports.CounterInstrument = CounterInstrument;
/**
 * The class implements {@link Histogram} interface.
 */
class HistogramInstrument extends SyncInstrument {
    /**
     * Records a measurement. Value of the measurement must not be negative.
     */
    record(value, attributes, ctx) {
        if (value < 0) {
            api_1.diag.warn(`negative value provided to histogram ${this._descriptor.name}: ${value}`);
            return;
        }
        this._record(value, attributes, ctx);
    }
}
exports.HistogramInstrument = HistogramInstrument;
class ObservableInstrument {
    constructor(descriptor, metricStorages, _observableRegistry) {
        this._observableRegistry = _observableRegistry;
        this._descriptor = descriptor;
        this._metricStorages = metricStorages;
    }
    /**
     * @see {Observable.addCallback}
     */
    addCallback(callback) {
        this._observableRegistry.addCallback(callback, this);
    }
    /**
     * @see {Observable.removeCallback}
     */
    removeCallback(callback) {
        this._observableRegistry.removeCallback(callback, this);
    }
}
exports.ObservableInstrument = ObservableInstrument;
class ObservableCounterInstrument extends ObservableInstrument {
}
exports.ObservableCounterInstrument = ObservableCounterInstrument;
class ObservableGaugeInstrument extends ObservableInstrument {
}
exports.ObservableGaugeInstrument = ObservableGaugeInstrument;
class ObservableUpDownCounterInstrument extends ObservableInstrument {
}
exports.ObservableUpDownCounterInstrument = ObservableUpDownCounterInstrument;
function isObservableInstrument(it) {
    return it instanceof ObservableInstrument;
}
exports.isObservableInstrument = isObservableInstrument;
//# sourceMappingURL=Instruments.js.map

/***/ }),

/***/ 5894:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Meter = void 0;
const InstrumentDescriptor_1 = __nccwpck_require__(2671);
const Instruments_1 = __nccwpck_require__(667);
/**
 * This class implements the {@link IMeter} interface.
 */
class Meter {
    constructor(_meterSharedState) {
        this._meterSharedState = _meterSharedState;
    }
    /**
     * Create a {@link Histogram} instrument.
     */
    createHistogram(name, options) {
        const descriptor = (0, InstrumentDescriptor_1.createInstrumentDescriptor)(name, InstrumentDescriptor_1.InstrumentType.HISTOGRAM, options);
        const storage = this._meterSharedState.registerMetricStorage(descriptor);
        return new Instruments_1.HistogramInstrument(storage, descriptor);
    }
    /**
     * Create a {@link Counter} instrument.
     */
    createCounter(name, options) {
        const descriptor = (0, InstrumentDescriptor_1.createInstrumentDescriptor)(name, InstrumentDescriptor_1.InstrumentType.COUNTER, options);
        const storage = this._meterSharedState.registerMetricStorage(descriptor);
        return new Instruments_1.CounterInstrument(storage, descriptor);
    }
    /**
     * Create a {@link UpDownCounter} instrument.
     */
    createUpDownCounter(name, options) {
        const descriptor = (0, InstrumentDescriptor_1.createInstrumentDescriptor)(name, InstrumentDescriptor_1.InstrumentType.UP_DOWN_COUNTER, options);
        const storage = this._meterSharedState.registerMetricStorage(descriptor);
        return new Instruments_1.UpDownCounterInstrument(storage, descriptor);
    }
    /**
     * Create a {@link ObservableGauge} instrument.
     */
    createObservableGauge(name, options) {
        const descriptor = (0, InstrumentDescriptor_1.createInstrumentDescriptor)(name, InstrumentDescriptor_1.InstrumentType.OBSERVABLE_GAUGE, options);
        const storages = this._meterSharedState.registerAsyncMetricStorage(descriptor);
        return new Instruments_1.ObservableGaugeInstrument(descriptor, storages, this._meterSharedState.observableRegistry);
    }
    /**
     * Create a {@link ObservableCounter} instrument.
     */
    createObservableCounter(name, options) {
        const descriptor = (0, InstrumentDescriptor_1.createInstrumentDescriptor)(name, InstrumentDescriptor_1.InstrumentType.OBSERVABLE_COUNTER, options);
        const storages = this._meterSharedState.registerAsyncMetricStorage(descriptor);
        return new Instruments_1.ObservableCounterInstrument(descriptor, storages, this._meterSharedState.observableRegistry);
    }
    /**
     * Create a {@link ObservableUpDownCounter} instrument.
     */
    createObservableUpDownCounter(name, options) {
        const descriptor = (0, InstrumentDescriptor_1.createInstrumentDescriptor)(name, InstrumentDescriptor_1.InstrumentType.OBSERVABLE_UP_DOWN_COUNTER, options);
        const storages = this._meterSharedState.registerAsyncMetricStorage(descriptor);
        return new Instruments_1.ObservableUpDownCounterInstrument(descriptor, storages, this._meterSharedState.observableRegistry);
    }
    /**
     * @see {@link Meter.addBatchObservableCallback}
     */
    addBatchObservableCallback(callback, observables) {
        this._meterSharedState.observableRegistry.addBatchCallback(callback, observables);
    }
    /**
     * @see {@link Meter.removeBatchObservableCallback}
     */
    removeBatchObservableCallback(callback, observables) {
        this._meterSharedState.observableRegistry.removeBatchCallback(callback, observables);
    }
}
exports.Meter = Meter;
//# sourceMappingURL=Meter.js.map

/***/ }),

/***/ 310:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MeterProvider = void 0;
const api_1 = __nccwpck_require__(5163);
const resources_1 = __nccwpck_require__(3871);
const MeterProviderSharedState_1 = __nccwpck_require__(898);
const MetricCollector_1 = __nccwpck_require__(142);
/**
 * This class implements the {@link MeterProvider} interface.
 */
class MeterProvider {
    constructor(options) {
        var _a;
        this._shutdown = false;
        const resource = resources_1.Resource.default().merge((_a = options === null || options === void 0 ? void 0 : options.resource) !== null && _a !== void 0 ? _a : resources_1.Resource.empty());
        this._sharedState = new MeterProviderSharedState_1.MeterProviderSharedState(resource);
        if ((options === null || options === void 0 ? void 0 : options.views) != null && options.views.length > 0) {
            for (const view of options.views) {
                this._sharedState.viewRegistry.addView(view);
            }
        }
        if ((options === null || options === void 0 ? void 0 : options.readers) != null && options.readers.length > 0) {
            for (const metricReader of options.readers) {
                this.addMetricReader(metricReader);
            }
        }
    }
    /**
     * Get a meter with the configuration of the MeterProvider.
     */
    getMeter(name, version = '', options = {}) {
        // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#meter-creation
        if (this._shutdown) {
            api_1.diag.warn('A shutdown MeterProvider cannot provide a Meter');
            return (0, api_1.createNoopMeter)();
        }
        return this._sharedState.getMeterSharedState({
            name,
            version,
            schemaUrl: options.schemaUrl,
        }).meter;
    }
    /**
     * Register a {@link MetricReader} to the meter provider. After the
     * registration, the MetricReader can start metrics collection.
     *
     * <p> NOTE: {@link MetricReader} instances MUST be added before creating any instruments.
     * A {@link MetricReader} instance registered later may receive no or incomplete metric data.
     *
     * @param metricReader the metric reader to be registered.
     *
     * @deprecated This method will be removed in SDK 2.0. Please use
     * {@link MeterProviderOptions.readers} via the {@link MeterProvider} constructor instead
     */
    addMetricReader(metricReader) {
        const collector = new MetricCollector_1.MetricCollector(this._sharedState, metricReader);
        metricReader.setMetricProducer(collector);
        this._sharedState.metricCollectors.push(collector);
    }
    /**
     * Flush all buffered data and shut down the MeterProvider and all registered
     * MetricReaders.
     *
     * Returns a promise which is resolved when all flushes are complete.
     */
    async shutdown(options) {
        if (this._shutdown) {
            api_1.diag.warn('shutdown may only be called once per MeterProvider');
            return;
        }
        this._shutdown = true;
        await Promise.all(this._sharedState.metricCollectors.map(collector => {
            return collector.shutdown(options);
        }));
    }
    /**
     * Notifies all registered MetricReaders to flush any buffered data.
     *
     * Returns a promise which is resolved when all flushes are complete.
     */
    async forceFlush(options) {
        // do not flush after shutdown
        if (this._shutdown) {
            api_1.diag.warn('invalid attempt to force flush after MeterProvider shutdown');
            return;
        }
        await Promise.all(this._sharedState.metricCollectors.map(collector => {
            return collector.forceFlush(options);
        }));
    }
}
exports.MeterProvider = MeterProvider;
//# sourceMappingURL=MeterProvider.js.map

/***/ }),

/***/ 183:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BatchObservableResultImpl = exports.ObservableResultImpl = void 0;
const api_1 = __nccwpck_require__(5163);
const HashMap_1 = __nccwpck_require__(205);
const Instruments_1 = __nccwpck_require__(667);
/**
 * The class implements {@link ObservableResult} interface.
 */
class ObservableResultImpl {
    constructor(_instrumentName, _valueType) {
        this._instrumentName = _instrumentName;
        this._valueType = _valueType;
        /**
         * @internal
         */
        this._buffer = new HashMap_1.AttributeHashMap();
    }
    /**
     * Observe a measurement of the value associated with the given attributes.
     */
    observe(value, attributes = {}) {
        if (typeof value !== 'number') {
            api_1.diag.warn(`non-number value provided to metric ${this._instrumentName}: ${value}`);
            return;
        }
        if (this._valueType === api_1.ValueType.INT && !Number.isInteger(value)) {
            api_1.diag.warn(`INT value type cannot accept a floating-point value for ${this._instrumentName}, ignoring the fractional digits.`);
            value = Math.trunc(value);
            // ignore non-finite values.
            if (!Number.isInteger(value)) {
                return;
            }
        }
        this._buffer.set(attributes, value);
    }
}
exports.ObservableResultImpl = ObservableResultImpl;
/**
 * The class implements {@link BatchObservableCallback} interface.
 */
class BatchObservableResultImpl {
    constructor() {
        /**
         * @internal
         */
        this._buffer = new Map();
    }
    /**
     * Observe a measurement of the value associated with the given attributes.
     */
    observe(metric, value, attributes = {}) {
        if (!(0, Instruments_1.isObservableInstrument)(metric)) {
            return;
        }
        let map = this._buffer.get(metric);
        if (map == null) {
            map = new HashMap_1.AttributeHashMap();
            this._buffer.set(metric, map);
        }
        if (typeof value !== 'number') {
            api_1.diag.warn(`non-number value provided to metric ${metric._descriptor.name}: ${value}`);
            return;
        }
        if (metric._descriptor.valueType === api_1.ValueType.INT &&
            !Number.isInteger(value)) {
            api_1.diag.warn(`INT value type cannot accept a floating-point value for ${metric._descriptor.name}, ignoring the fractional digits.`);
            value = Math.trunc(value);
            // ignore non-finite values.
            if (!Number.isInteger(value)) {
                return;
            }
        }
        map.set(attributes, value);
    }
}
exports.BatchObservableResultImpl = BatchObservableResultImpl;
//# sourceMappingURL=ObservableResult.js.map

/***/ }),

/***/ 4905:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DropAggregator = void 0;
const types_1 = __nccwpck_require__(6430);
/** Basic aggregator for None which keeps no recorded value. */
class DropAggregator {
    constructor() {
        this.kind = types_1.AggregatorKind.DROP;
    }
    createAccumulation() {
        return undefined;
    }
    merge(_previous, _delta) {
        return undefined;
    }
    diff(_previous, _current) {
        return undefined;
    }
    toMetricData(_descriptor, _aggregationTemporality, _accumulationByAttributes, _endTime) {
        return undefined;
    }
}
exports.DropAggregator = DropAggregator;
//# sourceMappingURL=Drop.js.map

/***/ }),

/***/ 9405:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExponentialHistogramAggregator = exports.ExponentialHistogramAccumulation = void 0;
const types_1 = __nccwpck_require__(6430);
const MetricData_1 = __nccwpck_require__(1729);
const api_1 = __nccwpck_require__(5163);
const InstrumentDescriptor_1 = __nccwpck_require__(2671);
const Buckets_1 = __nccwpck_require__(7202);
const getMapping_1 = __nccwpck_require__(1861);
const util_1 = __nccwpck_require__(4589);
// HighLow is a utility class used for computing a common scale for
// two exponential histogram accumulations
class HighLow {
    constructor(low, high) {
        this.low = low;
        this.high = high;
    }
    static combine(h1, h2) {
        return new HighLow(Math.min(h1.low, h2.low), Math.max(h1.high, h2.high));
    }
}
const MAX_SCALE = 20;
const DEFAULT_MAX_SIZE = 160;
const MIN_MAX_SIZE = 2;
class ExponentialHistogramAccumulation {
    constructor(startTime = startTime, _maxSize = DEFAULT_MAX_SIZE, _recordMinMax = true, _sum = 0, _count = 0, _zeroCount = 0, _min = Number.POSITIVE_INFINITY, _max = Number.NEGATIVE_INFINITY, _positive = new Buckets_1.Buckets(), _negative = new Buckets_1.Buckets(), _mapping = (0, getMapping_1.getMapping)(MAX_SCALE)) {
        this.startTime = startTime;
        this._maxSize = _maxSize;
        this._recordMinMax = _recordMinMax;
        this._sum = _sum;
        this._count = _count;
        this._zeroCount = _zeroCount;
        this._min = _min;
        this._max = _max;
        this._positive = _positive;
        this._negative = _negative;
        this._mapping = _mapping;
        if (this._maxSize < MIN_MAX_SIZE) {
            api_1.diag.warn(`Exponential Histogram Max Size set to ${this._maxSize}, \
                changing to the minimum size of: ${MIN_MAX_SIZE}`);
            this._maxSize = MIN_MAX_SIZE;
        }
    }
    /**
     * record updates a histogram with a single count
     * @param {Number} value
     */
    record(value) {
        this.updateByIncrement(value, 1);
    }
    /**
     * Sets the start time for this accumulation
     * @param {HrTime} startTime
     */
    setStartTime(startTime) {
        this.startTime = startTime;
    }
    /**
     * Returns the datapoint representation of this accumulation
     * @param {HrTime} startTime
     */
    toPointValue() {
        return {
            hasMinMax: this._recordMinMax,
            min: this.min,
            max: this.max,
            sum: this.sum,
            positive: {
                offset: this.positive.offset,
                bucketCounts: this.positive.counts(),
            },
            negative: {
                offset: this.negative.offset,
                bucketCounts: this.negative.counts(),
            },
            count: this.count,
            scale: this.scale,
            zeroCount: this.zeroCount,
        };
    }
    /**
     * @returns {Number} The sum of values recorded by this accumulation
     */
    get sum() {
        return this._sum;
    }
    /**
     * @returns {Number} The minimum value recorded by this accumulation
     */
    get min() {
        return this._min;
    }
    /**
     * @returns {Number} The maximum value recorded by this accumulation
     */
    get max() {
        return this._max;
    }
    /**
     * @returns {Number} The count of values recorded by this accumulation
     */
    get count() {
        return this._count;
    }
    /**
     * @returns {Number} The number of 0 values recorded by this accumulation
     */
    get zeroCount() {
        return this._zeroCount;
    }
    /**
     * @returns {Number} The scale used by thie accumulation
     */
    get scale() {
        if (this._count === this._zeroCount) {
            // all zeros! scale doesn't matter, use zero
            return 0;
        }
        return this._mapping.scale;
    }
    /**
     * positive holds the postive values
     * @returns {Buckets}
     */
    get positive() {
        return this._positive;
    }
    /**
     * negative holds the negative values by their absolute value
     * @returns {Buckets}
     */
    get negative() {
        return this._negative;
    }
    /**
     * uppdateByIncr supports updating a histogram with a non-negative
     * increment.
     * @param value
     * @param increment
     */
    updateByIncrement(value, increment) {
        if (value > this._max) {
            this._max = value;
        }
        if (value < this._min) {
            this._min = value;
        }
        this._count += increment;
        if (value === 0) {
            this._zeroCount += increment;
            return;
        }
        this._sum += value * increment;
        if (value > 0) {
            this._updateBuckets(this._positive, value, increment);
        }
        else {
            this._updateBuckets(this._negative, -value, increment);
        }
    }
    /**
     * merge combines data from previous value into self
     * @param {ExponentialHistogramAccumulation} previous
     */
    merge(previous) {
        if (this._count === 0) {
            this._min = previous.min;
            this._max = previous.max;
        }
        else if (previous.count !== 0) {
            if (previous.min < this.min) {
                this._min = previous.min;
            }
            if (previous.max > this.max) {
                this._max = previous.max;
            }
        }
        this.startTime = previous.startTime;
        this._sum += previous.sum;
        this._count += previous.count;
        this._zeroCount += previous.zeroCount;
        const minScale = this._minScale(previous);
        this._downscale(this.scale - minScale);
        this._mergeBuckets(this.positive, previous, previous.positive, minScale);
        this._mergeBuckets(this.negative, previous, previous.negative, minScale);
    }
    /**
     * diff substracts other from self
     * @param {ExponentialHistogramAccumulation} other
     */
    diff(other) {
        this._min = Infinity;
        this._max = -Infinity;
        this._sum -= other.sum;
        this._count -= other.count;
        this._zeroCount -= other.zeroCount;
        const minScale = this._minScale(other);
        this._downscale(this.scale - minScale);
        this._diffBuckets(this.positive, other, other.positive, minScale);
        this._diffBuckets(this.negative, other, other.negative, minScale);
    }
    /**
     * clone returns a deep copy of self
     * @returns {ExponentialHistogramAccumulation}
     */
    clone() {
        return new ExponentialHistogramAccumulation(this.startTime, this._maxSize, this._recordMinMax, this._sum, this._count, this._zeroCount, this._min, this._max, this.positive.clone(), this.negative.clone(), this._mapping);
    }
    /**
     * _updateBuckets maps the incoming value to a bucket index for the current
     * scale. If the bucket index is outside of the range of the backing array,
     * it will rescale the backing array and update the mapping for the new scale.
     */
    _updateBuckets(buckets, value, increment) {
        let index = this._mapping.mapToIndex(value);
        // rescale the mapping if needed
        let rescalingNeeded = false;
        let high = 0;
        let low = 0;
        if (buckets.length === 0) {
            buckets.indexStart = index;
            buckets.indexEnd = buckets.indexStart;
            buckets.indexBase = buckets.indexStart;
        }
        else if (index < buckets.indexStart &&
            buckets.indexEnd - index >= this._maxSize) {
            rescalingNeeded = true;
            low = index;
            high = buckets.indexEnd;
        }
        else if (index > buckets.indexEnd &&
            index - buckets.indexStart >= this._maxSize) {
            rescalingNeeded = true;
            low = buckets.indexStart;
            high = index;
        }
        // rescale and compute index at new scale
        if (rescalingNeeded) {
            const change = this._changeScale(high, low);
            this._downscale(change);
            index = this._mapping.mapToIndex(value);
        }
        this._incrementIndexBy(buckets, index, increment);
    }
    /**
     * _incrementIndexBy increments the count of the bucket specified by `index`.
     * If the index is outside of the range [buckets.indexStart, buckets.indexEnd]
     * the boundaries of the backing array will be adjusted and more buckets will
     * be added if needed.
     */
    _incrementIndexBy(buckets, index, increment) {
        if (increment === 0) {
            // nothing to do for a zero increment, can happen during a merge operation
            return;
        }
        if (index < buckets.indexStart) {
            const span = buckets.indexEnd - index;
            if (span >= buckets.backing.length) {
                this._grow(buckets, span + 1);
            }
            buckets.indexStart = index;
        }
        else if (index > buckets.indexEnd) {
            const span = index - buckets.indexStart;
            if (span >= buckets.backing.length) {
                this._grow(buckets, span + 1);
            }
            buckets.indexEnd = index;
        }
        let bucketIndex = index - buckets.indexBase;
        if (bucketIndex < 0) {
            bucketIndex += buckets.backing.length;
        }
        buckets.incrementBucket(bucketIndex, increment);
    }
    /**
     * grow resizes the backing array by doubling in size up to maxSize.
     * This extends the array with a bunch of zeros and copies the
     * existing counts to the same position.
     */
    _grow(buckets, needed) {
        const size = buckets.backing.length;
        const bias = buckets.indexBase - buckets.indexStart;
        const oldPositiveLimit = size - bias;
        let newSize = (0, util_1.nextGreaterSquare)(needed);
        if (newSize > this._maxSize) {
            newSize = this._maxSize;
        }
        const newPositiveLimit = newSize - bias;
        buckets.backing.growTo(newSize, oldPositiveLimit, newPositiveLimit);
    }
    /**
     * _changeScale computes how much downscaling is needed by shifting the
     * high and low values until they are separated by no more than size.
     */
    _changeScale(high, low) {
        let change = 0;
        while (high - low >= this._maxSize) {
            high >>= 1;
            low >>= 1;
            change++;
        }
        return change;
    }
    /**
     * _downscale subtracts `change` from the current mapping scale.
     */
    _downscale(change) {
        if (change === 0) {
            return;
        }
        if (change < 0) {
            // Note: this should be impossible. If we get here it's because
            // there is a bug in the implementation.
            throw new Error(`impossible change of scale: ${this.scale}`);
        }
        const newScale = this._mapping.scale - change;
        this._positive.downscale(change);
        this._negative.downscale(change);
        this._mapping = (0, getMapping_1.getMapping)(newScale);
    }
    /**
     * _minScale is used by diff and merge to compute an ideal combined scale
     */
    _minScale(other) {
        const minScale = Math.min(this.scale, other.scale);
        const highLowPos = HighLow.combine(this._highLowAtScale(this.positive, this.scale, minScale), this._highLowAtScale(other.positive, other.scale, minScale));
        const highLowNeg = HighLow.combine(this._highLowAtScale(this.negative, this.scale, minScale), this._highLowAtScale(other.negative, other.scale, minScale));
        return Math.min(minScale - this._changeScale(highLowPos.high, highLowPos.low), minScale - this._changeScale(highLowNeg.high, highLowNeg.low));
    }
    /**
     * _highLowAtScale is used by diff and merge to compute an ideal combined scale.
     */
    _highLowAtScale(buckets, currentScale, newScale) {
        if (buckets.length === 0) {
            return new HighLow(0, -1);
        }
        const shift = currentScale - newScale;
        return new HighLow(buckets.indexStart >> shift, buckets.indexEnd >> shift);
    }
    /**
     * _mergeBuckets translates index values from another histogram and
     * adds the values into the corresponding buckets of this histogram.
     */
    _mergeBuckets(ours, other, theirs, scale) {
        const theirOffset = theirs.offset;
        const theirChange = other.scale - scale;
        for (let i = 0; i < theirs.length; i++) {
            this._incrementIndexBy(ours, (theirOffset + i) >> theirChange, theirs.at(i));
        }
    }
    /**
     * _diffBuckets translates index values from another histogram and
     * subtracts the values in the corresponding buckets of this histogram.
     */
    _diffBuckets(ours, other, theirs, scale) {
        const theirOffset = theirs.offset;
        const theirChange = other.scale - scale;
        for (let i = 0; i < theirs.length; i++) {
            const ourIndex = (theirOffset + i) >> theirChange;
            let bucketIndex = ourIndex - ours.indexBase;
            if (bucketIndex < 0) {
                bucketIndex += ours.backing.length;
            }
            ours.decrementBucket(bucketIndex, theirs.at(i));
        }
        ours.trim();
    }
}
exports.ExponentialHistogramAccumulation = ExponentialHistogramAccumulation;
/**
 * Aggregator for ExponentialHistogramAccumlations
 */
class ExponentialHistogramAggregator {
    /**
     * @param _maxSize Maximum number of buckets for each of the positive
     *    and negative ranges, exclusive of the zero-bucket.
     * @param _recordMinMax If set to true, min and max will be recorded.
     *    Otherwise, min and max will not be recorded.
     */
    constructor(_maxSize, _recordMinMax) {
        this._maxSize = _maxSize;
        this._recordMinMax = _recordMinMax;
        this.kind = types_1.AggregatorKind.EXPONENTIAL_HISTOGRAM;
    }
    createAccumulation(startTime) {
        return new ExponentialHistogramAccumulation(startTime, this._maxSize, this._recordMinMax);
    }
    /**
     * Return the result of the merge of two exponential histogram accumulations.
     */
    merge(previous, delta) {
        const result = delta.clone();
        result.merge(previous);
        return result;
    }
    /**
     * Returns a new DELTA aggregation by comparing two cumulative measurements.
     */
    diff(previous, current) {
        const result = current.clone();
        result.diff(previous);
        return result;
    }
    toMetricData(descriptor, aggregationTemporality, accumulationByAttributes, endTime) {
        return {
            descriptor,
            aggregationTemporality,
            dataPointType: MetricData_1.DataPointType.EXPONENTIAL_HISTOGRAM,
            dataPoints: accumulationByAttributes.map(([attributes, accumulation]) => {
                const pointValue = accumulation.toPointValue();
                // determine if instrument allows negative values.
                const allowsNegativeValues = descriptor.type === InstrumentDescriptor_1.InstrumentType.UP_DOWN_COUNTER ||
                    descriptor.type === InstrumentDescriptor_1.InstrumentType.OBSERVABLE_GAUGE ||
                    descriptor.type === InstrumentDescriptor_1.InstrumentType.OBSERVABLE_UP_DOWN_COUNTER;
                return {
                    attributes,
                    startTime: accumulation.startTime,
                    endTime,
                    value: {
                        min: pointValue.hasMinMax ? pointValue.min : undefined,
                        max: pointValue.hasMinMax ? pointValue.max : undefined,
                        sum: !allowsNegativeValues ? pointValue.sum : undefined,
                        positive: {
                            offset: pointValue.positive.offset,
                            bucketCounts: pointValue.positive.bucketCounts,
                        },
                        negative: {
                            offset: pointValue.negative.offset,
                            bucketCounts: pointValue.negative.bucketCounts,
                        },
                        count: pointValue.count,
                        scale: pointValue.scale,
                        zeroCount: pointValue.zeroCount,
                    },
                };
            }),
        };
    }
}
exports.ExponentialHistogramAggregator = ExponentialHistogramAggregator;
//# sourceMappingURL=ExponentialHistogram.js.map

/***/ }),

/***/ 5389:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HistogramAggregator = exports.HistogramAccumulation = void 0;
const types_1 = __nccwpck_require__(6430);
const MetricData_1 = __nccwpck_require__(1729);
const InstrumentDescriptor_1 = __nccwpck_require__(2671);
const utils_1 = __nccwpck_require__(9158);
function createNewEmptyCheckpoint(boundaries) {
    const counts = boundaries.map(() => 0);
    counts.push(0);
    return {
        buckets: {
            boundaries,
            counts,
        },
        sum: 0,
        count: 0,
        hasMinMax: false,
        min: Infinity,
        max: -Infinity,
    };
}
class HistogramAccumulation {
    constructor(startTime, _boundaries, _recordMinMax = true, _current = createNewEmptyCheckpoint(_boundaries)) {
        this.startTime = startTime;
        this._boundaries = _boundaries;
        this._recordMinMax = _recordMinMax;
        this._current = _current;
    }
    record(value) {
        this._current.count += 1;
        this._current.sum += value;
        if (this._recordMinMax) {
            this._current.min = Math.min(value, this._current.min);
            this._current.max = Math.max(value, this._current.max);
            this._current.hasMinMax = true;
        }
        const idx = (0, utils_1.binarySearchLB)(this._boundaries, value);
        this._current.buckets.counts[idx + 1] += 1;
    }
    setStartTime(startTime) {
        this.startTime = startTime;
    }
    toPointValue() {
        return this._current;
    }
}
exports.HistogramAccumulation = HistogramAccumulation;
/**
 * Basic aggregator which observes events and counts them in pre-defined buckets
 * and provides the total sum and count of all observations.
 */
class HistogramAggregator {
    /**
     * @param _boundaries sorted upper bounds of recorded values.
     * @param _recordMinMax If set to true, min and max will be recorded. Otherwise, min and max will not be recorded.
     */
    constructor(_boundaries, _recordMinMax) {
        this._boundaries = _boundaries;
        this._recordMinMax = _recordMinMax;
        this.kind = types_1.AggregatorKind.HISTOGRAM;
    }
    createAccumulation(startTime) {
        return new HistogramAccumulation(startTime, this._boundaries, this._recordMinMax);
    }
    /**
     * Return the result of the merge of two histogram accumulations. As long as one Aggregator
     * instance produces all Accumulations with constant boundaries we don't need to worry about
     * merging accumulations with different boundaries.
     */
    merge(previous, delta) {
        const previousValue = previous.toPointValue();
        const deltaValue = delta.toPointValue();
        const previousCounts = previousValue.buckets.counts;
        const deltaCounts = deltaValue.buckets.counts;
        const mergedCounts = new Array(previousCounts.length);
        for (let idx = 0; idx < previousCounts.length; idx++) {
            mergedCounts[idx] = previousCounts[idx] + deltaCounts[idx];
        }
        let min = Infinity;
        let max = -Infinity;
        if (this._recordMinMax) {
            if (previousValue.hasMinMax && deltaValue.hasMinMax) {
                min = Math.min(previousValue.min, deltaValue.min);
                max = Math.max(previousValue.max, deltaValue.max);
            }
            else if (previousValue.hasMinMax) {
                min = previousValue.min;
                max = previousValue.max;
            }
            else if (deltaValue.hasMinMax) {
                min = deltaValue.min;
                max = deltaValue.max;
            }
        }
        return new HistogramAccumulation(previous.startTime, previousValue.buckets.boundaries, this._recordMinMax, {
            buckets: {
                boundaries: previousValue.buckets.boundaries,
                counts: mergedCounts,
            },
            count: previousValue.count + deltaValue.count,
            sum: previousValue.sum + deltaValue.sum,
            hasMinMax: this._recordMinMax &&
                (previousValue.hasMinMax || deltaValue.hasMinMax),
            min: min,
            max: max,
        });
    }
    /**
     * Returns a new DELTA aggregation by comparing two cumulative measurements.
     */
    diff(previous, current) {
        const previousValue = previous.toPointValue();
        const currentValue = current.toPointValue();
        const previousCounts = previousValue.buckets.counts;
        const currentCounts = currentValue.buckets.counts;
        const diffedCounts = new Array(previousCounts.length);
        for (let idx = 0; idx < previousCounts.length; idx++) {
            diffedCounts[idx] = currentCounts[idx] - previousCounts[idx];
        }
        return new HistogramAccumulation(current.startTime, previousValue.buckets.boundaries, this._recordMinMax, {
            buckets: {
                boundaries: previousValue.buckets.boundaries,
                counts: diffedCounts,
            },
            count: currentValue.count - previousValue.count,
            sum: currentValue.sum - previousValue.sum,
            hasMinMax: false,
            min: Infinity,
            max: -Infinity,
        });
    }
    toMetricData(descriptor, aggregationTemporality, accumulationByAttributes, endTime) {
        return {
            descriptor,
            aggregationTemporality,
            dataPointType: MetricData_1.DataPointType.HISTOGRAM,
            dataPoints: accumulationByAttributes.map(([attributes, accumulation]) => {
                const pointValue = accumulation.toPointValue();
                // determine if instrument allows negative values.
                const allowsNegativeValues = descriptor.type === InstrumentDescriptor_1.InstrumentType.UP_DOWN_COUNTER ||
                    descriptor.type === InstrumentDescriptor_1.InstrumentType.OBSERVABLE_GAUGE ||
                    descriptor.type === InstrumentDescriptor_1.InstrumentType.OBSERVABLE_UP_DOWN_COUNTER;
                return {
                    attributes,
                    startTime: accumulation.startTime,
                    endTime,
                    value: {
                        min: pointValue.hasMinMax ? pointValue.min : undefined,
                        max: pointValue.hasMinMax ? pointValue.max : undefined,
                        sum: !allowsNegativeValues ? pointValue.sum : undefined,
                        buckets: pointValue.buckets,
                        count: pointValue.count,
                    },
                };
            }),
        };
    }
}
exports.HistogramAggregator = HistogramAggregator;
//# sourceMappingURL=Histogram.js.map

/***/ }),

/***/ 5209:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LastValueAggregator = exports.LastValueAccumulation = void 0;
const types_1 = __nccwpck_require__(6430);
const core_1 = __nccwpck_require__(9736);
const MetricData_1 = __nccwpck_require__(1729);
class LastValueAccumulation {
    constructor(startTime, _current = 0, sampleTime = [0, 0]) {
        this.startTime = startTime;
        this._current = _current;
        this.sampleTime = sampleTime;
    }
    record(value) {
        this._current = value;
        this.sampleTime = (0, core_1.millisToHrTime)(Date.now());
    }
    setStartTime(startTime) {
        this.startTime = startTime;
    }
    toPointValue() {
        return this._current;
    }
}
exports.LastValueAccumulation = LastValueAccumulation;
/** Basic aggregator which calculates a LastValue from individual measurements. */
class LastValueAggregator {
    constructor() {
        this.kind = types_1.AggregatorKind.LAST_VALUE;
    }
    createAccumulation(startTime) {
        return new LastValueAccumulation(startTime);
    }
    /**
     * Returns the result of the merge of the given accumulations.
     *
     * Return the newly captured (delta) accumulation for LastValueAggregator.
     */
    merge(previous, delta) {
        // nanoseconds may lose precisions.
        const latestAccumulation = (0, core_1.hrTimeToMicroseconds)(delta.sampleTime) >=
            (0, core_1.hrTimeToMicroseconds)(previous.sampleTime)
            ? delta
            : previous;
        return new LastValueAccumulation(previous.startTime, latestAccumulation.toPointValue(), latestAccumulation.sampleTime);
    }
    /**
     * Returns a new DELTA aggregation by comparing two cumulative measurements.
     *
     * A delta aggregation is not meaningful to LastValueAggregator, just return
     * the newly captured (delta) accumulation for LastValueAggregator.
     */
    diff(previous, current) {
        // nanoseconds may lose precisions.
        const latestAccumulation = (0, core_1.hrTimeToMicroseconds)(current.sampleTime) >=
            (0, core_1.hrTimeToMicroseconds)(previous.sampleTime)
            ? current
            : previous;
        return new LastValueAccumulation(current.startTime, latestAccumulation.toPointValue(), latestAccumulation.sampleTime);
    }
    toMetricData(descriptor, aggregationTemporality, accumulationByAttributes, endTime) {
        return {
            descriptor,
            aggregationTemporality,
            dataPointType: MetricData_1.DataPointType.GAUGE,
            dataPoints: accumulationByAttributes.map(([attributes, accumulation]) => {
                return {
                    attributes,
                    startTime: accumulation.startTime,
                    endTime,
                    value: accumulation.toPointValue(),
                };
            }),
        };
    }
}
exports.LastValueAggregator = LastValueAggregator;
//# sourceMappingURL=LastValue.js.map

/***/ }),

/***/ 5394:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SumAggregator = exports.SumAccumulation = void 0;
const types_1 = __nccwpck_require__(6430);
const MetricData_1 = __nccwpck_require__(1729);
class SumAccumulation {
    constructor(startTime, monotonic, _current = 0, reset = false) {
        this.startTime = startTime;
        this.monotonic = monotonic;
        this._current = _current;
        this.reset = reset;
    }
    record(value) {
        if (this.monotonic && value < 0) {
            return;
        }
        this._current += value;
    }
    setStartTime(startTime) {
        this.startTime = startTime;
    }
    toPointValue() {
        return this._current;
    }
}
exports.SumAccumulation = SumAccumulation;
/** Basic aggregator which calculates a Sum from individual measurements. */
class SumAggregator {
    constructor(monotonic) {
        this.monotonic = monotonic;
        this.kind = types_1.AggregatorKind.SUM;
    }
    createAccumulation(startTime) {
        return new SumAccumulation(startTime, this.monotonic);
    }
    /**
     * Returns the result of the merge of the given accumulations.
     */
    merge(previous, delta) {
        const prevPv = previous.toPointValue();
        const deltaPv = delta.toPointValue();
        if (delta.reset) {
            return new SumAccumulation(delta.startTime, this.monotonic, deltaPv, delta.reset);
        }
        return new SumAccumulation(previous.startTime, this.monotonic, prevPv + deltaPv);
    }
    /**
     * Returns a new DELTA aggregation by comparing two cumulative measurements.
     */
    diff(previous, current) {
        const prevPv = previous.toPointValue();
        const currPv = current.toPointValue();
        /**
         * If the SumAggregator is a monotonic one and the previous point value is
         * greater than the current one, a reset is deemed to be happened.
         * Return the current point value to prevent the value from been reset.
         */
        if (this.monotonic && prevPv > currPv) {
            return new SumAccumulation(current.startTime, this.monotonic, currPv, true);
        }
        return new SumAccumulation(current.startTime, this.monotonic, currPv - prevPv);
    }
    toMetricData(descriptor, aggregationTemporality, accumulationByAttributes, endTime) {
        return {
            descriptor,
            aggregationTemporality,
            dataPointType: MetricData_1.DataPointType.SUM,
            dataPoints: accumulationByAttributes.map(([attributes, accumulation]) => {
                return {
                    attributes,
                    startTime: accumulation.startTime,
                    endTime,
                    value: accumulation.toPointValue(),
                };
            }),
            isMonotonic: this.monotonic,
        };
    }
}
exports.SumAggregator = SumAggregator;
//# sourceMappingURL=Sum.js.map

/***/ }),

/***/ 7202:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Buckets = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Buckets {
    /**
     * The term index refers to the number of the exponential histogram bucket
     * used to determine its boundaries. The lower boundary of a bucket is
     * determined by base ** index and the upper boundary of a bucket is
     * determined by base ** (index + 1). index values are signed to account
     * for values less than or equal to 1.
     *
     * indexBase is the index of the 0th position in the
     * backing array, i.e., backing[0] is the count
     * in the bucket with index `indexBase`.
     *
     * indexStart is the smallest index value represented
     * in the backing array.
     *
     * indexEnd is the largest index value represented in
     * the backing array.
     */
    constructor(backing = new BucketsBacking(), indexBase = 0, indexStart = 0, indexEnd = 0) {
        this.backing = backing;
        this.indexBase = indexBase;
        this.indexStart = indexStart;
        this.indexEnd = indexEnd;
    }
    /**
     * Offset is the bucket index of the smallest entry in the counts array
     * @returns {number}
     */
    get offset() {
        return this.indexStart;
    }
    /**
     * Buckets is a view into the backing array.
     * @returns {number}
     */
    get length() {
        if (this.backing.length === 0) {
            return 0;
        }
        if (this.indexEnd === this.indexStart && this.at(0) === 0) {
            return 0;
        }
        return this.indexEnd - this.indexStart + 1;
    }
    /**
     * An array of counts, where count[i] carries the count
     * of the bucket at index (offset+i).  count[i] is the count of
     * values greater than base^(offset+i) and less than or equal to
     * base^(offset+i+1).
     * @returns {number} The logical counts based on the backing array
     */
    counts() {
        return Array.from({ length: this.length }, (_, i) => this.at(i));
    }
    /**
     * At returns the count of the bucket at a position in the logical
     * array of counts.
     * @param position
     * @returns {number}
     */
    at(position) {
        const bias = this.indexBase - this.indexStart;
        if (position < bias) {
            position += this.backing.length;
        }
        position -= bias;
        return this.backing.countAt(position);
    }
    /**
     * incrementBucket increments the backing array index by `increment`
     * @param bucketIndex
     * @param increment
     */
    incrementBucket(bucketIndex, increment) {
        this.backing.increment(bucketIndex, increment);
    }
    /**
     * decrementBucket decrements the backing array index by `decrement`
     * if decrement is greater than the current value, it's set to 0.
     * @param bucketIndex
     * @param decrement
     */
    decrementBucket(bucketIndex, decrement) {
        this.backing.decrement(bucketIndex, decrement);
    }
    /**
     * trim removes leading and / or trailing zero buckets (which can occur
     * after diffing two histos) and rotates the backing array so that the
     * smallest non-zero index is in the 0th position of the backing array
     */
    trim() {
        for (let i = 0; i < this.length; i++) {
            if (this.at(i) !== 0) {
                this.indexStart += i;
                break;
            }
            else if (i === this.length - 1) {
                //the entire array is zeroed out
                this.indexStart = this.indexEnd = this.indexBase = 0;
                return;
            }
        }
        for (let i = this.length - 1; i >= 0; i--) {
            if (this.at(i) !== 0) {
                this.indexEnd -= this.length - i - 1;
                break;
            }
        }
        this._rotate();
    }
    /**
     * downscale first rotates, then collapses 2**`by`-to-1 buckets.
     * @param by
     */
    downscale(by) {
        this._rotate();
        const size = 1 + this.indexEnd - this.indexStart;
        const each = 1 << by;
        let inpos = 0;
        let outpos = 0;
        for (let pos = this.indexStart; pos <= this.indexEnd;) {
            let mod = pos % each;
            if (mod < 0) {
                mod += each;
            }
            for (let i = mod; i < each && inpos < size; i++) {
                this._relocateBucket(outpos, inpos);
                inpos++;
                pos++;
            }
            outpos++;
        }
        this.indexStart >>= by;
        this.indexEnd >>= by;
        this.indexBase = this.indexStart;
    }
    /**
     * Clone returns a deep copy of Buckets
     * @returns {Buckets}
     */
    clone() {
        return new Buckets(this.backing.clone(), this.indexBase, this.indexStart, this.indexEnd);
    }
    /**
     * _rotate shifts the backing array contents so that indexStart ==
     * indexBase to simplify the downscale logic.
     */
    _rotate() {
        const bias = this.indexBase - this.indexStart;
        if (bias === 0) {
            return;
        }
        else if (bias > 0) {
            this.backing.reverse(0, this.backing.length);
            this.backing.reverse(0, bias);
            this.backing.reverse(bias, this.backing.length);
        }
        else {
            // negative bias, this can happen when diffing two histograms
            this.backing.reverse(0, this.backing.length);
            this.backing.reverse(0, this.backing.length + bias);
        }
        this.indexBase = this.indexStart;
    }
    /**
     * _relocateBucket adds the count in counts[src] to counts[dest] and
     * resets count[src] to zero.
     */
    _relocateBucket(dest, src) {
        if (dest === src) {
            return;
        }
        this.incrementBucket(dest, this.backing.emptyBucket(src));
    }
}
exports.Buckets = Buckets;
/**
 * BucketsBacking holds the raw buckets and some utility methods to
 * manage them.
 */
class BucketsBacking {
    constructor(_counts = [0]) {
        this._counts = _counts;
    }
    /**
     * length returns the physical size of the backing array, which
     * is >= buckets.length()
     */
    get length() {
        return this._counts.length;
    }
    /**
     * countAt returns the count in a specific bucket
     */
    countAt(pos) {
        return this._counts[pos];
    }
    /**
     * growTo grows a backing array and copies old entries
     * into their correct new positions.
     */
    growTo(newSize, oldPositiveLimit, newPositiveLimit) {
        const tmp = new Array(newSize).fill(0);
        tmp.splice(newPositiveLimit, this._counts.length - oldPositiveLimit, ...this._counts.slice(oldPositiveLimit));
        tmp.splice(0, oldPositiveLimit, ...this._counts.slice(0, oldPositiveLimit));
        this._counts = tmp;
    }
    /**
     * reverse the items in the backing array in the range [from, limit).
     */
    reverse(from, limit) {
        const num = Math.floor((from + limit) / 2) - from;
        for (let i = 0; i < num; i++) {
            const tmp = this._counts[from + i];
            this._counts[from + i] = this._counts[limit - i - 1];
            this._counts[limit - i - 1] = tmp;
        }
    }
    /**
     * emptyBucket empties the count from a bucket, for
     * moving into another.
     */
    emptyBucket(src) {
        const tmp = this._counts[src];
        this._counts[src] = 0;
        return tmp;
    }
    /**
     * increments a bucket by `increment`
     */
    increment(bucketIndex, increment) {
        this._counts[bucketIndex] += increment;
    }
    /**
     * decrements a bucket by `decrement`
     */
    decrement(bucketIndex, decrement) {
        if (this._counts[bucketIndex] >= decrement) {
            this._counts[bucketIndex] -= decrement;
        }
        else {
            // this should not happen, but we're being defensive against
            // negative counts.
            this._counts[bucketIndex] = 0;
        }
    }
    /**
     * clone returns a deep copy of BucketsBacking
     */
    clone() {
        return new BucketsBacking([...this._counts]);
    }
}
//# sourceMappingURL=Buckets.js.map

/***/ }),

/***/ 6074:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExponentMapping = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ieee754 = __nccwpck_require__(4708);
const util = __nccwpck_require__(4589);
const types_1 = __nccwpck_require__(3133);
/**
 * ExponentMapping implements exponential mapping functions for
 * scales <=0. For scales > 0 LogarithmMapping should be used.
 */
class ExponentMapping {
    constructor(scale) {
        this._shift = -scale;
    }
    /**
     * Maps positive floating point values to indexes corresponding to scale
     * @param value
     * @returns {number} index for provided value at the current scale
     */
    mapToIndex(value) {
        if (value < ieee754.MIN_VALUE) {
            return this._minNormalLowerBoundaryIndex();
        }
        const exp = ieee754.getNormalBase2(value);
        // In case the value is an exact power of two, compute a
        // correction of -1. Note, we are using a custom _rightShift
        // to accommodate a 52-bit argument, which the native bitwise
        // operators do not support
        const correction = this._rightShift(ieee754.getSignificand(value) - 1, ieee754.SIGNIFICAND_WIDTH);
        return (exp + correction) >> this._shift;
    }
    /**
     * Returns the lower bucket boundary for the given index for scale
     *
     * @param index
     * @returns {number}
     */
    lowerBoundary(index) {
        const minIndex = this._minNormalLowerBoundaryIndex();
        if (index < minIndex) {
            throw new types_1.MappingError(`underflow: ${index} is < minimum lower boundary: ${minIndex}`);
        }
        const maxIndex = this._maxNormalLowerBoundaryIndex();
        if (index > maxIndex) {
            throw new types_1.MappingError(`overflow: ${index} is > maximum lower boundary: ${maxIndex}`);
        }
        return util.ldexp(1, index << this._shift);
    }
    /**
     * The scale used by this mapping
     * @returns {number}
     */
    get scale() {
        if (this._shift === 0) {
            return 0;
        }
        return -this._shift;
    }
    _minNormalLowerBoundaryIndex() {
        let index = ieee754.MIN_NORMAL_EXPONENT >> this._shift;
        if (this._shift < 2) {
            index--;
        }
        return index;
    }
    _maxNormalLowerBoundaryIndex() {
        return ieee754.MAX_NORMAL_EXPONENT >> this._shift;
    }
    _rightShift(value, shift) {
        return Math.floor(value * Math.pow(2, -shift));
    }
}
exports.ExponentMapping = ExponentMapping;
//# sourceMappingURL=ExponentMapping.js.map

/***/ }),

/***/ 9147:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LogarithmMapping = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ieee754 = __nccwpck_require__(4708);
const util = __nccwpck_require__(4589);
const types_1 = __nccwpck_require__(3133);
/**
 * LogarithmMapping implements exponential mapping functions for scale > 0.
 * For scales <= 0 the exponent mapping should be used.
 */
class LogarithmMapping {
    constructor(scale) {
        this._scale = scale;
        this._scaleFactor = util.ldexp(Math.LOG2E, scale);
        this._inverseFactor = util.ldexp(Math.LN2, -scale);
    }
    /**
     * Maps positive floating point values to indexes corresponding to scale
     * @param value
     * @returns {number} index for provided value at the current scale
     */
    mapToIndex(value) {
        if (value <= ieee754.MIN_VALUE) {
            return this._minNormalLowerBoundaryIndex() - 1;
        }
        // exact power of two special case
        if (ieee754.getSignificand(value) === 0) {
            const exp = ieee754.getNormalBase2(value);
            return (exp << this._scale) - 1;
        }
        // non-power of two cases. use Math.floor to round the scaled logarithm
        const index = Math.floor(Math.log(value) * this._scaleFactor);
        const maxIndex = this._maxNormalLowerBoundaryIndex();
        if (index >= maxIndex) {
            return maxIndex;
        }
        return index;
    }
    /**
     * Returns the lower bucket boundary for the given index for scale
     *
     * @param index
     * @returns {number}
     */
    lowerBoundary(index) {
        const maxIndex = this._maxNormalLowerBoundaryIndex();
        if (index >= maxIndex) {
            if (index === maxIndex) {
                return 2 * Math.exp((index - (1 << this._scale)) / this._scaleFactor);
            }
            throw new types_1.MappingError(`overflow: ${index} is > maximum lower boundary: ${maxIndex}`);
        }
        const minIndex = this._minNormalLowerBoundaryIndex();
        if (index <= minIndex) {
            if (index === minIndex) {
                return ieee754.MIN_VALUE;
            }
            else if (index === minIndex - 1) {
                return Math.exp((index + (1 << this._scale)) / this._scaleFactor) / 2;
            }
            throw new types_1.MappingError(`overflow: ${index} is < minimum lower boundary: ${minIndex}`);
        }
        return Math.exp(index * this._inverseFactor);
    }
    /**
     * The scale used by this mapping
     * @returns {number}
     */
    get scale() {
        return this._scale;
    }
    _minNormalLowerBoundaryIndex() {
        return ieee754.MIN_NORMAL_EXPONENT << this._scale;
    }
    _maxNormalLowerBoundaryIndex() {
        return ((ieee754.MAX_NORMAL_EXPONENT + 1) << this._scale) - 1;
    }
}
exports.LogarithmMapping = LogarithmMapping;
//# sourceMappingURL=LogarithmMapping.js.map

/***/ }),

/***/ 1861:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getMapping = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ExponentMapping_1 = __nccwpck_require__(6074);
const LogarithmMapping_1 = __nccwpck_require__(9147);
const types_1 = __nccwpck_require__(3133);
const MIN_SCALE = -10;
const MAX_SCALE = 20;
const PREBUILT_MAPPINGS = Array.from({ length: 31 }, (_, i) => {
    if (i > 10) {
        return new LogarithmMapping_1.LogarithmMapping(i - 10);
    }
    return new ExponentMapping_1.ExponentMapping(i - 10);
});
/**
 * getMapping returns an appropriate mapping for the given scale. For scales -10
 * to 0 the underlying type will be ExponentMapping. For scales 1 to 20 the
 * underlying type will be LogarithmMapping.
 * @param scale a number in the range [-10, 20]
 * @returns {Mapping}
 */
function getMapping(scale) {
    if (scale > MAX_SCALE || scale < MIN_SCALE) {
        throw new types_1.MappingError(`expected scale >= ${MIN_SCALE} && <= ${MAX_SCALE}, got: ${scale}`);
    }
    // mappings are offset by 10. scale -10 is at position 0 and scale 20 is at 30
    return PREBUILT_MAPPINGS[scale + 10];
}
exports.getMapping = getMapping;
//# sourceMappingURL=getMapping.js.map

/***/ }),

/***/ 4708:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getSignificand = exports.getNormalBase2 = exports.MIN_VALUE = exports.MAX_NORMAL_EXPONENT = exports.MIN_NORMAL_EXPONENT = exports.SIGNIFICAND_WIDTH = void 0;
/**
 * The functions and constants in this file allow us to interact
 * with the internal representation of an IEEE 64-bit floating point
 * number. We need to work with all 64-bits, thus, care needs to be
 * taken when working with Javascript's bitwise operators (<<, >>, &,
 * |, etc) as they truncate operands to 32-bits. In order to work around
 * this we work with the 64-bits as two 32-bit halves, perform bitwise
 * operations on them independently, and combine the results (if needed).
 */
exports.SIGNIFICAND_WIDTH = 52;
/**
 * EXPONENT_MASK is set to 1 for the hi 32-bits of an IEEE 754
 * floating point exponent: 0x7ff00000.
 */
const EXPONENT_MASK = 0x7ff00000;
/**
 * SIGNIFICAND_MASK is the mask for the significand portion of the hi 32-bits
 * of an IEEE 754 double-precision floating-point value: 0xfffff
 */
const SIGNIFICAND_MASK = 0xfffff;
/**
 * EXPONENT_BIAS is the exponent bias specified for encoding
 * the IEEE 754 double-precision floating point exponent: 1023
 */
const EXPONENT_BIAS = 1023;
/**
 * MIN_NORMAL_EXPONENT is the minimum exponent of a normalized
 * floating point: -1022.
 */
exports.MIN_NORMAL_EXPONENT = -EXPONENT_BIAS + 1;
/**
 * MAX_NORMAL_EXPONENT is the maximum exponent of a normalized
 * floating point: 1023.
 */
exports.MAX_NORMAL_EXPONENT = EXPONENT_BIAS;
/**
 * MIN_VALUE is the smallest normal number
 */
exports.MIN_VALUE = Math.pow(2, -1022);
/**
 * getNormalBase2 extracts the normalized base-2 fractional exponent.
 * This returns k for the equation f x 2**k where f is
 * in the range [1, 2).  Note that this function is not called for
 * subnormal numbers.
 * @param {number} value - the value to determine normalized base-2 fractional
 *    exponent for
 * @returns {number} the normalized base-2 exponent
 */
function getNormalBase2(value) {
    const dv = new DataView(new ArrayBuffer(8));
    dv.setFloat64(0, value);
    // access the raw 64-bit float as 32-bit uints
    const hiBits = dv.getUint32(0);
    const expBits = (hiBits & EXPONENT_MASK) >> 20;
    return expBits - EXPONENT_BIAS;
}
exports.getNormalBase2 = getNormalBase2;
/**
 * GetSignificand returns the 52 bit (unsigned) significand as a signed value.
 * @param {number} value - the floating point number to extract the significand from
 * @returns {number} The 52-bit significand
 */
function getSignificand(value) {
    const dv = new DataView(new ArrayBuffer(8));
    dv.setFloat64(0, value);
    // access the raw 64-bit float as two 32-bit uints
    const hiBits = dv.getUint32(0);
    const loBits = dv.getUint32(4);
    // extract the significand bits from the hi bits and left shift 32 places note:
    // we can't use the native << operator as it will truncate the result to 32-bits
    const significandHiBits = (hiBits & SIGNIFICAND_MASK) * Math.pow(2, 32);
    // combine the hi and lo bits and return
    return significandHiBits + loBits;
}
exports.getSignificand = getSignificand;
//# sourceMappingURL=ieee754.js.map

/***/ }),

/***/ 3133:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MappingError = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class MappingError extends Error {
}
exports.MappingError = MappingError;
//# sourceMappingURL=types.js.map

/***/ }),

/***/ 4589:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.nextGreaterSquare = exports.ldexp = void 0;
/**
 * Note: other languages provide this as a built in function. This is
 * a naive, but functionally correct implementation. This is used sparingly,
 * when creating a new mapping in a running application.
 *
 * ldexp returns frac × 2**exp. With the following special cases:
 *   ldexp(±0, exp) = ±0
 *   ldexp(±Inf, exp) = ±Inf
 *   ldexp(NaN, exp) = NaN
 * @param frac
 * @param exp
 * @returns {number}
 */
function ldexp(frac, exp) {
    if (frac === 0 ||
        frac === Number.POSITIVE_INFINITY ||
        frac === Number.NEGATIVE_INFINITY ||
        Number.isNaN(frac)) {
        return frac;
    }
    return frac * Math.pow(2, exp);
}
exports.ldexp = ldexp;
/**
 * Computes the next power of two that is greater than or equal to v.
 * This implementation more efficient than, but functionally equivalent
 * to Math.pow(2, Math.ceil(Math.log(x)/Math.log(2))).
 * @param v
 * @returns {number}
 */
function nextGreaterSquare(v) {
    // The following expression computes the least power-of-two
    // that is >= v.  There are a number of tricky ways to
    // do this, see https://stackoverflow.com/questions/466204/rounding-up-to-next-power-of-2
    v--;
    v |= v >> 1;
    v |= v >> 2;
    v |= v >> 4;
    v |= v >> 8;
    v |= v >> 16;
    v++;
    return v;
}
exports.nextGreaterSquare = nextGreaterSquare;
//# sourceMappingURL=util.js.map

/***/ }),

/***/ 5922:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(4905), exports);
__exportStar(__nccwpck_require__(5389), exports);
__exportStar(__nccwpck_require__(9405), exports);
__exportStar(__nccwpck_require__(5209), exports);
__exportStar(__nccwpck_require__(5394), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 6430:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AggregatorKind = void 0;
/** The kind of aggregator. */
var AggregatorKind;
(function (AggregatorKind) {
    AggregatorKind[AggregatorKind["DROP"] = 0] = "DROP";
    AggregatorKind[AggregatorKind["SUM"] = 1] = "SUM";
    AggregatorKind[AggregatorKind["LAST_VALUE"] = 2] = "LAST_VALUE";
    AggregatorKind[AggregatorKind["HISTOGRAM"] = 3] = "HISTOGRAM";
    AggregatorKind[AggregatorKind["EXPONENTIAL_HISTOGRAM"] = 4] = "EXPONENTIAL_HISTOGRAM";
})(AggregatorKind = exports.AggregatorKind || (exports.AggregatorKind = {}));
//# sourceMappingURL=types.js.map

/***/ }),

/***/ 8747:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR = exports.DEFAULT_AGGREGATION_SELECTOR = void 0;
const Aggregation_1 = __nccwpck_require__(4769);
const AggregationTemporality_1 = __nccwpck_require__(8589);
const DEFAULT_AGGREGATION_SELECTOR = _instrumentType => Aggregation_1.Aggregation.Default();
exports.DEFAULT_AGGREGATION_SELECTOR = DEFAULT_AGGREGATION_SELECTOR;
const DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR = _instrumentType => AggregationTemporality_1.AggregationTemporality.CUMULATIVE;
exports.DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR = DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR;
//# sourceMappingURL=AggregationSelector.js.map

/***/ }),

/***/ 8589:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AggregationTemporality = void 0;
/**
 * AggregationTemporality indicates the way additive quantities are expressed.
 */
var AggregationTemporality;
(function (AggregationTemporality) {
    AggregationTemporality[AggregationTemporality["DELTA"] = 0] = "DELTA";
    AggregationTemporality[AggregationTemporality["CUMULATIVE"] = 1] = "CUMULATIVE";
})(AggregationTemporality = exports.AggregationTemporality || (exports.AggregationTemporality = {}));
//# sourceMappingURL=AggregationTemporality.js.map

/***/ }),

/***/ 8144:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConsoleMetricExporter = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const core_1 = __nccwpck_require__(9736);
const AggregationSelector_1 = __nccwpck_require__(8747);
/* eslint-disable no-console */
class ConsoleMetricExporter {
    constructor(options) {
        var _a;
        this._shutdown = false;
        this._temporalitySelector =
            (_a = options === null || options === void 0 ? void 0 : options.temporalitySelector) !== null && _a !== void 0 ? _a : AggregationSelector_1.DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR;
    }
    export(metrics, resultCallback) {
        if (this._shutdown) {
            // If the exporter is shutting down, by spec, we need to return FAILED as export result
            setImmediate(resultCallback, { code: core_1.ExportResultCode.FAILED });
            return;
        }
        return ConsoleMetricExporter._sendMetrics(metrics, resultCallback);
    }
    forceFlush() {
        return Promise.resolve();
    }
    selectAggregationTemporality(_instrumentType) {
        return this._temporalitySelector(_instrumentType);
    }
    shutdown() {
        this._shutdown = true;
        return Promise.resolve();
    }
    static _sendMetrics(metrics, done) {
        for (const scopeMetrics of metrics.scopeMetrics) {
            for (const metric of scopeMetrics.metrics) {
                console.dir({
                    descriptor: metric.descriptor,
                    dataPointType: metric.dataPointType,
                    dataPoints: metric.dataPoints,
                });
            }
        }
        done({ code: core_1.ExportResultCode.SUCCESS });
    }
}
exports.ConsoleMetricExporter = ConsoleMetricExporter;
//# sourceMappingURL=ConsoleMetricExporter.js.map

/***/ }),

/***/ 9094:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InMemoryMetricExporter = void 0;
const core_1 = __nccwpck_require__(9736);
/**
 * In-memory Metrics Exporter is a Push Metric Exporter
 * which accumulates metrics data in the local memory and
 * allows to inspect it (useful for e.g. unit tests).
 */
class InMemoryMetricExporter {
    constructor(aggregationTemporality) {
        this._shutdown = false;
        this._metrics = [];
        this._aggregationTemporality = aggregationTemporality;
    }
    /**
     * @inheritedDoc
     */
    export(metrics, resultCallback) {
        // Avoid storing metrics when exporter is shutdown
        if (this._shutdown) {
            setTimeout(() => resultCallback({ code: core_1.ExportResultCode.FAILED }), 0);
            return;
        }
        this._metrics.push(metrics);
        setTimeout(() => resultCallback({ code: core_1.ExportResultCode.SUCCESS }), 0);
    }
    /**
     * Returns all the collected resource metrics
     * @returns ResourceMetrics[]
     */
    getMetrics() {
        return this._metrics;
    }
    forceFlush() {
        return Promise.resolve();
    }
    reset() {
        this._metrics = [];
    }
    selectAggregationTemporality(_instrumentType) {
        return this._aggregationTemporality;
    }
    shutdown() {
        this._shutdown = true;
        return Promise.resolve();
    }
}
exports.InMemoryMetricExporter = InMemoryMetricExporter;
//# sourceMappingURL=InMemoryMetricExporter.js.map

/***/ }),

/***/ 1729:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DataPointType = void 0;
/**
 * The aggregated point data type.
 */
var DataPointType;
(function (DataPointType) {
    /**
     * A histogram data point contains a histogram statistics of collected
     * values with a list of explicit bucket boundaries and statistics such
     * as min, max, count, and sum of all collected values.
     */
    DataPointType[DataPointType["HISTOGRAM"] = 0] = "HISTOGRAM";
    /**
     * An exponential histogram data point contains a histogram statistics of
     * collected values where bucket boundaries are automatically calculated
     * using an exponential function, and statistics such as min, max, count,
     * and sum of all collected values.
     */
    DataPointType[DataPointType["EXPONENTIAL_HISTOGRAM"] = 1] = "EXPONENTIAL_HISTOGRAM";
    /**
     * A gauge metric data point has only a single numeric value.
     */
    DataPointType[DataPointType["GAUGE"] = 2] = "GAUGE";
    /**
     * A sum metric data point has a single numeric value and a
     * monotonicity-indicator.
     */
    DataPointType[DataPointType["SUM"] = 3] = "SUM";
})(DataPointType = exports.DataPointType || (exports.DataPointType = {}));
//# sourceMappingURL=MetricData.js.map

/***/ }),

/***/ 6313:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MetricReader = void 0;
const api = __nccwpck_require__(5163);
const utils_1 = __nccwpck_require__(9158);
const AggregationSelector_1 = __nccwpck_require__(8747);
/**
 * A registered reader of metrics that, when linked to a {@link MetricProducer}, offers global
 * control over metrics.
 */
class MetricReader {
    constructor(options) {
        var _a, _b, _c;
        // Tracks the shutdown state.
        // TODO: use BindOncePromise here once a new version of @opentelemetry/core is available.
        this._shutdown = false;
        this._aggregationSelector =
            (_a = options === null || options === void 0 ? void 0 : options.aggregationSelector) !== null && _a !== void 0 ? _a : AggregationSelector_1.DEFAULT_AGGREGATION_SELECTOR;
        this._aggregationTemporalitySelector =
            (_b = options === null || options === void 0 ? void 0 : options.aggregationTemporalitySelector) !== null && _b !== void 0 ? _b : AggregationSelector_1.DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR;
        this._metricProducers = (_c = options === null || options === void 0 ? void 0 : options.metricProducers) !== null && _c !== void 0 ? _c : [];
    }
    /**
     * Set the {@link MetricProducer} used by this instance. **This should only be called by the
     * SDK and should be considered internal.**
     *
     * To add additional {@link MetricProducer}s to a {@link MetricReader}, pass them to the
     * constructor as {@link MetricReaderOptions.metricProducers}.
     *
     * @internal
     * @param metricProducer
     */
    setMetricProducer(metricProducer) {
        if (this._sdkMetricProducer) {
            throw new Error('MetricReader can not be bound to a MeterProvider again.');
        }
        this._sdkMetricProducer = metricProducer;
        this.onInitialized();
    }
    /**
     * Select the {@link Aggregation} for the given {@link InstrumentType} for this
     * reader.
     */
    selectAggregation(instrumentType) {
        return this._aggregationSelector(instrumentType);
    }
    /**
     * Select the {@link AggregationTemporality} for the given
     * {@link InstrumentType} for this reader.
     */
    selectAggregationTemporality(instrumentType) {
        return this._aggregationTemporalitySelector(instrumentType);
    }
    /**
     * Handle once the SDK has initialized this {@link MetricReader}
     * Overriding this method is optional.
     */
    onInitialized() {
        // Default implementation is empty.
    }
    /**
     * Collect all metrics from the associated {@link MetricProducer}
     */
    async collect(options) {
        if (this._sdkMetricProducer === undefined) {
            throw new Error('MetricReader is not bound to a MetricProducer');
        }
        // Subsequent invocations to collect are not allowed. SDKs SHOULD return some failure for these calls.
        if (this._shutdown) {
            throw new Error('MetricReader is shutdown');
        }
        const [sdkCollectionResults, ...additionalCollectionResults] = await Promise.all([
            this._sdkMetricProducer.collect({
                timeoutMillis: options === null || options === void 0 ? void 0 : options.timeoutMillis,
            }),
            ...this._metricProducers.map(producer => producer.collect({
                timeoutMillis: options === null || options === void 0 ? void 0 : options.timeoutMillis,
            })),
        ]);
        // Merge the results, keeping the SDK's Resource
        const errors = sdkCollectionResults.errors.concat((0, utils_1.FlatMap)(additionalCollectionResults, result => result.errors));
        const resource = sdkCollectionResults.resourceMetrics.resource;
        const scopeMetrics = sdkCollectionResults.resourceMetrics.scopeMetrics.concat((0, utils_1.FlatMap)(additionalCollectionResults, result => result.resourceMetrics.scopeMetrics));
        return {
            resourceMetrics: {
                resource,
                scopeMetrics,
            },
            errors,
        };
    }
    /**
     * Shuts down the metric reader, the promise will reject after the optional timeout or resolve after completion.
     *
     * <p> NOTE: this operation will continue even after the promise rejects due to a timeout.
     * @param options options with timeout.
     */
    async shutdown(options) {
        // Do not call shutdown again if it has already been called.
        if (this._shutdown) {
            api.diag.error('Cannot call shutdown twice.');
            return;
        }
        // No timeout if timeoutMillis is undefined or null.
        if ((options === null || options === void 0 ? void 0 : options.timeoutMillis) == null) {
            await this.onShutdown();
        }
        else {
            await (0, utils_1.callWithTimeout)(this.onShutdown(), options.timeoutMillis);
        }
        this._shutdown = true;
    }
    /**
     * Flushes metrics read by this reader, the promise will reject after the optional timeout or resolve after completion.
     *
     * <p> NOTE: this operation will continue even after the promise rejects due to a timeout.
     * @param options options with timeout.
     */
    async forceFlush(options) {
        if (this._shutdown) {
            api.diag.warn('Cannot forceFlush on already shutdown MetricReader.');
            return;
        }
        // No timeout if timeoutMillis is undefined or null.
        if ((options === null || options === void 0 ? void 0 : options.timeoutMillis) == null) {
            await this.onForceFlush();
            return;
        }
        await (0, utils_1.callWithTimeout)(this.onForceFlush(), options.timeoutMillis);
    }
}
exports.MetricReader = MetricReader;
//# sourceMappingURL=MetricReader.js.map

/***/ }),

/***/ 542:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PeriodicExportingMetricReader = void 0;
const api = __nccwpck_require__(5163);
const core_1 = __nccwpck_require__(9736);
const MetricReader_1 = __nccwpck_require__(6313);
const utils_1 = __nccwpck_require__(9158);
const api_1 = __nccwpck_require__(5163);
/**
 * {@link MetricReader} which collects metrics based on a user-configurable time interval, and passes the metrics to
 * the configured {@link PushMetricExporter}
 */
class PeriodicExportingMetricReader extends MetricReader_1.MetricReader {
    constructor(options) {
        var _a, _b, _c, _d;
        super({
            aggregationSelector: (_a = options.exporter.selectAggregation) === null || _a === void 0 ? void 0 : _a.bind(options.exporter),
            aggregationTemporalitySelector: (_b = options.exporter.selectAggregationTemporality) === null || _b === void 0 ? void 0 : _b.bind(options.exporter),
            metricProducers: options.metricProducers,
        });
        if (options.exportIntervalMillis !== undefined &&
            options.exportIntervalMillis <= 0) {
            throw Error('exportIntervalMillis must be greater than 0');
        }
        if (options.exportTimeoutMillis !== undefined &&
            options.exportTimeoutMillis <= 0) {
            throw Error('exportTimeoutMillis must be greater than 0');
        }
        if (options.exportTimeoutMillis !== undefined &&
            options.exportIntervalMillis !== undefined &&
            options.exportIntervalMillis < options.exportTimeoutMillis) {
            throw Error('exportIntervalMillis must be greater than or equal to exportTimeoutMillis');
        }
        this._exportInterval = (_c = options.exportIntervalMillis) !== null && _c !== void 0 ? _c : 60000;
        this._exportTimeout = (_d = options.exportTimeoutMillis) !== null && _d !== void 0 ? _d : 30000;
        this._exporter = options.exporter;
    }
    async _runOnce() {
        try {
            await (0, utils_1.callWithTimeout)(this._doRun(), this._exportTimeout);
        }
        catch (err) {
            if (err instanceof utils_1.TimeoutError) {
                api.diag.error('Export took longer than %s milliseconds and timed out.', this._exportTimeout);
                return;
            }
            (0, core_1.globalErrorHandler)(err);
        }
    }
    async _doRun() {
        var _a, _b;
        const { resourceMetrics, errors } = await this.collect({
            timeoutMillis: this._exportTimeout,
        });
        if (errors.length > 0) {
            api.diag.error('PeriodicExportingMetricReader: metrics collection errors', ...errors);
        }
        const doExport = async () => {
            const result = await core_1.internal._export(this._exporter, resourceMetrics);
            if (result.code !== core_1.ExportResultCode.SUCCESS) {
                throw new Error(`PeriodicExportingMetricReader: metrics export failed (error ${result.error})`);
            }
        };
        // Avoid scheduling a promise to make the behavior more predictable and easier to test
        if (resourceMetrics.resource.asyncAttributesPending) {
            (_b = (_a = resourceMetrics.resource).waitForAsyncAttributes) === null || _b === void 0 ? void 0 : _b.call(_a).then(doExport, err => api_1.diag.debug('Error while resolving async portion of resource: ', err));
        }
        else {
            await doExport();
        }
    }
    onInitialized() {
        // start running the interval as soon as this reader is initialized and keep handle for shutdown.
        this._interval = setInterval(() => {
            // this._runOnce never rejects. Using void operator to suppress @typescript-eslint/no-floating-promises.
            void this._runOnce();
        }, this._exportInterval);
        (0, core_1.unrefTimer)(this._interval);
    }
    async onForceFlush() {
        await this._runOnce();
        await this._exporter.forceFlush();
    }
    async onShutdown() {
        if (this._interval) {
            clearInterval(this._interval);
        }
        await this._exporter.shutdown();
    }
}
exports.PeriodicExportingMetricReader = PeriodicExportingMetricReader;
//# sourceMappingURL=PeriodicExportingMetricReader.js.map

/***/ }),

/***/ 7349:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TimeoutError = exports.View = exports.Aggregation = exports.SumAggregation = exports.LastValueAggregation = exports.HistogramAggregation = exports.DropAggregation = exports.ExponentialHistogramAggregation = exports.ExplicitBucketHistogramAggregation = exports.DefaultAggregation = exports.MeterProvider = exports.InstrumentType = exports.ConsoleMetricExporter = exports.InMemoryMetricExporter = exports.PeriodicExportingMetricReader = exports.MetricReader = exports.DataPointType = exports.AggregationTemporality = void 0;
var AggregationTemporality_1 = __nccwpck_require__(8589);
Object.defineProperty(exports, "AggregationTemporality", ({ enumerable: true, get: function () { return AggregationTemporality_1.AggregationTemporality; } }));
var MetricData_1 = __nccwpck_require__(1729);
Object.defineProperty(exports, "DataPointType", ({ enumerable: true, get: function () { return MetricData_1.DataPointType; } }));
var MetricReader_1 = __nccwpck_require__(6313);
Object.defineProperty(exports, "MetricReader", ({ enumerable: true, get: function () { return MetricReader_1.MetricReader; } }));
var PeriodicExportingMetricReader_1 = __nccwpck_require__(542);
Object.defineProperty(exports, "PeriodicExportingMetricReader", ({ enumerable: true, get: function () { return PeriodicExportingMetricReader_1.PeriodicExportingMetricReader; } }));
var InMemoryMetricExporter_1 = __nccwpck_require__(9094);
Object.defineProperty(exports, "InMemoryMetricExporter", ({ enumerable: true, get: function () { return InMemoryMetricExporter_1.InMemoryMetricExporter; } }));
var ConsoleMetricExporter_1 = __nccwpck_require__(8144);
Object.defineProperty(exports, "ConsoleMetricExporter", ({ enumerable: true, get: function () { return ConsoleMetricExporter_1.ConsoleMetricExporter; } }));
var InstrumentDescriptor_1 = __nccwpck_require__(2671);
Object.defineProperty(exports, "InstrumentType", ({ enumerable: true, get: function () { return InstrumentDescriptor_1.InstrumentType; } }));
var MeterProvider_1 = __nccwpck_require__(310);
Object.defineProperty(exports, "MeterProvider", ({ enumerable: true, get: function () { return MeterProvider_1.MeterProvider; } }));
var Aggregation_1 = __nccwpck_require__(4769);
Object.defineProperty(exports, "DefaultAggregation", ({ enumerable: true, get: function () { return Aggregation_1.DefaultAggregation; } }));
Object.defineProperty(exports, "ExplicitBucketHistogramAggregation", ({ enumerable: true, get: function () { return Aggregation_1.ExplicitBucketHistogramAggregation; } }));
Object.defineProperty(exports, "ExponentialHistogramAggregation", ({ enumerable: true, get: function () { return Aggregation_1.ExponentialHistogramAggregation; } }));
Object.defineProperty(exports, "DropAggregation", ({ enumerable: true, get: function () { return Aggregation_1.DropAggregation; } }));
Object.defineProperty(exports, "HistogramAggregation", ({ enumerable: true, get: function () { return Aggregation_1.HistogramAggregation; } }));
Object.defineProperty(exports, "LastValueAggregation", ({ enumerable: true, get: function () { return Aggregation_1.LastValueAggregation; } }));
Object.defineProperty(exports, "SumAggregation", ({ enumerable: true, get: function () { return Aggregation_1.SumAggregation; } }));
Object.defineProperty(exports, "Aggregation", ({ enumerable: true, get: function () { return Aggregation_1.Aggregation; } }));
var View_1 = __nccwpck_require__(1265);
Object.defineProperty(exports, "View", ({ enumerable: true, get: function () { return View_1.View; } }));
var utils_1 = __nccwpck_require__(9158);
Object.defineProperty(exports, "TimeoutError", ({ enumerable: true, get: function () { return utils_1.TimeoutError; } }));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 2745:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AsyncMetricStorage = void 0;
const MetricStorage_1 = __nccwpck_require__(3134);
const DeltaMetricProcessor_1 = __nccwpck_require__(1904);
const TemporalMetricProcessor_1 = __nccwpck_require__(2566);
const HashMap_1 = __nccwpck_require__(205);
/**
 * Internal interface.
 *
 * Stores and aggregates {@link MetricData} for asynchronous instruments.
 */
class AsyncMetricStorage extends MetricStorage_1.MetricStorage {
    constructor(_instrumentDescriptor, aggregator, _attributesProcessor, collectorHandles) {
        super(_instrumentDescriptor);
        this._attributesProcessor = _attributesProcessor;
        this._deltaMetricStorage = new DeltaMetricProcessor_1.DeltaMetricProcessor(aggregator);
        this._temporalMetricStorage = new TemporalMetricProcessor_1.TemporalMetricProcessor(aggregator, collectorHandles);
    }
    record(measurements, observationTime) {
        const processed = new HashMap_1.AttributeHashMap();
        Array.from(measurements.entries()).forEach(([attributes, value]) => {
            processed.set(this._attributesProcessor.process(attributes), value);
        });
        this._deltaMetricStorage.batchCumulate(processed, observationTime);
    }
    /**
     * Collects the metrics from this storage. The ObservableCallback is invoked
     * during the collection.
     *
     * Note: This is a stateful operation and may reset any interval-related
     * state for the MetricCollector.
     */
    collect(collector, collectionTime) {
        const accumulations = this._deltaMetricStorage.collect();
        return this._temporalMetricStorage.buildMetrics(collector, this._instrumentDescriptor, accumulations, collectionTime);
    }
}
exports.AsyncMetricStorage = AsyncMetricStorage;
//# sourceMappingURL=AsyncMetricStorage.js.map

/***/ }),

/***/ 1904:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DeltaMetricProcessor = void 0;
const HashMap_1 = __nccwpck_require__(205);
/**
 * Internal interface.
 *
 * Allows synchronous collection of metrics. This processor should allow
 * allocation of new aggregation cells for metrics and convert cumulative
 * recording to delta data points.
 */
class DeltaMetricProcessor {
    constructor(_aggregator) {
        this._aggregator = _aggregator;
        this._activeCollectionStorage = new HashMap_1.AttributeHashMap();
        // TODO: find a reasonable mean to clean the memo;
        // https://github.com/open-telemetry/opentelemetry-specification/pull/2208
        this._cumulativeMemoStorage = new HashMap_1.AttributeHashMap();
    }
    record(value, attributes, _context, collectionTime) {
        const accumulation = this._activeCollectionStorage.getOrDefault(attributes, () => this._aggregator.createAccumulation(collectionTime));
        accumulation === null || accumulation === void 0 ? void 0 : accumulation.record(value);
    }
    batchCumulate(measurements, collectionTime) {
        Array.from(measurements.entries()).forEach(([attributes, value, hashCode]) => {
            const accumulation = this._aggregator.createAccumulation(collectionTime);
            accumulation === null || accumulation === void 0 ? void 0 : accumulation.record(value);
            let delta = accumulation;
            // Diff with recorded cumulative memo.
            if (this._cumulativeMemoStorage.has(attributes, hashCode)) {
                // has() returned true, previous is present.
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const previous = this._cumulativeMemoStorage.get(attributes, hashCode);
                delta = this._aggregator.diff(previous, accumulation);
            }
            // Merge with uncollected active delta.
            if (this._activeCollectionStorage.has(attributes, hashCode)) {
                // has() returned true, previous is present.
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const active = this._activeCollectionStorage.get(attributes, hashCode);
                delta = this._aggregator.merge(active, delta);
            }
            // Save the current record and the delta record.
            this._cumulativeMemoStorage.set(attributes, accumulation, hashCode);
            this._activeCollectionStorage.set(attributes, delta, hashCode);
        });
    }
    /**
     * Returns a collection of delta metrics. Start time is the when first
     * time event collected.
     */
    collect() {
        const unreportedDelta = this._activeCollectionStorage;
        this._activeCollectionStorage = new HashMap_1.AttributeHashMap();
        return unreportedDelta;
    }
}
exports.DeltaMetricProcessor = DeltaMetricProcessor;
//# sourceMappingURL=DeltaMetricProcessor.js.map

/***/ }),

/***/ 205:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AttributeHashMap = exports.HashMap = void 0;
const utils_1 = __nccwpck_require__(9158);
class HashMap {
    constructor(_hash) {
        this._hash = _hash;
        this._valueMap = new Map();
        this._keyMap = new Map();
    }
    get(key, hashCode) {
        hashCode !== null && hashCode !== void 0 ? hashCode : (hashCode = this._hash(key));
        return this._valueMap.get(hashCode);
    }
    getOrDefault(key, defaultFactory) {
        const hash = this._hash(key);
        if (this._valueMap.has(hash)) {
            return this._valueMap.get(hash);
        }
        const val = defaultFactory();
        if (!this._keyMap.has(hash)) {
            this._keyMap.set(hash, key);
        }
        this._valueMap.set(hash, val);
        return val;
    }
    set(key, value, hashCode) {
        hashCode !== null && hashCode !== void 0 ? hashCode : (hashCode = this._hash(key));
        if (!this._keyMap.has(hashCode)) {
            this._keyMap.set(hashCode, key);
        }
        this._valueMap.set(hashCode, value);
    }
    has(key, hashCode) {
        hashCode !== null && hashCode !== void 0 ? hashCode : (hashCode = this._hash(key));
        return this._valueMap.has(hashCode);
    }
    *keys() {
        const keyIterator = this._keyMap.entries();
        let next = keyIterator.next();
        while (next.done !== true) {
            yield [next.value[1], next.value[0]];
            next = keyIterator.next();
        }
    }
    *entries() {
        const valueIterator = this._valueMap.entries();
        let next = valueIterator.next();
        while (next.done !== true) {
            // next.value[0] here can not be undefined
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            yield [this._keyMap.get(next.value[0]), next.value[1], next.value[0]];
            next = valueIterator.next();
        }
    }
    get size() {
        return this._valueMap.size;
    }
}
exports.HashMap = HashMap;
class AttributeHashMap extends HashMap {
    constructor() {
        super(utils_1.hashAttributes);
    }
}
exports.AttributeHashMap = AttributeHashMap;
//# sourceMappingURL=HashMap.js.map

/***/ }),

/***/ 898:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MeterProviderSharedState = void 0;
const utils_1 = __nccwpck_require__(9158);
const ViewRegistry_1 = __nccwpck_require__(6379);
const MeterSharedState_1 = __nccwpck_require__(4881);
/**
 * An internal record for shared meter provider states.
 */
class MeterProviderSharedState {
    constructor(resource) {
        this.resource = resource;
        this.viewRegistry = new ViewRegistry_1.ViewRegistry();
        this.metricCollectors = [];
        this.meterSharedStates = new Map();
    }
    getMeterSharedState(instrumentationScope) {
        const id = (0, utils_1.instrumentationScopeId)(instrumentationScope);
        let meterSharedState = this.meterSharedStates.get(id);
        if (meterSharedState == null) {
            meterSharedState = new MeterSharedState_1.MeterSharedState(this, instrumentationScope);
            this.meterSharedStates.set(id, meterSharedState);
        }
        return meterSharedState;
    }
    selectAggregations(instrumentType) {
        const result = [];
        for (const collector of this.metricCollectors) {
            result.push([collector, collector.selectAggregation(instrumentType)]);
        }
        return result;
    }
}
exports.MeterProviderSharedState = MeterProviderSharedState;
//# sourceMappingURL=MeterProviderSharedState.js.map

/***/ }),

/***/ 4881:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MeterSharedState = void 0;
const InstrumentDescriptor_1 = __nccwpck_require__(2671);
const Meter_1 = __nccwpck_require__(5894);
const utils_1 = __nccwpck_require__(9158);
const AsyncMetricStorage_1 = __nccwpck_require__(2745);
const MetricStorageRegistry_1 = __nccwpck_require__(2749);
const MultiWritableMetricStorage_1 = __nccwpck_require__(3250);
const ObservableRegistry_1 = __nccwpck_require__(9043);
const SyncMetricStorage_1 = __nccwpck_require__(2766);
const AttributesProcessor_1 = __nccwpck_require__(1952);
/**
 * An internal record for shared meter provider states.
 */
class MeterSharedState {
    constructor(_meterProviderSharedState, _instrumentationScope) {
        this._meterProviderSharedState = _meterProviderSharedState;
        this._instrumentationScope = _instrumentationScope;
        this.metricStorageRegistry = new MetricStorageRegistry_1.MetricStorageRegistry();
        this.observableRegistry = new ObservableRegistry_1.ObservableRegistry();
        this.meter = new Meter_1.Meter(this);
    }
    registerMetricStorage(descriptor) {
        const storages = this._registerMetricStorage(descriptor, SyncMetricStorage_1.SyncMetricStorage);
        if (storages.length === 1) {
            return storages[0];
        }
        return new MultiWritableMetricStorage_1.MultiMetricStorage(storages);
    }
    registerAsyncMetricStorage(descriptor) {
        const storages = this._registerMetricStorage(descriptor, AsyncMetricStorage_1.AsyncMetricStorage);
        return storages;
    }
    /**
     * @param collector opaque handle of {@link MetricCollector} which initiated the collection.
     * @param collectionTime the HrTime at which the collection was initiated.
     * @param options options for collection.
     * @returns the list of metric data collected.
     */
    async collect(collector, collectionTime, options) {
        /**
         * 1. Call all observable callbacks first.
         * 2. Collect metric result for the collector.
         */
        const errors = await this.observableRegistry.observe(collectionTime, options === null || options === void 0 ? void 0 : options.timeoutMillis);
        const storages = this.metricStorageRegistry.getStorages(collector);
        // prevent more allocations if there are no storages.
        if (storages.length === 0) {
            return null;
        }
        const metricDataList = storages
            .map(metricStorage => {
            return metricStorage.collect(collector, collectionTime);
        })
            .filter(utils_1.isNotNullish);
        // skip this scope if no data was collected (storage created, but no data observed)
        if (metricDataList.length === 0) {
            return { errors };
        }
        return {
            scopeMetrics: {
                scope: this._instrumentationScope,
                metrics: metricDataList,
            },
            errors,
        };
    }
    _registerMetricStorage(descriptor, MetricStorageType) {
        const views = this._meterProviderSharedState.viewRegistry.findViews(descriptor, this._instrumentationScope);
        let storages = views.map(view => {
            const viewDescriptor = (0, InstrumentDescriptor_1.createInstrumentDescriptorWithView)(view, descriptor);
            const compatibleStorage = this.metricStorageRegistry.findOrUpdateCompatibleStorage(viewDescriptor);
            if (compatibleStorage != null) {
                return compatibleStorage;
            }
            const aggregator = view.aggregation.createAggregator(viewDescriptor);
            const viewStorage = new MetricStorageType(viewDescriptor, aggregator, view.attributesProcessor, this._meterProviderSharedState.metricCollectors);
            this.metricStorageRegistry.register(viewStorage);
            return viewStorage;
        });
        // Fallback to the per-collector aggregations if no view is configured for the instrument.
        if (storages.length === 0) {
            const perCollectorAggregations = this._meterProviderSharedState.selectAggregations(descriptor.type);
            const collectorStorages = perCollectorAggregations.map(([collector, aggregation]) => {
                const compatibleStorage = this.metricStorageRegistry.findOrUpdateCompatibleCollectorStorage(collector, descriptor);
                if (compatibleStorage != null) {
                    return compatibleStorage;
                }
                const aggregator = aggregation.createAggregator(descriptor);
                const storage = new MetricStorageType(descriptor, aggregator, AttributesProcessor_1.AttributesProcessor.Noop(), [collector]);
                this.metricStorageRegistry.registerForCollector(collector, storage);
                return storage;
            });
            storages = storages.concat(collectorStorages);
        }
        return storages;
    }
}
exports.MeterSharedState = MeterSharedState;
//# sourceMappingURL=MeterSharedState.js.map

/***/ }),

/***/ 142:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MetricCollector = void 0;
const core_1 = __nccwpck_require__(9736);
/**
 * An internal opaque interface that the MetricReader receives as
 * MetricProducer. It acts as the storage key to the internal metric stream
 * state for each MetricReader.
 */
class MetricCollector {
    constructor(_sharedState, _metricReader) {
        this._sharedState = _sharedState;
        this._metricReader = _metricReader;
    }
    async collect(options) {
        const collectionTime = (0, core_1.millisToHrTime)(Date.now());
        const scopeMetrics = [];
        const errors = [];
        const meterCollectionPromises = Array.from(this._sharedState.meterSharedStates.values()).map(async (meterSharedState) => {
            const current = await meterSharedState.collect(this, collectionTime, options);
            // only add scope metrics if available
            if ((current === null || current === void 0 ? void 0 : current.scopeMetrics) != null) {
                scopeMetrics.push(current.scopeMetrics);
            }
            // only add errors if available
            if ((current === null || current === void 0 ? void 0 : current.errors) != null) {
                errors.push(...current.errors);
            }
        });
        await Promise.all(meterCollectionPromises);
        return {
            resourceMetrics: {
                resource: this._sharedState.resource,
                scopeMetrics: scopeMetrics,
            },
            errors: errors,
        };
    }
    /**
     * Delegates for MetricReader.forceFlush.
     */
    async forceFlush(options) {
        await this._metricReader.forceFlush(options);
    }
    /**
     * Delegates for MetricReader.shutdown.
     */
    async shutdown(options) {
        await this._metricReader.shutdown(options);
    }
    selectAggregationTemporality(instrumentType) {
        return this._metricReader.selectAggregationTemporality(instrumentType);
    }
    selectAggregation(instrumentType) {
        return this._metricReader.selectAggregation(instrumentType);
    }
}
exports.MetricCollector = MetricCollector;
//# sourceMappingURL=MetricCollector.js.map

/***/ }),

/***/ 3134:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MetricStorage = void 0;
const InstrumentDescriptor_1 = __nccwpck_require__(2671);
/**
 * Internal interface.
 *
 * Represents a storage from which we can collect metrics.
 */
class MetricStorage {
    constructor(_instrumentDescriptor) {
        this._instrumentDescriptor = _instrumentDescriptor;
    }
    getInstrumentDescriptor() {
        return this._instrumentDescriptor;
    }
    updateDescription(description) {
        this._instrumentDescriptor = (0, InstrumentDescriptor_1.createInstrumentDescriptor)(this._instrumentDescriptor.name, this._instrumentDescriptor.type, {
            description: description,
            valueType: this._instrumentDescriptor.valueType,
            unit: this._instrumentDescriptor.unit,
            advice: this._instrumentDescriptor.advice,
        });
    }
}
exports.MetricStorage = MetricStorage;
//# sourceMappingURL=MetricStorage.js.map

/***/ }),

/***/ 2749:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MetricStorageRegistry = void 0;
const InstrumentDescriptor_1 = __nccwpck_require__(2671);
const api = __nccwpck_require__(5163);
const RegistrationConflicts_1 = __nccwpck_require__(6212);
/**
 * Internal class for storing {@link MetricStorage}
 */
class MetricStorageRegistry {
    constructor() {
        this._sharedRegistry = new Map();
        this._perCollectorRegistry = new Map();
    }
    static create() {
        return new MetricStorageRegistry();
    }
    getStorages(collector) {
        let storages = [];
        for (const metricStorages of this._sharedRegistry.values()) {
            storages = storages.concat(metricStorages);
        }
        const perCollectorStorages = this._perCollectorRegistry.get(collector);
        if (perCollectorStorages != null) {
            for (const metricStorages of perCollectorStorages.values()) {
                storages = storages.concat(metricStorages);
            }
        }
        return storages;
    }
    register(storage) {
        this._registerStorage(storage, this._sharedRegistry);
    }
    registerForCollector(collector, storage) {
        let storageMap = this._perCollectorRegistry.get(collector);
        if (storageMap == null) {
            storageMap = new Map();
            this._perCollectorRegistry.set(collector, storageMap);
        }
        this._registerStorage(storage, storageMap);
    }
    findOrUpdateCompatibleStorage(expectedDescriptor) {
        const storages = this._sharedRegistry.get(expectedDescriptor.name);
        if (storages === undefined) {
            return null;
        }
        // If the descriptor is compatible, the type of their metric storage
        // (either SyncMetricStorage or AsyncMetricStorage) must be compatible.
        return this._findOrUpdateCompatibleStorage(expectedDescriptor, storages);
    }
    findOrUpdateCompatibleCollectorStorage(collector, expectedDescriptor) {
        const storageMap = this._perCollectorRegistry.get(collector);
        if (storageMap === undefined) {
            return null;
        }
        const storages = storageMap.get(expectedDescriptor.name);
        if (storages === undefined) {
            return null;
        }
        // If the descriptor is compatible, the type of their metric storage
        // (either SyncMetricStorage or AsyncMetricStorage) must be compatible.
        return this._findOrUpdateCompatibleStorage(expectedDescriptor, storages);
    }
    _registerStorage(storage, storageMap) {
        const descriptor = storage.getInstrumentDescriptor();
        const storages = storageMap.get(descriptor.name);
        if (storages === undefined) {
            storageMap.set(descriptor.name, [storage]);
            return;
        }
        storages.push(storage);
    }
    _findOrUpdateCompatibleStorage(expectedDescriptor, existingStorages) {
        let compatibleStorage = null;
        for (const existingStorage of existingStorages) {
            const existingDescriptor = existingStorage.getInstrumentDescriptor();
            if ((0, InstrumentDescriptor_1.isDescriptorCompatibleWith)(existingDescriptor, expectedDescriptor)) {
                // Use the longer description if it does not match.
                if (existingDescriptor.description !== expectedDescriptor.description) {
                    if (expectedDescriptor.description.length >
                        existingDescriptor.description.length) {
                        existingStorage.updateDescription(expectedDescriptor.description);
                    }
                    api.diag.warn('A view or instrument with the name ', expectedDescriptor.name, ' has already been registered, but has a different description and is incompatible with another registered view.\n', 'Details:\n', (0, RegistrationConflicts_1.getIncompatibilityDetails)(existingDescriptor, expectedDescriptor), 'The longer description will be used.\nTo resolve the conflict:', (0, RegistrationConflicts_1.getConflictResolutionRecipe)(existingDescriptor, expectedDescriptor));
                }
                // Storage is fully compatible. There will never be more than one pre-existing fully compatible storage.
                compatibleStorage = existingStorage;
            }
            else {
                // The implementation SHOULD warn about duplicate instrument registration
                // conflicts after applying View configuration.
                api.diag.warn('A view or instrument with the name ', expectedDescriptor.name, ' has already been registered and is incompatible with another registered view.\n', 'Details:\n', (0, RegistrationConflicts_1.getIncompatibilityDetails)(existingDescriptor, expectedDescriptor), 'To resolve the conflict:\n', (0, RegistrationConflicts_1.getConflictResolutionRecipe)(existingDescriptor, expectedDescriptor));
            }
        }
        return compatibleStorage;
    }
}
exports.MetricStorageRegistry = MetricStorageRegistry;
//# sourceMappingURL=MetricStorageRegistry.js.map

/***/ }),

/***/ 3250:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MultiMetricStorage = void 0;
/**
 * Internal interface.
 */
class MultiMetricStorage {
    constructor(_backingStorages) {
        this._backingStorages = _backingStorages;
    }
    record(value, attributes, context, recordTime) {
        this._backingStorages.forEach(it => {
            it.record(value, attributes, context, recordTime);
        });
    }
}
exports.MultiMetricStorage = MultiMetricStorage;
//# sourceMappingURL=MultiWritableMetricStorage.js.map

/***/ }),

/***/ 9043:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ObservableRegistry = void 0;
const api_1 = __nccwpck_require__(5163);
const Instruments_1 = __nccwpck_require__(667);
const ObservableResult_1 = __nccwpck_require__(183);
const utils_1 = __nccwpck_require__(9158);
/**
 * An internal interface for managing ObservableCallbacks.
 *
 * Every registered callback associated with a set of instruments are be evaluated
 * exactly once during collection prior to reading data for that instrument.
 */
class ObservableRegistry {
    constructor() {
        this._callbacks = [];
        this._batchCallbacks = [];
    }
    addCallback(callback, instrument) {
        const idx = this._findCallback(callback, instrument);
        if (idx >= 0) {
            return;
        }
        this._callbacks.push({ callback, instrument });
    }
    removeCallback(callback, instrument) {
        const idx = this._findCallback(callback, instrument);
        if (idx < 0) {
            return;
        }
        this._callbacks.splice(idx, 1);
    }
    addBatchCallback(callback, instruments) {
        // Create a set of unique instruments.
        const observableInstruments = new Set(instruments.filter(Instruments_1.isObservableInstrument));
        if (observableInstruments.size === 0) {
            api_1.diag.error('BatchObservableCallback is not associated with valid instruments', instruments);
            return;
        }
        const idx = this._findBatchCallback(callback, observableInstruments);
        if (idx >= 0) {
            return;
        }
        this._batchCallbacks.push({ callback, instruments: observableInstruments });
    }
    removeBatchCallback(callback, instruments) {
        // Create a set of unique instruments.
        const observableInstruments = new Set(instruments.filter(Instruments_1.isObservableInstrument));
        const idx = this._findBatchCallback(callback, observableInstruments);
        if (idx < 0) {
            return;
        }
        this._batchCallbacks.splice(idx, 1);
    }
    /**
     * @returns a promise of rejected reasons for invoking callbacks.
     */
    async observe(collectionTime, timeoutMillis) {
        const callbackFutures = this._observeCallbacks(collectionTime, timeoutMillis);
        const batchCallbackFutures = this._observeBatchCallbacks(collectionTime, timeoutMillis);
        const results = await (0, utils_1.PromiseAllSettled)([
            ...callbackFutures,
            ...batchCallbackFutures,
        ]);
        const rejections = results
            .filter(utils_1.isPromiseAllSettledRejectionResult)
            .map(it => it.reason);
        return rejections;
    }
    _observeCallbacks(observationTime, timeoutMillis) {
        return this._callbacks.map(async ({ callback, instrument }) => {
            const observableResult = new ObservableResult_1.ObservableResultImpl(instrument._descriptor.name, instrument._descriptor.valueType);
            let callPromise = Promise.resolve(callback(observableResult));
            if (timeoutMillis != null) {
                callPromise = (0, utils_1.callWithTimeout)(callPromise, timeoutMillis);
            }
            await callPromise;
            instrument._metricStorages.forEach(metricStorage => {
                metricStorage.record(observableResult._buffer, observationTime);
            });
        });
    }
    _observeBatchCallbacks(observationTime, timeoutMillis) {
        return this._batchCallbacks.map(async ({ callback, instruments }) => {
            const observableResult = new ObservableResult_1.BatchObservableResultImpl();
            let callPromise = Promise.resolve(callback(observableResult));
            if (timeoutMillis != null) {
                callPromise = (0, utils_1.callWithTimeout)(callPromise, timeoutMillis);
            }
            await callPromise;
            instruments.forEach(instrument => {
                const buffer = observableResult._buffer.get(instrument);
                if (buffer == null) {
                    return;
                }
                instrument._metricStorages.forEach(metricStorage => {
                    metricStorage.record(buffer, observationTime);
                });
            });
        });
    }
    _findCallback(callback, instrument) {
        return this._callbacks.findIndex(record => {
            return record.callback === callback && record.instrument === instrument;
        });
    }
    _findBatchCallback(callback, instruments) {
        return this._batchCallbacks.findIndex(record => {
            return (record.callback === callback &&
                (0, utils_1.setEquals)(record.instruments, instruments));
        });
    }
}
exports.ObservableRegistry = ObservableRegistry;
//# sourceMappingURL=ObservableRegistry.js.map

/***/ }),

/***/ 2766:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SyncMetricStorage = void 0;
const MetricStorage_1 = __nccwpck_require__(3134);
const DeltaMetricProcessor_1 = __nccwpck_require__(1904);
const TemporalMetricProcessor_1 = __nccwpck_require__(2566);
/**
 * Internal interface.
 *
 * Stores and aggregates {@link MetricData} for synchronous instruments.
 */
class SyncMetricStorage extends MetricStorage_1.MetricStorage {
    constructor(instrumentDescriptor, aggregator, _attributesProcessor, collectorHandles) {
        super(instrumentDescriptor);
        this._attributesProcessor = _attributesProcessor;
        this._deltaMetricStorage = new DeltaMetricProcessor_1.DeltaMetricProcessor(aggregator);
        this._temporalMetricStorage = new TemporalMetricProcessor_1.TemporalMetricProcessor(aggregator, collectorHandles);
    }
    record(value, attributes, context, recordTime) {
        attributes = this._attributesProcessor.process(attributes, context);
        this._deltaMetricStorage.record(value, attributes, context, recordTime);
    }
    /**
     * Collects the metrics from this storage.
     *
     * Note: This is a stateful operation and may reset any interval-related
     * state for the MetricCollector.
     */
    collect(collector, collectionTime) {
        const accumulations = this._deltaMetricStorage.collect();
        return this._temporalMetricStorage.buildMetrics(collector, this._instrumentDescriptor, accumulations, collectionTime);
    }
}
exports.SyncMetricStorage = SyncMetricStorage;
//# sourceMappingURL=SyncMetricStorage.js.map

/***/ }),

/***/ 2566:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TemporalMetricProcessor = void 0;
const AggregationTemporality_1 = __nccwpck_require__(8589);
const HashMap_1 = __nccwpck_require__(205);
/**
 * Internal interface.
 *
 * Provides unique reporting for each collector. Allows synchronous collection
 * of metrics and reports given temporality values.
 */
class TemporalMetricProcessor {
    constructor(_aggregator, collectorHandles) {
        this._aggregator = _aggregator;
        this._unreportedAccumulations = new Map();
        this._reportHistory = new Map();
        collectorHandles.forEach(handle => {
            this._unreportedAccumulations.set(handle, []);
        });
    }
    /**
     * Builds the {@link MetricData} streams to report against a specific MetricCollector.
     * @param collector The information of the MetricCollector.
     * @param collectors The registered collectors.
     * @param instrumentDescriptor The instrumentation descriptor that these metrics generated with.
     * @param currentAccumulations The current accumulation of metric data from instruments.
     * @param collectionTime The current collection timestamp.
     * @returns The {@link MetricData} points or `null`.
     */
    buildMetrics(collector, instrumentDescriptor, currentAccumulations, collectionTime) {
        this._stashAccumulations(currentAccumulations);
        const unreportedAccumulations = this._getMergedUnreportedAccumulations(collector);
        let result = unreportedAccumulations;
        let aggregationTemporality;
        // Check our last report time.
        if (this._reportHistory.has(collector)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const last = this._reportHistory.get(collector);
            const lastCollectionTime = last.collectionTime;
            aggregationTemporality = last.aggregationTemporality;
            // Use aggregation temporality + instrument to determine if we do a merge or a diff of
            // previous. We have the following four scenarios:
            // 1. Cumulative Aggregation (temporality) + Delta recording (sync instrument).
            //    Here we merge with our last record to get a cumulative aggregation.
            // 2. Cumulative Aggregation + Cumulative recording (async instrument).
            //    Cumulative records are converted to delta recording with DeltaMetricProcessor.
            //    Here we merge with our last record to get a cumulative aggregation.
            // 3. Delta Aggregation + Delta recording
            //    Calibrate the startTime of metric streams to be the reader's lastCollectionTime.
            // 4. Delta Aggregation + Cumulative recording.
            //    Cumulative records are converted to delta recording with DeltaMetricProcessor.
            //    Calibrate the startTime of metric streams to be the reader's lastCollectionTime.
            if (aggregationTemporality === AggregationTemporality_1.AggregationTemporality.CUMULATIVE) {
                // We need to make sure the current delta recording gets merged into the previous cumulative
                // for the next cumulative recording.
                result = TemporalMetricProcessor.merge(last.accumulations, unreportedAccumulations, this._aggregator);
            }
            else {
                result = TemporalMetricProcessor.calibrateStartTime(last.accumulations, unreportedAccumulations, lastCollectionTime);
            }
        }
        else {
            // Call into user code to select aggregation temporality for the instrument.
            aggregationTemporality = collector.selectAggregationTemporality(instrumentDescriptor.type);
        }
        // Update last reported (cumulative) accumulation.
        this._reportHistory.set(collector, {
            accumulations: result,
            collectionTime,
            aggregationTemporality,
        });
        const accumulationRecords = AttributesMapToAccumulationRecords(result);
        // do not convert to metric data if there is nothing to convert.
        if (accumulationRecords.length === 0) {
            return undefined;
        }
        return this._aggregator.toMetricData(instrumentDescriptor, aggregationTemporality, accumulationRecords, 
        /* endTime */ collectionTime);
    }
    _stashAccumulations(currentAccumulation) {
        const registeredCollectors = this._unreportedAccumulations.keys();
        for (const collector of registeredCollectors) {
            let stash = this._unreportedAccumulations.get(collector);
            if (stash === undefined) {
                stash = [];
                this._unreportedAccumulations.set(collector, stash);
            }
            stash.push(currentAccumulation);
        }
    }
    _getMergedUnreportedAccumulations(collector) {
        let result = new HashMap_1.AttributeHashMap();
        const unreportedList = this._unreportedAccumulations.get(collector);
        this._unreportedAccumulations.set(collector, []);
        if (unreportedList === undefined) {
            return result;
        }
        for (const it of unreportedList) {
            result = TemporalMetricProcessor.merge(result, it, this._aggregator);
        }
        return result;
    }
    static merge(last, current, aggregator) {
        const result = last;
        const iterator = current.entries();
        let next = iterator.next();
        while (next.done !== true) {
            const [key, record, hash] = next.value;
            if (last.has(key, hash)) {
                const lastAccumulation = last.get(key, hash);
                // last.has() returned true, lastAccumulation is present.
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const accumulation = aggregator.merge(lastAccumulation, record);
                result.set(key, accumulation, hash);
            }
            else {
                result.set(key, record, hash);
            }
            next = iterator.next();
        }
        return result;
    }
    /**
     * Calibrate the reported metric streams' startTime to lastCollectionTime. Leaves
     * the new stream to be the initial observation time unchanged.
     */
    static calibrateStartTime(last, current, lastCollectionTime) {
        for (const [key, hash] of last.keys()) {
            const currentAccumulation = current.get(key, hash);
            currentAccumulation === null || currentAccumulation === void 0 ? void 0 : currentAccumulation.setStartTime(lastCollectionTime);
        }
        return current;
    }
}
exports.TemporalMetricProcessor = TemporalMetricProcessor;
// TypeScript complains about converting 3 elements tuple to AccumulationRecord<T>.
function AttributesMapToAccumulationRecords(map) {
    return Array.from(map.entries());
}
//# sourceMappingURL=TemporalMetricProcessor.js.map

/***/ }),

/***/ 9158:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.equalsCaseInsensitive = exports.binarySearchLB = exports.setEquals = exports.FlatMap = exports.isPromiseAllSettledRejectionResult = exports.PromiseAllSettled = exports.callWithTimeout = exports.TimeoutError = exports.instrumentationScopeId = exports.hashAttributes = exports.isNotNullish = void 0;
function isNotNullish(item) {
    return item !== undefined && item !== null;
}
exports.isNotNullish = isNotNullish;
/**
 * Converting the unordered attributes into unique identifier string.
 * @param attributes user provided unordered MetricAttributes.
 */
function hashAttributes(attributes) {
    let keys = Object.keys(attributes);
    if (keys.length === 0)
        return '';
    // Return a string that is stable on key orders.
    keys = keys.sort();
    return JSON.stringify(keys.map(key => [key, attributes[key]]));
}
exports.hashAttributes = hashAttributes;
/**
 * Converting the instrumentation scope object to a unique identifier string.
 * @param instrumentationScope
 */
function instrumentationScopeId(instrumentationScope) {
    var _a, _b;
    return `${instrumentationScope.name}:${(_a = instrumentationScope.version) !== null && _a !== void 0 ? _a : ''}:${(_b = instrumentationScope.schemaUrl) !== null && _b !== void 0 ? _b : ''}`;
}
exports.instrumentationScopeId = instrumentationScopeId;
/**
 * Error that is thrown on timeouts.
 */
class TimeoutError extends Error {
    constructor(message) {
        super(message);
        // manually adjust prototype to retain `instanceof` functionality when targeting ES5, see:
        // https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, TimeoutError.prototype);
    }
}
exports.TimeoutError = TimeoutError;
/**
 * Adds a timeout to a promise and rejects if the specified timeout has elapsed. Also rejects if the specified promise
 * rejects, and resolves if the specified promise resolves.
 *
 * <p> NOTE: this operation will continue even after it throws a {@link TimeoutError}.
 *
 * @param promise promise to use with timeout.
 * @param timeout the timeout in milliseconds until the returned promise is rejected.
 */
function callWithTimeout(promise, timeout) {
    let timeoutHandle;
    const timeoutPromise = new Promise(function timeoutFunction(_resolve, reject) {
        timeoutHandle = setTimeout(function timeoutHandler() {
            reject(new TimeoutError('Operation timed out.'));
        }, timeout);
    });
    return Promise.race([promise, timeoutPromise]).then(result => {
        clearTimeout(timeoutHandle);
        return result;
    }, reason => {
        clearTimeout(timeoutHandle);
        throw reason;
    });
}
exports.callWithTimeout = callWithTimeout;
/**
 * Node.js v12.9 lower and browser compatible `Promise.allSettled`.
 */
async function PromiseAllSettled(promises) {
    return Promise.all(promises.map(async (p) => {
        try {
            const ret = await p;
            return {
                status: 'fulfilled',
                value: ret,
            };
        }
        catch (e) {
            return {
                status: 'rejected',
                reason: e,
            };
        }
    }));
}
exports.PromiseAllSettled = PromiseAllSettled;
function isPromiseAllSettledRejectionResult(it) {
    return it.status === 'rejected';
}
exports.isPromiseAllSettledRejectionResult = isPromiseAllSettledRejectionResult;
/**
 * Node.js v11.0 lower and browser compatible `Array.prototype.flatMap`.
 */
function FlatMap(arr, fn) {
    const result = [];
    arr.forEach(it => {
        result.push(...fn(it));
    });
    return result;
}
exports.FlatMap = FlatMap;
function setEquals(lhs, rhs) {
    if (lhs.size !== rhs.size) {
        return false;
    }
    for (const item of lhs) {
        if (!rhs.has(item)) {
            return false;
        }
    }
    return true;
}
exports.setEquals = setEquals;
/**
 * Binary search the sorted array to the find lower bound for the value.
 * @param arr
 * @param value
 * @returns
 */
function binarySearchLB(arr, value) {
    let lo = 0;
    let hi = arr.length - 1;
    while (hi - lo > 1) {
        const mid = Math.trunc((hi + lo) / 2);
        if (arr[mid] <= value) {
            lo = mid;
        }
        else {
            hi = mid - 1;
        }
    }
    if (arr[hi] <= value) {
        return hi;
    }
    else if (arr[lo] <= value) {
        return lo;
    }
    return -1;
}
exports.binarySearchLB = binarySearchLB;
function equalsCaseInsensitive(lhs, rhs) {
    return lhs.toLowerCase() === rhs.toLowerCase();
}
exports.equalsCaseInsensitive = equalsCaseInsensitive;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 4769:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DefaultAggregation = exports.ExponentialHistogramAggregation = exports.ExplicitBucketHistogramAggregation = exports.HistogramAggregation = exports.LastValueAggregation = exports.SumAggregation = exports.DropAggregation = exports.Aggregation = void 0;
const api = __nccwpck_require__(5163);
const aggregator_1 = __nccwpck_require__(5922);
const InstrumentDescriptor_1 = __nccwpck_require__(2671);
/**
 * Configures how measurements are combined into metrics for views.
 *
 * Aggregation provides a set of built-in aggregations via static methods.
 */
class Aggregation {
    static Drop() {
        return DROP_AGGREGATION;
    }
    static Sum() {
        return SUM_AGGREGATION;
    }
    static LastValue() {
        return LAST_VALUE_AGGREGATION;
    }
    static Histogram() {
        return HISTOGRAM_AGGREGATION;
    }
    static ExponentialHistogram() {
        return EXPONENTIAL_HISTOGRAM_AGGREGATION;
    }
    static Default() {
        return DEFAULT_AGGREGATION;
    }
}
exports.Aggregation = Aggregation;
/**
 * The default drop aggregation.
 */
class DropAggregation extends Aggregation {
    createAggregator(_instrument) {
        return DropAggregation.DEFAULT_INSTANCE;
    }
}
exports.DropAggregation = DropAggregation;
DropAggregation.DEFAULT_INSTANCE = new aggregator_1.DropAggregator();
/**
 * The default sum aggregation.
 */
class SumAggregation extends Aggregation {
    createAggregator(instrument) {
        switch (instrument.type) {
            case InstrumentDescriptor_1.InstrumentType.COUNTER:
            case InstrumentDescriptor_1.InstrumentType.OBSERVABLE_COUNTER:
            case InstrumentDescriptor_1.InstrumentType.HISTOGRAM: {
                return SumAggregation.MONOTONIC_INSTANCE;
            }
            default: {
                return SumAggregation.NON_MONOTONIC_INSTANCE;
            }
        }
    }
}
exports.SumAggregation = SumAggregation;
SumAggregation.MONOTONIC_INSTANCE = new aggregator_1.SumAggregator(true);
SumAggregation.NON_MONOTONIC_INSTANCE = new aggregator_1.SumAggregator(false);
/**
 * The default last value aggregation.
 */
class LastValueAggregation extends Aggregation {
    createAggregator(_instrument) {
        return LastValueAggregation.DEFAULT_INSTANCE;
    }
}
exports.LastValueAggregation = LastValueAggregation;
LastValueAggregation.DEFAULT_INSTANCE = new aggregator_1.LastValueAggregator();
/**
 * The default histogram aggregation.
 */
class HistogramAggregation extends Aggregation {
    createAggregator(_instrument) {
        return HistogramAggregation.DEFAULT_INSTANCE;
    }
}
exports.HistogramAggregation = HistogramAggregation;
HistogramAggregation.DEFAULT_INSTANCE = new aggregator_1.HistogramAggregator([0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000, 7500, 10000], true);
/**
 * The explicit bucket histogram aggregation.
 */
class ExplicitBucketHistogramAggregation extends Aggregation {
    /**
     * @param boundaries the bucket boundaries of the histogram aggregation
     * @param _recordMinMax If set to true, min and max will be recorded. Otherwise, min and max will not be recorded.
     */
    constructor(boundaries, _recordMinMax = true) {
        super();
        this._recordMinMax = _recordMinMax;
        if (boundaries === undefined || boundaries.length === 0) {
            throw new Error('HistogramAggregator should be created with boundaries.');
        }
        // Copy the boundaries array for modification.
        boundaries = boundaries.concat();
        // We need to an ordered set to be able to correctly compute count for each
        // boundary since we'll iterate on each in order.
        boundaries = boundaries.sort((a, b) => a - b);
        // Remove all Infinity from the boundaries.
        const minusInfinityIndex = boundaries.lastIndexOf(-Infinity);
        let infinityIndex = boundaries.indexOf(Infinity);
        if (infinityIndex === -1) {
            infinityIndex = undefined;
        }
        this._boundaries = boundaries.slice(minusInfinityIndex + 1, infinityIndex);
    }
    createAggregator(_instrument) {
        return new aggregator_1.HistogramAggregator(this._boundaries, this._recordMinMax);
    }
}
exports.ExplicitBucketHistogramAggregation = ExplicitBucketHistogramAggregation;
class ExponentialHistogramAggregation extends Aggregation {
    constructor(_maxSize = 160, _recordMinMax = true) {
        super();
        this._maxSize = _maxSize;
        this._recordMinMax = _recordMinMax;
    }
    createAggregator(_instrument) {
        return new aggregator_1.ExponentialHistogramAggregator(this._maxSize, this._recordMinMax);
    }
}
exports.ExponentialHistogramAggregation = ExponentialHistogramAggregation;
/**
 * The default aggregation.
 */
class DefaultAggregation extends Aggregation {
    _resolve(instrument) {
        // cast to unknown to disable complaints on the (unreachable) fallback.
        switch (instrument.type) {
            case InstrumentDescriptor_1.InstrumentType.COUNTER:
            case InstrumentDescriptor_1.InstrumentType.UP_DOWN_COUNTER:
            case InstrumentDescriptor_1.InstrumentType.OBSERVABLE_COUNTER:
            case InstrumentDescriptor_1.InstrumentType.OBSERVABLE_UP_DOWN_COUNTER: {
                return SUM_AGGREGATION;
            }
            case InstrumentDescriptor_1.InstrumentType.OBSERVABLE_GAUGE: {
                return LAST_VALUE_AGGREGATION;
            }
            case InstrumentDescriptor_1.InstrumentType.HISTOGRAM: {
                if (instrument.advice.explicitBucketBoundaries) {
                    return new ExplicitBucketHistogramAggregation(instrument.advice.explicitBucketBoundaries);
                }
                return HISTOGRAM_AGGREGATION;
            }
        }
        api.diag.warn(`Unable to recognize instrument type: ${instrument.type}`);
        return DROP_AGGREGATION;
    }
    createAggregator(instrument) {
        return this._resolve(instrument).createAggregator(instrument);
    }
}
exports.DefaultAggregation = DefaultAggregation;
const DROP_AGGREGATION = new DropAggregation();
const SUM_AGGREGATION = new SumAggregation();
const LAST_VALUE_AGGREGATION = new LastValueAggregation();
const HISTOGRAM_AGGREGATION = new HistogramAggregation();
const EXPONENTIAL_HISTOGRAM_AGGREGATION = new ExponentialHistogramAggregation();
const DEFAULT_AGGREGATION = new DefaultAggregation();
//# sourceMappingURL=Aggregation.js.map

/***/ }),

/***/ 1952:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FilteringAttributesProcessor = exports.NoopAttributesProcessor = exports.AttributesProcessor = void 0;
/**
 * The {@link AttributesProcessor} is responsible for customizing which
 * attribute(s) are to be reported as metrics dimension(s) and adding
 * additional dimension(s) from the {@link Context}.
 */
class AttributesProcessor {
    static Noop() {
        return NOOP;
    }
}
exports.AttributesProcessor = AttributesProcessor;
class NoopAttributesProcessor extends AttributesProcessor {
    process(incoming, _context) {
        return incoming;
    }
}
exports.NoopAttributesProcessor = NoopAttributesProcessor;
/**
 * {@link AttributesProcessor} that filters by allowed attribute names and drops any names that are not in the
 * allow list.
 */
class FilteringAttributesProcessor extends AttributesProcessor {
    constructor(_allowedAttributeNames) {
        super();
        this._allowedAttributeNames = _allowedAttributeNames;
    }
    process(incoming, _context) {
        const filteredAttributes = {};
        Object.keys(incoming)
            .filter(attributeName => this._allowedAttributeNames.includes(attributeName))
            .forEach(attributeName => (filteredAttributes[attributeName] = incoming[attributeName]));
        return filteredAttributes;
    }
}
exports.FilteringAttributesProcessor = FilteringAttributesProcessor;
const NOOP = new NoopAttributesProcessor();
//# sourceMappingURL=AttributesProcessor.js.map

/***/ }),

/***/ 2979:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InstrumentSelector = void 0;
const Predicate_1 = __nccwpck_require__(6443);
class InstrumentSelector {
    constructor(criteria) {
        var _a;
        this._nameFilter = new Predicate_1.PatternPredicate((_a = criteria === null || criteria === void 0 ? void 0 : criteria.name) !== null && _a !== void 0 ? _a : '*');
        this._type = criteria === null || criteria === void 0 ? void 0 : criteria.type;
        this._unitFilter = new Predicate_1.ExactPredicate(criteria === null || criteria === void 0 ? void 0 : criteria.unit);
    }
    getType() {
        return this._type;
    }
    getNameFilter() {
        return this._nameFilter;
    }
    getUnitFilter() {
        return this._unitFilter;
    }
}
exports.InstrumentSelector = InstrumentSelector;
//# sourceMappingURL=InstrumentSelector.js.map

/***/ }),

/***/ 9851:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MeterSelector = void 0;
const Predicate_1 = __nccwpck_require__(6443);
class MeterSelector {
    constructor(criteria) {
        this._nameFilter = new Predicate_1.ExactPredicate(criteria === null || criteria === void 0 ? void 0 : criteria.name);
        this._versionFilter = new Predicate_1.ExactPredicate(criteria === null || criteria === void 0 ? void 0 : criteria.version);
        this._schemaUrlFilter = new Predicate_1.ExactPredicate(criteria === null || criteria === void 0 ? void 0 : criteria.schemaUrl);
    }
    getNameFilter() {
        return this._nameFilter;
    }
    /**
     * TODO: semver filter? no spec yet.
     */
    getVersionFilter() {
        return this._versionFilter;
    }
    getSchemaUrlFilter() {
        return this._schemaUrlFilter;
    }
}
exports.MeterSelector = MeterSelector;
//# sourceMappingURL=MeterSelector.js.map

/***/ }),

/***/ 6443:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExactPredicate = exports.PatternPredicate = void 0;
// https://tc39.es/proposal-regex-escaping
// escape ^ $ \ .  + ? ( ) [ ] { } |
// do not need to escape * as we interpret it as wildcard
const ESCAPE = /[\^$\\.+?()[\]{}|]/g;
/**
 * Wildcard pattern predicate, supports patterns like `*`, `foo*`, `*bar`.
 */
class PatternPredicate {
    constructor(pattern) {
        if (pattern === '*') {
            this._matchAll = true;
            this._regexp = /.*/;
        }
        else {
            this._matchAll = false;
            this._regexp = new RegExp(PatternPredicate.escapePattern(pattern));
        }
    }
    match(str) {
        if (this._matchAll) {
            return true;
        }
        return this._regexp.test(str);
    }
    static escapePattern(pattern) {
        return `^${pattern.replace(ESCAPE, '\\$&').replace('*', '.*')}$`;
    }
    static hasWildcard(pattern) {
        return pattern.includes('*');
    }
}
exports.PatternPredicate = PatternPredicate;
class ExactPredicate {
    constructor(pattern) {
        this._matchAll = pattern === undefined;
        this._pattern = pattern;
    }
    match(str) {
        if (this._matchAll) {
            return true;
        }
        if (str === this._pattern) {
            return true;
        }
        return false;
    }
}
exports.ExactPredicate = ExactPredicate;
//# sourceMappingURL=Predicate.js.map

/***/ }),

/***/ 6212:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getConflictResolutionRecipe = exports.getDescriptionResolutionRecipe = exports.getTypeConflictResolutionRecipe = exports.getUnitConflictResolutionRecipe = exports.getValueTypeConflictResolutionRecipe = exports.getIncompatibilityDetails = void 0;
function getIncompatibilityDetails(existing, otherDescriptor) {
    let incompatibility = '';
    if (existing.unit !== otherDescriptor.unit) {
        incompatibility += `\t- Unit '${existing.unit}' does not match '${otherDescriptor.unit}'\n`;
    }
    if (existing.type !== otherDescriptor.type) {
        incompatibility += `\t- Type '${existing.type}' does not match '${otherDescriptor.type}'\n`;
    }
    if (existing.valueType !== otherDescriptor.valueType) {
        incompatibility += `\t- Value Type '${existing.valueType}' does not match '${otherDescriptor.valueType}'\n`;
    }
    if (existing.description !== otherDescriptor.description) {
        incompatibility += `\t- Description '${existing.description}' does not match '${otherDescriptor.description}'\n`;
    }
    return incompatibility;
}
exports.getIncompatibilityDetails = getIncompatibilityDetails;
function getValueTypeConflictResolutionRecipe(existing, otherDescriptor) {
    return `\t- use valueType '${existing.valueType}' on instrument creation or use an instrument name other than '${otherDescriptor.name}'`;
}
exports.getValueTypeConflictResolutionRecipe = getValueTypeConflictResolutionRecipe;
function getUnitConflictResolutionRecipe(existing, otherDescriptor) {
    return `\t- use unit '${existing.unit}' on instrument creation or use an instrument name other than '${otherDescriptor.name}'`;
}
exports.getUnitConflictResolutionRecipe = getUnitConflictResolutionRecipe;
function getTypeConflictResolutionRecipe(existing, otherDescriptor) {
    const selector = {
        name: otherDescriptor.name,
        type: otherDescriptor.type,
        unit: otherDescriptor.unit,
    };
    const selectorString = JSON.stringify(selector);
    return `\t- create a new view with a name other than '${existing.name}' and InstrumentSelector '${selectorString}'`;
}
exports.getTypeConflictResolutionRecipe = getTypeConflictResolutionRecipe;
function getDescriptionResolutionRecipe(existing, otherDescriptor) {
    const selector = {
        name: otherDescriptor.name,
        type: otherDescriptor.type,
        unit: otherDescriptor.unit,
    };
    const selectorString = JSON.stringify(selector);
    return `\t- create a new view with a name other than '${existing.name}' and InstrumentSelector '${selectorString}'
    \t- OR - create a new view with the name ${existing.name} and description '${existing.description}' and InstrumentSelector ${selectorString}
    \t- OR - create a new view with the name ${otherDescriptor.name} and description '${existing.description}' and InstrumentSelector ${selectorString}`;
}
exports.getDescriptionResolutionRecipe = getDescriptionResolutionRecipe;
function getConflictResolutionRecipe(existing, otherDescriptor) {
    // Conflicts that cannot be solved via views.
    if (existing.valueType !== otherDescriptor.valueType) {
        return getValueTypeConflictResolutionRecipe(existing, otherDescriptor);
    }
    if (existing.unit !== otherDescriptor.unit) {
        return getUnitConflictResolutionRecipe(existing, otherDescriptor);
    }
    // Conflicts that can be solved via views.
    if (existing.type !== otherDescriptor.type) {
        // this will automatically solve possible description conflicts.
        return getTypeConflictResolutionRecipe(existing, otherDescriptor);
    }
    if (existing.description !== otherDescriptor.description) {
        return getDescriptionResolutionRecipe(existing, otherDescriptor);
    }
    return '';
}
exports.getConflictResolutionRecipe = getConflictResolutionRecipe;
//# sourceMappingURL=RegistrationConflicts.js.map

/***/ }),

/***/ 1265:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.View = void 0;
const Predicate_1 = __nccwpck_require__(6443);
const AttributesProcessor_1 = __nccwpck_require__(1952);
const InstrumentSelector_1 = __nccwpck_require__(2979);
const MeterSelector_1 = __nccwpck_require__(9851);
const Aggregation_1 = __nccwpck_require__(4769);
function isSelectorNotProvided(options) {
    return (options.instrumentName == null &&
        options.instrumentType == null &&
        options.instrumentUnit == null &&
        options.meterName == null &&
        options.meterVersion == null &&
        options.meterSchemaUrl == null);
}
/**
 * Can be passed to a {@link MeterProvider} to select instruments and alter their metric stream.
 */
class View {
    /**
     * Create a new {@link View} instance.
     *
     * Parameters can be categorized as two types:
     *  Instrument selection criteria: Used to describe the instrument(s) this view will be applied to.
     *  Will be treated as additive (the Instrument has to meet all the provided criteria to be selected).
     *
     *  Metric stream altering: Alter the metric stream of instruments selected by instrument selection criteria.
     *
     * @param viewOptions {@link ViewOptions} for altering the metric stream and instrument selection.
     * @param viewOptions.name
     * Alters the metric stream:
     *  This will be used as the name of the metrics stream.
     *  If not provided, the original Instrument name will be used.
     * @param viewOptions.description
     * Alters the metric stream:
     *  This will be used as the description of the metrics stream.
     *  If not provided, the original Instrument description will be used by default.
     * @param viewOptions.attributeKeys
     * Alters the metric stream:
     *  If provided, the attributes that are not in the list will be ignored.
     *  If not provided, all attribute keys will be used by default.
     * @param viewOptions.aggregation
     * Alters the metric stream:
     *  Alters the {@link Aggregation} of the metric stream.
     * @param viewOptions.instrumentName
     * Instrument selection criteria:
     *  Original name of the Instrument(s) with wildcard support.
     * @param viewOptions.instrumentType
     * Instrument selection criteria:
     *  The original type of the Instrument(s).
     * @param viewOptions.instrumentUnit
     * Instrument selection criteria:
     *  The unit of the Instrument(s).
     * @param viewOptions.meterName
     * Instrument selection criteria:
     *  The name of the Meter. No wildcard support, name must match the meter exactly.
     * @param viewOptions.meterVersion
     * Instrument selection criteria:
     *  The version of the Meter. No wildcard support, version must match exactly.
     * @param viewOptions.meterSchemaUrl
     * Instrument selection criteria:
     *  The schema URL of the Meter. No wildcard support, schema URL must match exactly.
     *
     * @example
     * // Create a view that changes the Instrument 'my.instrument' to use to an
     * // ExplicitBucketHistogramAggregation with the boundaries [20, 30, 40]
     * new View({
     *   aggregation: new ExplicitBucketHistogramAggregation([20, 30, 40]),
     *   instrumentName: 'my.instrument'
     * })
     */
    constructor(viewOptions) {
        var _a;
        // If no criteria is provided, the SDK SHOULD treat it as an error.
        // It is recommended that the SDK implementations fail fast.
        if (isSelectorNotProvided(viewOptions)) {
            throw new Error('Cannot create view with no selector arguments supplied');
        }
        // the SDK SHOULD NOT allow Views with a specified name to be declared with instrument selectors that
        // may select more than one instrument (e.g. wild card instrument name) in the same Meter.
        if (viewOptions.name != null &&
            ((viewOptions === null || viewOptions === void 0 ? void 0 : viewOptions.instrumentName) == null ||
                Predicate_1.PatternPredicate.hasWildcard(viewOptions.instrumentName))) {
            throw new Error('Views with a specified name must be declared with an instrument selector that selects at most one instrument per meter.');
        }
        // Create AttributesProcessor if attributeKeys are defined set.
        if (viewOptions.attributeKeys != null) {
            this.attributesProcessor = new AttributesProcessor_1.FilteringAttributesProcessor(viewOptions.attributeKeys);
        }
        else {
            this.attributesProcessor = AttributesProcessor_1.AttributesProcessor.Noop();
        }
        this.name = viewOptions.name;
        this.description = viewOptions.description;
        this.aggregation = (_a = viewOptions.aggregation) !== null && _a !== void 0 ? _a : Aggregation_1.Aggregation.Default();
        this.instrumentSelector = new InstrumentSelector_1.InstrumentSelector({
            name: viewOptions.instrumentName,
            type: viewOptions.instrumentType,
            unit: viewOptions.instrumentUnit,
        });
        this.meterSelector = new MeterSelector_1.MeterSelector({
            name: viewOptions.meterName,
            version: viewOptions.meterVersion,
            schemaUrl: viewOptions.meterSchemaUrl,
        });
    }
}
exports.View = View;
//# sourceMappingURL=View.js.map

/***/ }),

/***/ 6379:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ViewRegistry = void 0;
class ViewRegistry {
    constructor() {
        this._registeredViews = [];
    }
    addView(view) {
        this._registeredViews.push(view);
    }
    findViews(instrument, meter) {
        const views = this._registeredViews.filter(registeredView => {
            return (this._matchInstrument(registeredView.instrumentSelector, instrument) &&
                this._matchMeter(registeredView.meterSelector, meter));
        });
        return views;
    }
    _matchInstrument(selector, instrument) {
        return ((selector.getType() === undefined ||
            instrument.type === selector.getType()) &&
            selector.getNameFilter().match(instrument.name) &&
            selector.getUnitFilter().match(instrument.unit));
    }
    _matchMeter(selector, meter) {
        return (selector.getNameFilter().match(meter.name) &&
            (meter.version === undefined ||
                selector.getVersionFilter().match(meter.version)) &&
            (meter.schemaUrl === undefined ||
                selector.getSchemaUrlFilter().match(meter.schemaUrl)));
    }
}
exports.ViewRegistry = ViewRegistry;
//# sourceMappingURL=ViewRegistry.js.map

/***/ }),

/***/ 7275:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(5836), exports);
__exportStar(__nccwpck_require__(2834), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 5003:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TelemetrySdkLanguageValues = exports.OsTypeValues = exports.HostArchValues = exports.AwsEcsLaunchtypeValues = exports.CloudPlatformValues = exports.CloudProviderValues = exports.SemanticResourceAttributes = void 0;
// DO NOT EDIT, this is an Auto-generated file from scripts/semconv/templates//templates/SemanticAttributes.ts.j2
exports.SemanticResourceAttributes = {
    /**
     * Name of the cloud provider.
     */
    CLOUD_PROVIDER: 'cloud.provider',
    /**
     * The cloud account ID the resource is assigned to.
     */
    CLOUD_ACCOUNT_ID: 'cloud.account.id',
    /**
     * The geographical region the resource is running. Refer to your provider&#39;s docs to see the available regions, for example [Alibaba Cloud regions](https://www.alibabacloud.com/help/doc-detail/40654.htm), [AWS regions](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/), [Azure regions](https://azure.microsoft.com/en-us/global-infrastructure/geographies/), or [Google Cloud regions](https://cloud.google.com/about/locations).
     */
    CLOUD_REGION: 'cloud.region',
    /**
     * Cloud regions often have multiple, isolated locations known as zones to increase availability. Availability zone represents the zone where the resource is running.
     *
     * Note: Availability zones are called &#34;zones&#34; on Alibaba Cloud and Google Cloud.
     */
    CLOUD_AVAILABILITY_ZONE: 'cloud.availability_zone',
    /**
     * The cloud platform in use.
     *
     * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
     */
    CLOUD_PLATFORM: 'cloud.platform',
    /**
     * The Amazon Resource Name (ARN) of an [ECS container instance](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_instances.html).
     */
    AWS_ECS_CONTAINER_ARN: 'aws.ecs.container.arn',
    /**
     * The ARN of an [ECS cluster](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/clusters.html).
     */
    AWS_ECS_CLUSTER_ARN: 'aws.ecs.cluster.arn',
    /**
     * The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
     */
    AWS_ECS_LAUNCHTYPE: 'aws.ecs.launchtype',
    /**
     * The ARN of an [ECS task definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html).
     */
    AWS_ECS_TASK_ARN: 'aws.ecs.task.arn',
    /**
     * The task definition family this task definition is a member of.
     */
    AWS_ECS_TASK_FAMILY: 'aws.ecs.task.family',
    /**
     * The revision for this task definition.
     */
    AWS_ECS_TASK_REVISION: 'aws.ecs.task.revision',
    /**
     * The ARN of an EKS cluster.
     */
    AWS_EKS_CLUSTER_ARN: 'aws.eks.cluster.arn',
    /**
     * The name(s) of the AWS log group(s) an application is writing to.
     *
     * Note: Multiple log groups must be supported for cases like multi-container applications, where a single application has sidecar containers, and each write to their own log group.
     */
    AWS_LOG_GROUP_NAMES: 'aws.log.group.names',
    /**
     * The Amazon Resource Name(s) (ARN) of the AWS log group(s).
     *
     * Note: See the [log group ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format).
     */
    AWS_LOG_GROUP_ARNS: 'aws.log.group.arns',
    /**
     * The name(s) of the AWS log stream(s) an application is writing to.
     */
    AWS_LOG_STREAM_NAMES: 'aws.log.stream.names',
    /**
     * The ARN(s) of the AWS log stream(s).
     *
     * Note: See the [log stream ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format). One log group can contain several log streams, so these ARNs necessarily identify both a log group and a log stream.
     */
    AWS_LOG_STREAM_ARNS: 'aws.log.stream.arns',
    /**
     * Container name.
     */
    CONTAINER_NAME: 'container.name',
    /**
     * Container ID. Usually a UUID, as for example used to [identify Docker containers](https://docs.docker.com/engine/reference/run/#container-identification). The UUID might be abbreviated.
     */
    CONTAINER_ID: 'container.id',
    /**
     * The container runtime managing this container.
     */
    CONTAINER_RUNTIME: 'container.runtime',
    /**
     * Name of the image the container was built on.
     */
    CONTAINER_IMAGE_NAME: 'container.image.name',
    /**
     * Container image tag.
     */
    CONTAINER_IMAGE_TAG: 'container.image.tag',
    /**
     * Name of the [deployment environment](https://en.wikipedia.org/wiki/Deployment_environment) (aka deployment tier).
     */
    DEPLOYMENT_ENVIRONMENT: 'deployment.environment',
    /**
     * A unique identifier representing the device.
     *
     * Note: The device identifier MUST only be defined using the values outlined below. This value is not an advertising identifier and MUST NOT be used as such. On iOS (Swift or Objective-C), this value MUST be equal to the [vendor identifier](https://developer.apple.com/documentation/uikit/uidevice/1620059-identifierforvendor). On Android (Java or Kotlin), this value MUST be equal to the Firebase Installation ID or a globally unique UUID which is persisted across sessions in your application. More information can be found [here](https://developer.android.com/training/articles/user-data-ids) on best practices and exact implementation details. Caution should be taken when storing personal data or anything which can identify a user. GDPR and data protection laws may apply, ensure you do your own due diligence.
     */
    DEVICE_ID: 'device.id',
    /**
     * The model identifier for the device.
     *
     * Note: It&#39;s recommended this value represents a machine readable version of the model identifier rather than the market or consumer-friendly name of the device.
     */
    DEVICE_MODEL_IDENTIFIER: 'device.model.identifier',
    /**
     * The marketing name for the device model.
     *
     * Note: It&#39;s recommended this value represents a human readable version of the device model rather than a machine readable alternative.
     */
    DEVICE_MODEL_NAME: 'device.model.name',
    /**
     * The name of the single function that this runtime instance executes.
     *
     * Note: This is the name of the function as configured/deployed on the FaaS platform and is usually different from the name of the callback function (which may be stored in the [`code.namespace`/`code.function`](../../trace/semantic_conventions/span-general.md#source-code-attributes) span attributes).
     */
    FAAS_NAME: 'faas.name',
    /**
    * The unique ID of the single function that this runtime instance executes.
    *
    * Note: Depending on the cloud provider, use:
  
  * **AWS Lambda:** The function [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html).
  Take care not to use the &#34;invoked ARN&#34; directly but replace any
  [alias suffix](https://docs.aws.amazon.com/lambda/latest/dg/configuration-aliases.html) with the resolved function version, as the same runtime instance may be invokable with multiple
  different aliases.
  * **GCP:** The [URI of the resource](https://cloud.google.com/iam/docs/full-resource-names)
  * **Azure:** The [Fully Qualified Resource ID](https://docs.microsoft.com/en-us/rest/api/resources/resources/get-by-id).
  
  On some providers, it may not be possible to determine the full ID at startup,
  which is why this field cannot be made required. For example, on AWS the account ID
  part of the ARN is not available without calling another AWS API
  which may be deemed too slow for a short-running lambda function.
  As an alternative, consider setting `faas.id` as a span attribute instead.
    */
    FAAS_ID: 'faas.id',
    /**
    * The immutable version of the function being executed.
    *
    * Note: Depending on the cloud provider and platform, use:
  
  * **AWS Lambda:** The [function version](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html)
    (an integer represented as a decimal string).
  * **Google Cloud Run:** The [revision](https://cloud.google.com/run/docs/managing/revisions)
    (i.e., the function name plus the revision suffix).
  * **Google Cloud Functions:** The value of the
    [`K_REVISION` environment variable](https://cloud.google.com/functions/docs/env-var#runtime_environment_variables_set_automatically).
  * **Azure Functions:** Not applicable. Do not set this attribute.
    */
    FAAS_VERSION: 'faas.version',
    /**
     * The execution environment ID as a string, that will be potentially reused for other invocations to the same function/function version.
     *
     * Note: * **AWS Lambda:** Use the (full) log stream name.
     */
    FAAS_INSTANCE: 'faas.instance',
    /**
     * The amount of memory available to the serverless function in MiB.
     *
     * Note: It&#39;s recommended to set this attribute since e.g. too little memory can easily stop a Java AWS Lambda function from working correctly. On AWS Lambda, the environment variable `AWS_LAMBDA_FUNCTION_MEMORY_SIZE` provides this information.
     */
    FAAS_MAX_MEMORY: 'faas.max_memory',
    /**
     * Unique host ID. For Cloud, this must be the instance_id assigned by the cloud provider.
     */
    HOST_ID: 'host.id',
    /**
     * Name of the host. On Unix systems, it may contain what the hostname command returns, or the fully qualified hostname, or another name specified by the user.
     */
    HOST_NAME: 'host.name',
    /**
     * Type of host. For Cloud, this must be the machine type.
     */
    HOST_TYPE: 'host.type',
    /**
     * The CPU architecture the host system is running on.
     */
    HOST_ARCH: 'host.arch',
    /**
     * Name of the VM image or OS install the host was instantiated from.
     */
    HOST_IMAGE_NAME: 'host.image.name',
    /**
     * VM image ID. For Cloud, this value is from the provider.
     */
    HOST_IMAGE_ID: 'host.image.id',
    /**
     * The version string of the VM image as defined in [Version SpanAttributes](README.md#version-attributes).
     */
    HOST_IMAGE_VERSION: 'host.image.version',
    /**
     * The name of the cluster.
     */
    K8S_CLUSTER_NAME: 'k8s.cluster.name',
    /**
     * The name of the Node.
     */
    K8S_NODE_NAME: 'k8s.node.name',
    /**
     * The UID of the Node.
     */
    K8S_NODE_UID: 'k8s.node.uid',
    /**
     * The name of the namespace that the pod is running in.
     */
    K8S_NAMESPACE_NAME: 'k8s.namespace.name',
    /**
     * The UID of the Pod.
     */
    K8S_POD_UID: 'k8s.pod.uid',
    /**
     * The name of the Pod.
     */
    K8S_POD_NAME: 'k8s.pod.name',
    /**
     * The name of the Container in a Pod template.
     */
    K8S_CONTAINER_NAME: 'k8s.container.name',
    /**
     * The UID of the ReplicaSet.
     */
    K8S_REPLICASET_UID: 'k8s.replicaset.uid',
    /**
     * The name of the ReplicaSet.
     */
    K8S_REPLICASET_NAME: 'k8s.replicaset.name',
    /**
     * The UID of the Deployment.
     */
    K8S_DEPLOYMENT_UID: 'k8s.deployment.uid',
    /**
     * The name of the Deployment.
     */
    K8S_DEPLOYMENT_NAME: 'k8s.deployment.name',
    /**
     * The UID of the StatefulSet.
     */
    K8S_STATEFULSET_UID: 'k8s.statefulset.uid',
    /**
     * The name of the StatefulSet.
     */
    K8S_STATEFULSET_NAME: 'k8s.statefulset.name',
    /**
     * The UID of the DaemonSet.
     */
    K8S_DAEMONSET_UID: 'k8s.daemonset.uid',
    /**
     * The name of the DaemonSet.
     */
    K8S_DAEMONSET_NAME: 'k8s.daemonset.name',
    /**
     * The UID of the Job.
     */
    K8S_JOB_UID: 'k8s.job.uid',
    /**
     * The name of the Job.
     */
    K8S_JOB_NAME: 'k8s.job.name',
    /**
     * The UID of the CronJob.
     */
    K8S_CRONJOB_UID: 'k8s.cronjob.uid',
    /**
     * The name of the CronJob.
     */
    K8S_CRONJOB_NAME: 'k8s.cronjob.name',
    /**
     * The operating system type.
     */
    OS_TYPE: 'os.type',
    /**
     * Human readable (not intended to be parsed) OS version information, like e.g. reported by `ver` or `lsb_release -a` commands.
     */
    OS_DESCRIPTION: 'os.description',
    /**
     * Human readable operating system name.
     */
    OS_NAME: 'os.name',
    /**
     * The version string of the operating system as defined in [Version SpanAttributes](../../resource/semantic_conventions/README.md#version-attributes).
     */
    OS_VERSION: 'os.version',
    /**
     * Process identifier (PID).
     */
    PROCESS_PID: 'process.pid',
    /**
     * The name of the process executable. On Linux based systems, can be set to the `Name` in `proc/[pid]/status`. On Windows, can be set to the base name of `GetProcessImageFileNameW`.
     */
    PROCESS_EXECUTABLE_NAME: 'process.executable.name',
    /**
     * The full path to the process executable. On Linux based systems, can be set to the target of `proc/[pid]/exe`. On Windows, can be set to the result of `GetProcessImageFileNameW`.
     */
    PROCESS_EXECUTABLE_PATH: 'process.executable.path',
    /**
     * The command used to launch the process (i.e. the command name). On Linux based systems, can be set to the zeroth string in `proc/[pid]/cmdline`. On Windows, can be set to the first parameter extracted from `GetCommandLineW`.
     */
    PROCESS_COMMAND: 'process.command',
    /**
     * The full command used to launch the process as a single string representing the full command. On Windows, can be set to the result of `GetCommandLineW`. Do not set this if you have to assemble it just for monitoring; use `process.command_args` instead.
     */
    PROCESS_COMMAND_LINE: 'process.command_line',
    /**
     * All the command arguments (including the command/executable itself) as received by the process. On Linux-based systems (and some other Unixoid systems supporting procfs), can be set according to the list of null-delimited strings extracted from `proc/[pid]/cmdline`. For libc-based executables, this would be the full argv vector passed to `main`.
     */
    PROCESS_COMMAND_ARGS: 'process.command_args',
    /**
     * The username of the user that owns the process.
     */
    PROCESS_OWNER: 'process.owner',
    /**
     * The name of the runtime of this process. For compiled native binaries, this SHOULD be the name of the compiler.
     */
    PROCESS_RUNTIME_NAME: 'process.runtime.name',
    /**
     * The version of the runtime of this process, as returned by the runtime without modification.
     */
    PROCESS_RUNTIME_VERSION: 'process.runtime.version',
    /**
     * An additional description about the runtime of the process, for example a specific vendor customization of the runtime environment.
     */
    PROCESS_RUNTIME_DESCRIPTION: 'process.runtime.description',
    /**
     * Logical name of the service.
     *
     * Note: MUST be the same for all instances of horizontally scaled services. If the value was not specified, SDKs MUST fallback to `unknown_service:` concatenated with [`process.executable.name`](process.md#process), e.g. `unknown_service:bash`. If `process.executable.name` is not available, the value MUST be set to `unknown_service`.
     */
    SERVICE_NAME: 'service.name',
    /**
     * A namespace for `service.name`.
     *
     * Note: A string value having a meaning that helps to distinguish a group of services, for example the team name that owns a group of services. `service.name` is expected to be unique within the same namespace. If `service.namespace` is not specified in the Resource then `service.name` is expected to be unique for all services that have no explicit namespace defined (so the empty/unspecified namespace is simply one more valid namespace). Zero-length namespace string is assumed equal to unspecified namespace.
     */
    SERVICE_NAMESPACE: 'service.namespace',
    /**
     * The string ID of the service instance.
     *
     * Note: MUST be unique for each instance of the same `service.namespace,service.name` pair (in other words `service.namespace,service.name,service.instance.id` triplet MUST be globally unique). The ID helps to distinguish instances of the same service that exist at the same time (e.g. instances of a horizontally scaled service). It is preferable for the ID to be persistent and stay the same for the lifetime of the service instance, however it is acceptable that the ID is ephemeral and changes during important lifetime events for the service (e.g. service restarts). If the service has no inherent unique ID that can be used as the value of this attribute it is recommended to generate a random Version 1 or Version 4 RFC 4122 UUID (services aiming for reproducible UUIDs may also use Version 5, see RFC 4122 for more recommendations).
     */
    SERVICE_INSTANCE_ID: 'service.instance.id',
    /**
     * The version string of the service API or implementation.
     */
    SERVICE_VERSION: 'service.version',
    /**
     * The name of the telemetry SDK as defined above.
     */
    TELEMETRY_SDK_NAME: 'telemetry.sdk.name',
    /**
     * The language of the telemetry SDK.
     */
    TELEMETRY_SDK_LANGUAGE: 'telemetry.sdk.language',
    /**
     * The version string of the telemetry SDK.
     */
    TELEMETRY_SDK_VERSION: 'telemetry.sdk.version',
    /**
     * The version string of the auto instrumentation agent, if used.
     */
    TELEMETRY_AUTO_VERSION: 'telemetry.auto.version',
    /**
     * The name of the web engine.
     */
    WEBENGINE_NAME: 'webengine.name',
    /**
     * The version of the web engine.
     */
    WEBENGINE_VERSION: 'webengine.version',
    /**
     * Additional description of the web engine (e.g. detailed version and edition information).
     */
    WEBENGINE_DESCRIPTION: 'webengine.description',
};
exports.CloudProviderValues = {
    /** Alibaba Cloud. */
    ALIBABA_CLOUD: 'alibaba_cloud',
    /** Amazon Web Services. */
    AWS: 'aws',
    /** Microsoft Azure. */
    AZURE: 'azure',
    /** Google Cloud Platform. */
    GCP: 'gcp',
};
exports.CloudPlatformValues = {
    /** Alibaba Cloud Elastic Compute Service. */
    ALIBABA_CLOUD_ECS: 'alibaba_cloud_ecs',
    /** Alibaba Cloud Function Compute. */
    ALIBABA_CLOUD_FC: 'alibaba_cloud_fc',
    /** AWS Elastic Compute Cloud. */
    AWS_EC2: 'aws_ec2',
    /** AWS Elastic Container Service. */
    AWS_ECS: 'aws_ecs',
    /** AWS Elastic Kubernetes Service. */
    AWS_EKS: 'aws_eks',
    /** AWS Lambda. */
    AWS_LAMBDA: 'aws_lambda',
    /** AWS Elastic Beanstalk. */
    AWS_ELASTIC_BEANSTALK: 'aws_elastic_beanstalk',
    /** Azure Virtual Machines. */
    AZURE_VM: 'azure_vm',
    /** Azure Container Instances. */
    AZURE_CONTAINER_INSTANCES: 'azure_container_instances',
    /** Azure Kubernetes Service. */
    AZURE_AKS: 'azure_aks',
    /** Azure Functions. */
    AZURE_FUNCTIONS: 'azure_functions',
    /** Azure App Service. */
    AZURE_APP_SERVICE: 'azure_app_service',
    /** Google Cloud Compute Engine (GCE). */
    GCP_COMPUTE_ENGINE: 'gcp_compute_engine',
    /** Google Cloud Run. */
    GCP_CLOUD_RUN: 'gcp_cloud_run',
    /** Google Cloud Kubernetes Engine (GKE). */
    GCP_KUBERNETES_ENGINE: 'gcp_kubernetes_engine',
    /** Google Cloud Functions (GCF). */
    GCP_CLOUD_FUNCTIONS: 'gcp_cloud_functions',
    /** Google Cloud App Engine (GAE). */
    GCP_APP_ENGINE: 'gcp_app_engine',
};
exports.AwsEcsLaunchtypeValues = {
    /** ec2. */
    EC2: 'ec2',
    /** fargate. */
    FARGATE: 'fargate',
};
exports.HostArchValues = {
    /** AMD64. */
    AMD64: 'amd64',
    /** ARM32. */
    ARM32: 'arm32',
    /** ARM64. */
    ARM64: 'arm64',
    /** Itanium. */
    IA64: 'ia64',
    /** 32-bit PowerPC. */
    PPC32: 'ppc32',
    /** 64-bit PowerPC. */
    PPC64: 'ppc64',
    /** 32-bit x86. */
    X86: 'x86',
};
exports.OsTypeValues = {
    /** Microsoft Windows. */
    WINDOWS: 'windows',
    /** Linux. */
    LINUX: 'linux',
    /** Apple Darwin. */
    DARWIN: 'darwin',
    /** FreeBSD. */
    FREEBSD: 'freebsd',
    /** NetBSD. */
    NETBSD: 'netbsd',
    /** OpenBSD. */
    OPENBSD: 'openbsd',
    /** DragonFly BSD. */
    DRAGONFLYBSD: 'dragonflybsd',
    /** HP-UX (Hewlett Packard Unix). */
    HPUX: 'hpux',
    /** AIX (Advanced Interactive eXecutive). */
    AIX: 'aix',
    /** Oracle Solaris. */
    SOLARIS: 'solaris',
    /** IBM z/OS. */
    Z_OS: 'z_os',
};
exports.TelemetrySdkLanguageValues = {
    /** cpp. */
    CPP: 'cpp',
    /** dotnet. */
    DOTNET: 'dotnet',
    /** erlang. */
    ERLANG: 'erlang',
    /** go. */
    GO: 'go',
    /** java. */
    JAVA: 'java',
    /** nodejs. */
    NODEJS: 'nodejs',
    /** php. */
    PHP: 'php',
    /** python. */
    PYTHON: 'python',
    /** ruby. */
    RUBY: 'ruby',
    /** webjs. */
    WEBJS: 'webjs',
};
//# sourceMappingURL=SemanticResourceAttributes.js.map

/***/ }),

/***/ 2834:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
__exportStar(__nccwpck_require__(5003), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 9943:
/***/ ((__unused_webpack_module, exports) => {


/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MessageTypeValues = exports.RpcGrpcStatusCodeValues = exports.MessagingOperationValues = exports.MessagingDestinationKindValues = exports.HttpFlavorValues = exports.NetHostConnectionSubtypeValues = exports.NetHostConnectionTypeValues = exports.NetTransportValues = exports.FaasInvokedProviderValues = exports.FaasDocumentOperationValues = exports.FaasTriggerValues = exports.DbCassandraConsistencyLevelValues = exports.DbSystemValues = exports.SemanticAttributes = void 0;
// DO NOT EDIT, this is an Auto-generated file from scripts/semconv/templates//templates/SemanticAttributes.ts.j2
exports.SemanticAttributes = {
    /**
     * The full invoked ARN as provided on the `Context` passed to the function (`Lambda-Runtime-Invoked-Function-Arn` header on the `/runtime/invocation/next` applicable).
     *
     * Note: This may be different from `faas.id` if an alias is involved.
     */
    AWS_LAMBDA_INVOKED_ARN: 'aws.lambda.invoked_arn',
    /**
     * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
     */
    DB_SYSTEM: 'db.system',
    /**
     * The connection string used to connect to the database. It is recommended to remove embedded credentials.
     */
    DB_CONNECTION_STRING: 'db.connection_string',
    /**
     * Username for accessing the database.
     */
    DB_USER: 'db.user',
    /**
     * The fully-qualified class name of the [Java Database Connectivity (JDBC)](https://docs.oracle.com/javase/8/docs/technotes/guides/jdbc/) driver used to connect.
     */
    DB_JDBC_DRIVER_CLASSNAME: 'db.jdbc.driver_classname',
    /**
     * If no [tech-specific attribute](#call-level-attributes-for-specific-technologies) is defined, this attribute is used to report the name of the database being accessed. For commands that switch the database, this should be set to the target database (even if the command fails).
     *
     * Note: In some SQL databases, the database name to be used is called &#34;schema name&#34;.
     */
    DB_NAME: 'db.name',
    /**
     * The database statement being executed.
     *
     * Note: The value may be sanitized to exclude sensitive information.
     */
    DB_STATEMENT: 'db.statement',
    /**
     * The name of the operation being executed, e.g. the [MongoDB command name](https://docs.mongodb.com/manual/reference/command/#database-operations) such as `findAndModify`, or the SQL keyword.
     *
     * Note: When setting this to an SQL keyword, it is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if the operation name is provided by the library being instrumented. If the SQL statement has an ambiguous operation, or performs more than one operation, this value may be omitted.
     */
    DB_OPERATION: 'db.operation',
    /**
     * The Microsoft SQL Server [instance name](https://docs.microsoft.com/en-us/sql/connect/jdbc/building-the-connection-url?view=sql-server-ver15) connecting to. This name is used to determine the port of a named instance.
     *
     * Note: If setting a `db.mssql.instance_name`, `net.peer.port` is no longer required (but still recommended if non-standard).
     */
    DB_MSSQL_INSTANCE_NAME: 'db.mssql.instance_name',
    /**
     * The name of the keyspace being accessed. To be used instead of the generic `db.name` attribute.
     */
    DB_CASSANDRA_KEYSPACE: 'db.cassandra.keyspace',
    /**
     * The fetch size used for paging, i.e. how many rows will be returned at once.
     */
    DB_CASSANDRA_PAGE_SIZE: 'db.cassandra.page_size',
    /**
     * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
     */
    DB_CASSANDRA_CONSISTENCY_LEVEL: 'db.cassandra.consistency_level',
    /**
     * The name of the primary table that the operation is acting upon, including the schema name (if applicable).
     *
     * Note: This mirrors the db.sql.table attribute but references cassandra rather than sql. It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
     */
    DB_CASSANDRA_TABLE: 'db.cassandra.table',
    /**
     * Whether or not the query is idempotent.
     */
    DB_CASSANDRA_IDEMPOTENCE: 'db.cassandra.idempotence',
    /**
     * The number of times a query was speculatively executed. Not set or `0` if the query was not executed speculatively.
     */
    DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT: 'db.cassandra.speculative_execution_count',
    /**
     * The ID of the coordinating node for a query.
     */
    DB_CASSANDRA_COORDINATOR_ID: 'db.cassandra.coordinator.id',
    /**
     * The data center of the coordinating node for a query.
     */
    DB_CASSANDRA_COORDINATOR_DC: 'db.cassandra.coordinator.dc',
    /**
     * The [HBase namespace](https://hbase.apache.org/book.html#_namespace) being accessed. To be used instead of the generic `db.name` attribute.
     */
    DB_HBASE_NAMESPACE: 'db.hbase.namespace',
    /**
     * The index of the database being accessed as used in the [`SELECT` command](https://redis.io/commands/select), provided as an integer. To be used instead of the generic `db.name` attribute.
     */
    DB_REDIS_DATABASE_INDEX: 'db.redis.database_index',
    /**
     * The collection being accessed within the database stated in `db.name`.
     */
    DB_MONGODB_COLLECTION: 'db.mongodb.collection',
    /**
     * The name of the primary table that the operation is acting upon, including the schema name (if applicable).
     *
     * Note: It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
     */
    DB_SQL_TABLE: 'db.sql.table',
    /**
     * The type of the exception (its fully-qualified class name, if applicable). The dynamic type of the exception should be preferred over the static type in languages that support it.
     */
    EXCEPTION_TYPE: 'exception.type',
    /**
     * The exception message.
     */
    EXCEPTION_MESSAGE: 'exception.message',
    /**
     * A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
     */
    EXCEPTION_STACKTRACE: 'exception.stacktrace',
    /**
    * SHOULD be set to true if the exception event is recorded at a point where it is known that the exception is escaping the scope of the span.
    *
    * Note: An exception is considered to have escaped (or left) the scope of a span,
  if that span is ended while the exception is still logically &#34;in flight&#34;.
  This may be actually &#34;in flight&#34; in some languages (e.g. if the exception
  is passed to a Context manager&#39;s `__exit__` method in Python) but will
  usually be caught at the point of recording the exception in most languages.
  
  It is usually not possible to determine at the point where an exception is thrown
  whether it will escape the scope of a span.
  However, it is trivial to know that an exception
  will escape, if one checks for an active exception just before ending the span,
  as done in the [example above](#exception-end-example).
  
  It follows that an exception may still escape the scope of the span
  even if the `exception.escaped` attribute was not set or set to false,
  since the event might have been recorded at a time where it was not
  clear whether the exception will escape.
    */
    EXCEPTION_ESCAPED: 'exception.escaped',
    /**
     * Type of the trigger on which the function is executed.
     */
    FAAS_TRIGGER: 'faas.trigger',
    /**
     * The execution ID of the current function execution.
     */
    FAAS_EXECUTION: 'faas.execution',
    /**
     * The name of the source on which the triggering operation was performed. For example, in Cloud Storage or S3 corresponds to the bucket name, and in Cosmos DB to the database name.
     */
    FAAS_DOCUMENT_COLLECTION: 'faas.document.collection',
    /**
     * Describes the type of the operation that was performed on the data.
     */
    FAAS_DOCUMENT_OPERATION: 'faas.document.operation',
    /**
     * A string containing the time when the data was accessed in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
     */
    FAAS_DOCUMENT_TIME: 'faas.document.time',
    /**
     * The document name/table subjected to the operation. For example, in Cloud Storage or S3 is the name of the file, and in Cosmos DB the table name.
     */
    FAAS_DOCUMENT_NAME: 'faas.document.name',
    /**
     * A string containing the function invocation time in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
     */
    FAAS_TIME: 'faas.time',
    /**
     * A string containing the schedule period as [Cron Expression](https://docs.oracle.com/cd/E12058_01/doc/doc.1014/e12030/cron_expressions.htm).
     */
    FAAS_CRON: 'faas.cron',
    /**
     * A boolean that is true if the serverless function is executed for the first time (aka cold-start).
     */
    FAAS_COLDSTART: 'faas.coldstart',
    /**
     * The name of the invoked function.
     *
     * Note: SHOULD be equal to the `faas.name` resource attribute of the invoked function.
     */
    FAAS_INVOKED_NAME: 'faas.invoked_name',
    /**
     * The cloud provider of the invoked function.
     *
     * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
     */
    FAAS_INVOKED_PROVIDER: 'faas.invoked_provider',
    /**
     * The cloud region of the invoked function.
     *
     * Note: SHOULD be equal to the `cloud.region` resource attribute of the invoked function.
     */
    FAAS_INVOKED_REGION: 'faas.invoked_region',
    /**
     * Transport protocol used. See note below.
     */
    NET_TRANSPORT: 'net.transport',
    /**
     * Remote address of the peer (dotted decimal for IPv4 or [RFC5952](https://tools.ietf.org/html/rfc5952) for IPv6).
     */
    NET_PEER_IP: 'net.peer.ip',
    /**
     * Remote port number.
     */
    NET_PEER_PORT: 'net.peer.port',
    /**
     * Remote hostname or similar, see note below.
     */
    NET_PEER_NAME: 'net.peer.name',
    /**
     * Like `net.peer.ip` but for the host IP. Useful in case of a multi-IP host.
     */
    NET_HOST_IP: 'net.host.ip',
    /**
     * Like `net.peer.port` but for the host port.
     */
    NET_HOST_PORT: 'net.host.port',
    /**
     * Local hostname or similar, see note below.
     */
    NET_HOST_NAME: 'net.host.name',
    /**
     * The internet connection type currently being used by the host.
     */
    NET_HOST_CONNECTION_TYPE: 'net.host.connection.type',
    /**
     * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
     */
    NET_HOST_CONNECTION_SUBTYPE: 'net.host.connection.subtype',
    /**
     * The name of the mobile carrier.
     */
    NET_HOST_CARRIER_NAME: 'net.host.carrier.name',
    /**
     * The mobile carrier country code.
     */
    NET_HOST_CARRIER_MCC: 'net.host.carrier.mcc',
    /**
     * The mobile carrier network code.
     */
    NET_HOST_CARRIER_MNC: 'net.host.carrier.mnc',
    /**
     * The ISO 3166-1 alpha-2 2-character country code associated with the mobile carrier network.
     */
    NET_HOST_CARRIER_ICC: 'net.host.carrier.icc',
    /**
     * The [`service.name`](../../resource/semantic_conventions/README.md#service) of the remote service. SHOULD be equal to the actual `service.name` resource attribute of the remote service if any.
     */
    PEER_SERVICE: 'peer.service',
    /**
     * Username or client_id extracted from the access token or [Authorization](https://tools.ietf.org/html/rfc7235#section-4.2) header in the inbound request from outside the system.
     */
    ENDUSER_ID: 'enduser.id',
    /**
     * Actual/assumed role the client is making the request under extracted from token or application security context.
     */
    ENDUSER_ROLE: 'enduser.role',
    /**
     * Scopes or granted authorities the client currently possesses extracted from token or application security context. The value would come from the scope associated with an [OAuth 2.0 Access Token](https://tools.ietf.org/html/rfc6749#section-3.3) or an attribute value in a [SAML 2.0 Assertion](http://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html).
     */
    ENDUSER_SCOPE: 'enduser.scope',
    /**
     * Current &#34;managed&#34; thread ID (as opposed to OS thread ID).
     */
    THREAD_ID: 'thread.id',
    /**
     * Current thread name.
     */
    THREAD_NAME: 'thread.name',
    /**
     * The method or function name, or equivalent (usually rightmost part of the code unit&#39;s name).
     */
    CODE_FUNCTION: 'code.function',
    /**
     * The &#34;namespace&#34; within which `code.function` is defined. Usually the qualified class or module name, such that `code.namespace` + some separator + `code.function` form a unique identifier for the code unit.
     */
    CODE_NAMESPACE: 'code.namespace',
    /**
     * The source code file name that identifies the code unit as uniquely as possible (preferably an absolute file path).
     */
    CODE_FILEPATH: 'code.filepath',
    /**
     * The line number in `code.filepath` best representing the operation. It SHOULD point within the code unit named in `code.function`.
     */
    CODE_LINENO: 'code.lineno',
    /**
     * HTTP request method.
     */
    HTTP_METHOD: 'http.method',
    /**
     * Full HTTP request URL in the form `scheme://host[:port]/path?query[#fragment]`. Usually the fragment is not transmitted over HTTP, but if it is known, it should be included nevertheless.
     *
     * Note: `http.url` MUST NOT contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case the attribute&#39;s value should be `https://www.example.com/`.
     */
    HTTP_URL: 'http.url',
    /**
     * The full request target as passed in a HTTP request line or equivalent.
     */
    HTTP_TARGET: 'http.target',
    /**
     * The value of the [HTTP host header](https://tools.ietf.org/html/rfc7230#section-5.4). An empty Host header should also be reported, see note.
     *
     * Note: When the header is present but empty the attribute SHOULD be set to the empty string. Note that this is a valid situation that is expected in certain cases, according the aforementioned [section of RFC 7230](https://tools.ietf.org/html/rfc7230#section-5.4). When the header is not set the attribute MUST NOT be set.
     */
    HTTP_HOST: 'http.host',
    /**
     * The URI scheme identifying the used protocol.
     */
    HTTP_SCHEME: 'http.scheme',
    /**
     * [HTTP response status code](https://tools.ietf.org/html/rfc7231#section-6).
     */
    HTTP_STATUS_CODE: 'http.status_code',
    /**
     * Kind of HTTP protocol used.
     *
     * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
     */
    HTTP_FLAVOR: 'http.flavor',
    /**
     * Value of the [HTTP User-Agent](https://tools.ietf.org/html/rfc7231#section-5.5.3) header sent by the client.
     */
    HTTP_USER_AGENT: 'http.user_agent',
    /**
     * The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://tools.ietf.org/html/rfc7230#section-3.3.2) header. For requests using transport encoding, this should be the compressed size.
     */
    HTTP_REQUEST_CONTENT_LENGTH: 'http.request_content_length',
    /**
     * The size of the uncompressed request payload body after transport decoding. Not set if transport encoding not used.
     */
    HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED: 'http.request_content_length_uncompressed',
    /**
     * The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://tools.ietf.org/html/rfc7230#section-3.3.2) header. For requests using transport encoding, this should be the compressed size.
     */
    HTTP_RESPONSE_CONTENT_LENGTH: 'http.response_content_length',
    /**
     * The size of the uncompressed response payload body after transport decoding. Not set if transport encoding not used.
     */
    HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED: 'http.response_content_length_uncompressed',
    /**
     * The primary server name of the matched virtual host. This should be obtained via configuration. If no such configuration can be obtained, this attribute MUST NOT be set ( `net.host.name` should be used instead).
     *
     * Note: `http.url` is usually not readily available on the server side but would have to be assembled in a cumbersome and sometimes lossy process from other information (see e.g. open-telemetry/opentelemetry-python/pull/148). It is thus preferred to supply the raw data that is available.
     */
    HTTP_SERVER_NAME: 'http.server_name',
    /**
     * The matched route (path template).
     */
    HTTP_ROUTE: 'http.route',
    /**
    * The IP address of the original client behind all proxies, if known (e.g. from [X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For)).
    *
    * Note: This is not necessarily the same as `net.peer.ip`, which would
  identify the network-level peer, which may be a proxy.
  
  This attribute should be set when a source of information different
  from the one used for `net.peer.ip`, is available even if that other
  source just confirms the same value as `net.peer.ip`.
  Rationale: For `net.peer.ip`, one typically does not know if it
  comes from a proxy, reverse proxy, or the actual client. Setting
  `http.client_ip` when it&#39;s the same as `net.peer.ip` means that
  one is at least somewhat confident that the address is not that of
  the closest proxy.
    */
    HTTP_CLIENT_IP: 'http.client_ip',
    /**
     * The keys in the `RequestItems` object field.
     */
    AWS_DYNAMODB_TABLE_NAMES: 'aws.dynamodb.table_names',
    /**
     * The JSON-serialized value of each item in the `ConsumedCapacity` response field.
     */
    AWS_DYNAMODB_CONSUMED_CAPACITY: 'aws.dynamodb.consumed_capacity',
    /**
     * The JSON-serialized value of the `ItemCollectionMetrics` response field.
     */
    AWS_DYNAMODB_ITEM_COLLECTION_METRICS: 'aws.dynamodb.item_collection_metrics',
    /**
     * The value of the `ProvisionedThroughput.ReadCapacityUnits` request parameter.
     */
    AWS_DYNAMODB_PROVISIONED_READ_CAPACITY: 'aws.dynamodb.provisioned_read_capacity',
    /**
     * The value of the `ProvisionedThroughput.WriteCapacityUnits` request parameter.
     */
    AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY: 'aws.dynamodb.provisioned_write_capacity',
    /**
     * The value of the `ConsistentRead` request parameter.
     */
    AWS_DYNAMODB_CONSISTENT_READ: 'aws.dynamodb.consistent_read',
    /**
     * The value of the `ProjectionExpression` request parameter.
     */
    AWS_DYNAMODB_PROJECTION: 'aws.dynamodb.projection',
    /**
     * The value of the `Limit` request parameter.
     */
    AWS_DYNAMODB_LIMIT: 'aws.dynamodb.limit',
    /**
     * The value of the `AttributesToGet` request parameter.
     */
    AWS_DYNAMODB_ATTRIBUTES_TO_GET: 'aws.dynamodb.attributes_to_get',
    /**
     * The value of the `IndexName` request parameter.
     */
    AWS_DYNAMODB_INDEX_NAME: 'aws.dynamodb.index_name',
    /**
     * The value of the `Select` request parameter.
     */
    AWS_DYNAMODB_SELECT: 'aws.dynamodb.select',
    /**
     * The JSON-serialized value of each item of the `GlobalSecondaryIndexes` request field.
     */
    AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES: 'aws.dynamodb.global_secondary_indexes',
    /**
     * The JSON-serialized value of each item of the `LocalSecondaryIndexes` request field.
     */
    AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES: 'aws.dynamodb.local_secondary_indexes',
    /**
     * The value of the `ExclusiveStartTableName` request parameter.
     */
    AWS_DYNAMODB_EXCLUSIVE_START_TABLE: 'aws.dynamodb.exclusive_start_table',
    /**
     * The the number of items in the `TableNames` response parameter.
     */
    AWS_DYNAMODB_TABLE_COUNT: 'aws.dynamodb.table_count',
    /**
     * The value of the `ScanIndexForward` request parameter.
     */
    AWS_DYNAMODB_SCAN_FORWARD: 'aws.dynamodb.scan_forward',
    /**
     * The value of the `Segment` request parameter.
     */
    AWS_DYNAMODB_SEGMENT: 'aws.dynamodb.segment',
    /**
     * The value of the `TotalSegments` request parameter.
     */
    AWS_DYNAMODB_TOTAL_SEGMENTS: 'aws.dynamodb.total_segments',
    /**
     * The value of the `Count` response parameter.
     */
    AWS_DYNAMODB_COUNT: 'aws.dynamodb.count',
    /**
     * The value of the `ScannedCount` response parameter.
     */
    AWS_DYNAMODB_SCANNED_COUNT: 'aws.dynamodb.scanned_count',
    /**
     * The JSON-serialized value of each item in the `AttributeDefinitions` request field.
     */
    AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS: 'aws.dynamodb.attribute_definitions',
    /**
     * The JSON-serialized value of each item in the the `GlobalSecondaryIndexUpdates` request field.
     */
    AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES: 'aws.dynamodb.global_secondary_index_updates',
    /**
     * A string identifying the messaging system.
     */
    MESSAGING_SYSTEM: 'messaging.system',
    /**
     * The message destination name. This might be equal to the span name but is required nevertheless.
     */
    MESSAGING_DESTINATION: 'messaging.destination',
    /**
     * The kind of message destination.
     */
    MESSAGING_DESTINATION_KIND: 'messaging.destination_kind',
    /**
     * A boolean that is true if the message destination is temporary.
     */
    MESSAGING_TEMP_DESTINATION: 'messaging.temp_destination',
    /**
     * The name of the transport protocol.
     */
    MESSAGING_PROTOCOL: 'messaging.protocol',
    /**
     * The version of the transport protocol.
     */
    MESSAGING_PROTOCOL_VERSION: 'messaging.protocol_version',
    /**
     * Connection string.
     */
    MESSAGING_URL: 'messaging.url',
    /**
     * A value used by the messaging system as an identifier for the message, represented as a string.
     */
    MESSAGING_MESSAGE_ID: 'messaging.message_id',
    /**
     * The [conversation ID](#conversations) identifying the conversation to which the message belongs, represented as a string. Sometimes called &#34;Correlation ID&#34;.
     */
    MESSAGING_CONVERSATION_ID: 'messaging.conversation_id',
    /**
     * The (uncompressed) size of the message payload in bytes. Also use this attribute if it is unknown whether the compressed or uncompressed payload size is reported.
     */
    MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES: 'messaging.message_payload_size_bytes',
    /**
     * The compressed size of the message payload in bytes.
     */
    MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES: 'messaging.message_payload_compressed_size_bytes',
    /**
     * A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
     */
    MESSAGING_OPERATION: 'messaging.operation',
    /**
     * The identifier for the consumer receiving a message. For Kafka, set it to `{messaging.kafka.consumer_group} - {messaging.kafka.client_id}`, if both are present, or only `messaging.kafka.consumer_group`. For brokers, such as RabbitMQ and Artemis, set it to the `client_id` of the client consuming the message.
     */
    MESSAGING_CONSUMER_ID: 'messaging.consumer_id',
    /**
     * RabbitMQ message routing key.
     */
    MESSAGING_RABBITMQ_ROUTING_KEY: 'messaging.rabbitmq.routing_key',
    /**
     * Message keys in Kafka are used for grouping alike messages to ensure they&#39;re processed on the same partition. They differ from `messaging.message_id` in that they&#39;re not unique. If the key is `null`, the attribute MUST NOT be set.
     *
     * Note: If the key type is not string, it&#39;s string representation has to be supplied for the attribute. If the key has no unambiguous, canonical string form, don&#39;t include its value.
     */
    MESSAGING_KAFKA_MESSAGE_KEY: 'messaging.kafka.message_key',
    /**
     * Name of the Kafka Consumer Group that is handling the message. Only applies to consumers, not producers.
     */
    MESSAGING_KAFKA_CONSUMER_GROUP: 'messaging.kafka.consumer_group',
    /**
     * Client Id for the Consumer or Producer that is handling the message.
     */
    MESSAGING_KAFKA_CLIENT_ID: 'messaging.kafka.client_id',
    /**
     * Partition the message is sent to.
     */
    MESSAGING_KAFKA_PARTITION: 'messaging.kafka.partition',
    /**
     * A boolean that is true if the message is a tombstone.
     */
    MESSAGING_KAFKA_TOMBSTONE: 'messaging.kafka.tombstone',
    /**
     * A string identifying the remoting system.
     */
    RPC_SYSTEM: 'rpc.system',
    /**
     * The full (logical) name of the service being called, including its package name, if applicable.
     *
     * Note: This is the logical name of the service from the RPC interface perspective, which can be different from the name of any implementing class. The `code.namespace` attribute may be used to store the latter (despite the attribute name, it may include a class name; e.g., class with method actually executing the call on the server side, RPC client stub class on the client side).
     */
    RPC_SERVICE: 'rpc.service',
    /**
     * The name of the (logical) method being called, must be equal to the $method part in the span name.
     *
     * Note: This is the logical name of the method from the RPC interface perspective, which can be different from the name of any implementing method/function. The `code.function` attribute may be used to store the latter (e.g., method actually executing the call on the server side, RPC client stub method on the client side).
     */
    RPC_METHOD: 'rpc.method',
    /**
     * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
     */
    RPC_GRPC_STATUS_CODE: 'rpc.grpc.status_code',
    /**
     * Protocol version as in `jsonrpc` property of request/response. Since JSON-RPC 1.0 does not specify this, the value can be omitted.
     */
    RPC_JSONRPC_VERSION: 'rpc.jsonrpc.version',
    /**
     * `id` property of request or response. Since protocol allows id to be int, string, `null` or missing (for notifications), value is expected to be cast to string for simplicity. Use empty string in case of `null` value. Omit entirely if this is a notification.
     */
    RPC_JSONRPC_REQUEST_ID: 'rpc.jsonrpc.request_id',
    /**
     * `error.code` property of response if it is an error response.
     */
    RPC_JSONRPC_ERROR_CODE: 'rpc.jsonrpc.error_code',
    /**
     * `error.message` property of response if it is an error response.
     */
    RPC_JSONRPC_ERROR_MESSAGE: 'rpc.jsonrpc.error_message',
    /**
     * Whether this is a received or sent message.
     */
    MESSAGE_TYPE: 'message.type',
    /**
     * MUST be calculated as two different counters starting from `1` one for sent messages and one for received message.
     *
     * Note: This way we guarantee that the values will be consistent between different implementations.
     */
    MESSAGE_ID: 'message.id',
    /**
     * Compressed size of the message in bytes.
     */
    MESSAGE_COMPRESSED_SIZE: 'message.compressed_size',
    /**
     * Uncompressed size of the message in bytes.
     */
    MESSAGE_UNCOMPRESSED_SIZE: 'message.uncompressed_size',
};
exports.DbSystemValues = {
    /** Some other SQL database. Fallback only. See notes. */
    OTHER_SQL: 'other_sql',
    /** Microsoft SQL Server. */
    MSSQL: 'mssql',
    /** MySQL. */
    MYSQL: 'mysql',
    /** Oracle Database. */
    ORACLE: 'oracle',
    /** IBM Db2. */
    DB2: 'db2',
    /** PostgreSQL. */
    POSTGRESQL: 'postgresql',
    /** Amazon Redshift. */
    REDSHIFT: 'redshift',
    /** Apache Hive. */
    HIVE: 'hive',
    /** Cloudscape. */
    CLOUDSCAPE: 'cloudscape',
    /** HyperSQL DataBase. */
    HSQLDB: 'hsqldb',
    /** Progress Database. */
    PROGRESS: 'progress',
    /** SAP MaxDB. */
    MAXDB: 'maxdb',
    /** SAP HANA. */
    HANADB: 'hanadb',
    /** Ingres. */
    INGRES: 'ingres',
    /** FirstSQL. */
    FIRSTSQL: 'firstsql',
    /** EnterpriseDB. */
    EDB: 'edb',
    /** InterSystems Caché. */
    CACHE: 'cache',
    /** Adabas (Adaptable Database System). */
    ADABAS: 'adabas',
    /** Firebird. */
    FIREBIRD: 'firebird',
    /** Apache Derby. */
    DERBY: 'derby',
    /** FileMaker. */
    FILEMAKER: 'filemaker',
    /** Informix. */
    INFORMIX: 'informix',
    /** InstantDB. */
    INSTANTDB: 'instantdb',
    /** InterBase. */
    INTERBASE: 'interbase',
    /** MariaDB. */
    MARIADB: 'mariadb',
    /** Netezza. */
    NETEZZA: 'netezza',
    /** Pervasive PSQL. */
    PERVASIVE: 'pervasive',
    /** PointBase. */
    POINTBASE: 'pointbase',
    /** SQLite. */
    SQLITE: 'sqlite',
    /** Sybase. */
    SYBASE: 'sybase',
    /** Teradata. */
    TERADATA: 'teradata',
    /** Vertica. */
    VERTICA: 'vertica',
    /** H2. */
    H2: 'h2',
    /** ColdFusion IMQ. */
    COLDFUSION: 'coldfusion',
    /** Apache Cassandra. */
    CASSANDRA: 'cassandra',
    /** Apache HBase. */
    HBASE: 'hbase',
    /** MongoDB. */
    MONGODB: 'mongodb',
    /** Redis. */
    REDIS: 'redis',
    /** Couchbase. */
    COUCHBASE: 'couchbase',
    /** CouchDB. */
    COUCHDB: 'couchdb',
    /** Microsoft Azure Cosmos DB. */
    COSMOSDB: 'cosmosdb',
    /** Amazon DynamoDB. */
    DYNAMODB: 'dynamodb',
    /** Neo4j. */
    NEO4J: 'neo4j',
    /** Apache Geode. */
    GEODE: 'geode',
    /** Elasticsearch. */
    ELASTICSEARCH: 'elasticsearch',
    /** Memcached. */
    MEMCACHED: 'memcached',
    /** CockroachDB. */
    COCKROACHDB: 'cockroachdb',
};
exports.DbCassandraConsistencyLevelValues = {
    /** all. */
    ALL: 'all',
    /** each_quorum. */
    EACH_QUORUM: 'each_quorum',
    /** quorum. */
    QUORUM: 'quorum',
    /** local_quorum. */
    LOCAL_QUORUM: 'local_quorum',
    /** one. */
    ONE: 'one',
    /** two. */
    TWO: 'two',
    /** three. */
    THREE: 'three',
    /** local_one. */
    LOCAL_ONE: 'local_one',
    /** any. */
    ANY: 'any',
    /** serial. */
    SERIAL: 'serial',
    /** local_serial. */
    LOCAL_SERIAL: 'local_serial',
};
exports.FaasTriggerValues = {
    /** A response to some data source operation such as a database or filesystem read/write. */
    DATASOURCE: 'datasource',
    /** To provide an answer to an inbound HTTP request. */
    HTTP: 'http',
    /** A function is set to be executed when messages are sent to a messaging system. */
    PUBSUB: 'pubsub',
    /** A function is scheduled to be executed regularly. */
    TIMER: 'timer',
    /** If none of the others apply. */
    OTHER: 'other',
};
exports.FaasDocumentOperationValues = {
    /** When a new object is created. */
    INSERT: 'insert',
    /** When an object is modified. */
    EDIT: 'edit',
    /** When an object is deleted. */
    DELETE: 'delete',
};
exports.FaasInvokedProviderValues = {
    /** Alibaba Cloud. */
    ALIBABA_CLOUD: 'alibaba_cloud',
    /** Amazon Web Services. */
    AWS: 'aws',
    /** Microsoft Azure. */
    AZURE: 'azure',
    /** Google Cloud Platform. */
    GCP: 'gcp',
};
exports.NetTransportValues = {
    /** ip_tcp. */
    IP_TCP: 'ip_tcp',
    /** ip_udp. */
    IP_UDP: 'ip_udp',
    /** Another IP-based protocol. */
    IP: 'ip',
    /** Unix Domain socket. See below. */
    UNIX: 'unix',
    /** Named or anonymous pipe. See note below. */
    PIPE: 'pipe',
    /** In-process communication. */
    INPROC: 'inproc',
    /** Something else (non IP-based). */
    OTHER: 'other',
};
exports.NetHostConnectionTypeValues = {
    /** wifi. */
    WIFI: 'wifi',
    /** wired. */
    WIRED: 'wired',
    /** cell. */
    CELL: 'cell',
    /** unavailable. */
    UNAVAILABLE: 'unavailable',
    /** unknown. */
    UNKNOWN: 'unknown',
};
exports.NetHostConnectionSubtypeValues = {
    /** GPRS. */
    GPRS: 'gprs',
    /** EDGE. */
    EDGE: 'edge',
    /** UMTS. */
    UMTS: 'umts',
    /** CDMA. */
    CDMA: 'cdma',
    /** EVDO Rel. 0. */
    EVDO_0: 'evdo_0',
    /** EVDO Rev. A. */
    EVDO_A: 'evdo_a',
    /** CDMA2000 1XRTT. */
    CDMA2000_1XRTT: 'cdma2000_1xrtt',
    /** HSDPA. */
    HSDPA: 'hsdpa',
    /** HSUPA. */
    HSUPA: 'hsupa',
    /** HSPA. */
    HSPA: 'hspa',
    /** IDEN. */
    IDEN: 'iden',
    /** EVDO Rev. B. */
    EVDO_B: 'evdo_b',
    /** LTE. */
    LTE: 'lte',
    /** EHRPD. */
    EHRPD: 'ehrpd',
    /** HSPAP. */
    HSPAP: 'hspap',
    /** GSM. */
    GSM: 'gsm',
    /** TD-SCDMA. */
    TD_SCDMA: 'td_scdma',
    /** IWLAN. */
    IWLAN: 'iwlan',
    /** 5G NR (New Radio). */
    NR: 'nr',
    /** 5G NRNSA (New Radio Non-Standalone). */
    NRNSA: 'nrnsa',
    /** LTE CA. */
    LTE_CA: 'lte_ca',
};
exports.HttpFlavorValues = {
    /** HTTP 1.0. */
    HTTP_1_0: '1.0',
    /** HTTP 1.1. */
    HTTP_1_1: '1.1',
    /** HTTP 2. */
    HTTP_2_0: '2.0',
    /** SPDY protocol. */
    SPDY: 'SPDY',
    /** QUIC protocol. */
    QUIC: 'QUIC',
};
exports.MessagingDestinationKindValues = {
    /** A message sent to a queue. */
    QUEUE: 'queue',
    /** A message sent to a topic. */
    TOPIC: 'topic',
};
exports.MessagingOperationValues = {
    /** receive. */
    RECEIVE: 'receive',
    /** process. */
    PROCESS: 'process',
};
exports.RpcGrpcStatusCodeValues = {
    /** OK. */
    OK: 0,
    /** CANCELLED. */
    CANCELLED: 1,
    /** UNKNOWN. */
    UNKNOWN: 2,
    /** INVALID_ARGUMENT. */
    INVALID_ARGUMENT: 3,
    /** DEADLINE_EXCEEDED. */
    DEADLINE_EXCEEDED: 4,
    /** NOT_FOUND. */
    NOT_FOUND: 5,
    /** ALREADY_EXISTS. */
    ALREADY_EXISTS: 6,
    /** PERMISSION_DENIED. */
    PERMISSION_DENIED: 7,
    /** RESOURCE_EXHAUSTED. */
    RESOURCE_EXHAUSTED: 8,
    /** FAILED_PRECONDITION. */
    FAILED_PRECONDITION: 9,
    /** ABORTED. */
    ABORTED: 10,
    /** OUT_OF_RANGE. */
    OUT_OF_RANGE: 11,
    /** UNIMPLEMENTED. */
    UNIMPLEMENTED: 12,
    /** INTERNAL. */
    INTERNAL: 13,
    /** UNAVAILABLE. */
    UNAVAILABLE: 14,
    /** DATA_LOSS. */
    DATA_LOSS: 15,
    /** UNAUTHENTICATED. */
    UNAUTHENTICATED: 16,
};
exports.MessageTypeValues = {
    /** sent. */
    SENT: 'SENT',
    /** received. */
    RECEIVED: 'RECEIVED',
};
//# sourceMappingURL=SemanticAttributes.js.map

/***/ }),

/***/ 5836:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
__exportStar(__nccwpck_require__(9943), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 2081:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("child_process");

/***/ }),

/***/ 7147:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("fs");

/***/ }),

/***/ 3685:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("http");

/***/ }),

/***/ 2037:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("os");

/***/ }),

/***/ 4074:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("perf_hooks");

/***/ }),

/***/ 7282:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("process");

/***/ }),

/***/ 7310:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("url");

/***/ }),

/***/ 3837:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("util");

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __nccwpck_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	var threw = true;
/******/ 	try {
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 		threw = false;
/******/ 	} finally {
/******/ 		if(threw) delete __webpack_module_cache__[moduleId];
/******/ 	}
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {

// EXTERNAL MODULE: external "perf_hooks"
var external_perf_hooks_ = __nccwpck_require__(4074);
;// CONCATENATED MODULE: ./src/metrics/const.ts
const TMP_VAR_NAME = "AUTOMETRICS_START";
const TMP_VAR_GITHUB_NAME = `STATE_${TMP_VAR_NAME}`;
const HISTOGRAM_NAME = "workflow.jobs.duration";
const COUNTER_NAME = "workflow.jobs.count";

;// CONCATENATED MODULE: ./src/metrics/github.ts
function getBuckets() {
    let buckets = process.env.INPUT_BUCKETS;
    if (!buckets)
        return;
    if (buckets.startsWith("[") && buckets.endsWith("]")) {
        buckets = buckets.slice(1, -1);
    }
    return buckets
        .trim()
        .split(",")
        .map((b) => {
        const n = Number(b);
        if (isNaN(n)) {
            throw new Error(`Invalid bucket value: ${b}`);
        }
        return n;
    });
}
function getMetricsUrl() {
    const gateway = process.env.INPUT_PUSHGATEWAY;
    if (!gateway) {
        throw new Error("Pushgateway URL is required");
    }
    const parsed = new URL(gateway);
    const type = process.env.INPUT_GATEWAYTYPE;
    if (type === "prometheus") {
        const labels = getLabels();
        parsed.pathname = `/metrics/job/${labels.job}/workflow/${labels.workflow}`;
    }
    else if (parsed.pathname !== "/metrics") {
        parsed.pathname = "/metrics";
    }
    console.log(`Pushing metrics to ${parsed.toString()}`);
    return parsed.toString();
}
function getLabels() {
    return {
        workflow: process.env.GITHUB_WORKFLOW,
        job: process.env.GITHUB_JOB,
    };
}

// EXTERNAL MODULE: ./node_modules/@opentelemetry/exporter-prometheus/build/src/index.js
var src = __nccwpck_require__(3976);
// EXTERNAL MODULE: ./node_modules/@opentelemetry/sdk-metrics/build/src/index.js
var build_src = __nccwpck_require__(7349);
;// CONCATENATED MODULE: ./src/metrics/otel.ts




function init(buckets) {
    const exporter = new build_src.PeriodicExportingMetricReader({
        // 0 - using delta aggregation temporality setting
        // to ensure data submitted to the gateway is accurate
        exporter: new build_src.InMemoryMetricExporter(build_src.AggregationTemporality.DELTA),
    });
    const histogramView = new build_src.View({
        aggregation: buckets
            ? new build_src.ExplicitBucketHistogramAggregation(buckets)
            : new build_src.HistogramAggregation(),
        instrumentName: HISTOGRAM_NAME,
        instrumentType: build_src.InstrumentType.HISTOGRAM,
    });
    const autometricsMeterProvider = new build_src.MeterProvider({
        views: [histogramView],
        readers: [exporter],
    });
    const meter = autometricsMeterProvider.getMeter("autometrics");
    const histogram = meter.createHistogram(HISTOGRAM_NAME, {
        unit: "seconds",
    });
    const counter = meter.createCounter(COUNTER_NAME);
    return { exporter, histogram, counter };
}
async function pushToGateway(exporter) {
    const exporterResponse = await exporter.collect();
    const serialized = new src.PrometheusSerializer().serialize(exporterResponse.resourceMetrics);
    const url = getMetricsUrl();
    const response = await fetch(url, {
        method: "POST",
        body: serialized,
    });
    if (response.status < 200 || response.status >= 300) {
        const text = await response.text();
        throw new Error(`Failed to push to gateway: ${response.status} ${text}`);
    }
    console.log("Metrics successfully pushed to gateway");
    // we flush the metrics at the end of the submission to ensure the data is not repeated
    await exporter.forceFlush();
}

;// CONCATENATED MODULE: ./src/metrics/index.ts


const buckets = getBuckets();
const { exporter, histogram, counter } = init(buckets);
function trackJob(duration) {
    const labels = getLabels();
    histogram.record(duration, labels);
    counter.add(1, labels);
    pushToGateway(exporter);
}

;// CONCATENATED MODULE: ./src/post.ts



const value = process.env[TMP_VAR_GITHUB_NAME];
if (!value) {
    throw new Error("Could not retrieve start timestamp from previous stage");
}
const start = Number(value);
const duration = external_perf_hooks_.performance.now() - start;
// we track the job duration in seconds
trackJob(duration / 1000);

})();

