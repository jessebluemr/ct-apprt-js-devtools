// not this function is injected into the inspected window
// the current attempt is to extend $apprt by a
// $spy field to get access to the current state
export function createSpy() {
    var _apprt;
    Object.defineProperty(window, "$apprt", {
        set(val) {
            _apprt = val;
            if (val) {
                wrap(_apprt);
            }
        },
        get() {
            return _apprt;
        }
    });
    function wrap(apprt) {
        wrapStartApp(apprt);
        const spy = {
            get installed() {
                return true;
            },
            get ready(): boolean {
                return !!apprt.$system;
            },
            get bundles(): BundleInfo[] {
                if (!spy.ready) {
                    return [];
                }
                return apprt.$system.getBundleContext().getBundles().map((b) => {
                    return {
                        id: b.getId(),
                        name: b.getSymbolicName(),
                        version: b.getVersion().version,
                        state: b.getStateTitle()
                    };
                });
            },
            startBundle(id) {
                const bundle = apprt.$system.getBundleContext().getBundle(id);
                bundle.start();
                return bundle.getStateTitle();
            },
            stopBundle(id) {
                const bundle = apprt.$system.getBundleContext().getBundle(id);
                bundle.stop();
                return bundle.getStateTitle();
            }
        }
        apprt.$spy = spy;
    }

    function wrapStartApp(apprt) {
        var org_start = apprt.startApp;
        apprt.startApp = function (options, callback, errCallback) {
            options = options || {};
            options.enableStatistics = true;
            org_start(options, (framework) => {
                apprt.$system = framework;
                callback && callback(framework);
            }, errCallback);
        }
    }
}

interface BundleInfo {
    name: string,
    version: string,
    state: string
}
