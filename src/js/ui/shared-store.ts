export function createStore() {
    const self = {
        state: {
            isAppRtApplication: false,
            systemBundleAvailable: false,
            bundles: []
        },

        resolveBundles() {
            this.invoke("$apprt.$spy.bundles", (state, result) => {
                state.bundles = result;
            });
        },

        startOrStopBundle(bundle) {
            const state = bundle.state;
            const method = state === "ACTIVE" ? "stopBundle" : "startBundle";
            this.invoke(`$apprt.$spy.${method}(${bundle.id})`, () => {
                setTimeout(() => this.resolveBundles(), 200);
            });
        },

        invoke(method, cb) {
            invoke(self, method, cb);
        },

        resolveApprt() {
            function lookup() {
                if (!self.state.isAppRtApplication) {
                    self.invoke(
                        "$apprt.$spy.installed", (state, result) => {
                            state.isAppRtApplication = !!result;
                        }
                    );
                }
                if (!self.state.systemBundleAvailable) {
                    self.invoke("$apprt.$spy.ready",
                        (state, result) => {
                            self.state.systemBundleAvailable = !!result;
                            setTimeout(lookup, 300);
                        }
                    );
                }
            }
            lookup();
        }
    }
    return self;
}


function invoke(store, method, callback) {
    chrome.devtools.inspectedWindow.eval(
        method,
        (result, isException) => {
            callback.call(store, store.state, result);
        }
    );
}
