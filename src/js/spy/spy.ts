// not this function is injected into the inspected window
// the current attempt is to extend $apprt by a
// $spy field to get access to the current state
export function createSpy() {
    var $system = Symbol("$system");
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
        let cpRuntime;
        const spy = {
            get installed() {
                return true;
            },
            get ready(): boolean {
                return !!apprt[$system];
            },
            get bundles(): BundleInfo[] {
                if (!spy.ready) {
                    return [];
                }
                return apprt[$system].getBundleContext().getBundles().map(toBundleInfo);
            },
            get services(): ServiceInfo[] {
                if (!spy.ready) {
                    return [];
                }
                return apprt[$system].getBundleContext().getServiceReferences().map(toServiceInfo);
            },
            get components(): ComponentInfo[] {
                if (!spy.ready) {
                    return [];
                }
                if (!cpRuntime) {
                    cpRuntime = lookupCPRuntime(apprt[$system].getBundleContext());
                }
                return cpRuntime.getAllComponents().map(toComponentInfo);
            },
            startBundle(id) {
                const bundle = apprt[$system].getBundleContext().getBundle(id);
                bundle.start();
                return bundle.getStateTitle();
            },
            stopBundle(id) {
                const bundle = apprt[$system].getBundleContext().getBundle(id);
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
                apprt[$system] = framework;
                callback && callback(framework);
            }, errCallback);
        }
    }

    function lookupCPRuntime(bctx) {
        return bctx.getService(bctx.getServiceReferences("ct.framework.api.ComponentRuntime")[0]);
    }

    function toBundleInfo(bundle: any): BundleInfo {
        return {
            id: bundle.getId(),
            name: bundle.getSymbolicName(),
            version: bundle.getVersion().version,
            state: bundle.getStateTitle(),
            location: bundle.getLocation()
        };
    }

    function toServiceInfo(ref: any): ServiceInfo {
        return {
            id: ref.getProperty("Service-Id"),
            provide: ref.getProperty("objectClass").join(";"),
            provides: ref.getProperty("objectClass"),
            ranking: ref.getProperty("Service-Ranking"),
            bundle: ref.getBundle().getSymbolicName(),
            component: ref.getProperty("Component-Name"),
            properties: ref.getProperties()
        };
    }

    function toComponentInfo(component): ComponentInfo {
        return {
            id: component.getId(),
            name: component.getName(),
            state: component.isActive() ? "ACTIVE" : component.isEnabled() ? "INACTIVE" : "DISABLED",
            log: component.log,
            instances: component.getComponentContextCount(),
            bundleName: component.getBundle().getSymbolicName(),
            properties: component.getProperties().asMap()
        };
    }
}

interface BundleInfo {
    id: number;
    name: string;
    version: string;
    state: string;
    location: string;
}

interface ServiceInfo {
    id: number;
    provides: string[];
    provide: string,
    ranking: number;
    bundle: string;
    component: string;
    properties: Record<string, any>;
}

interface ComponentInfo {
    id: number;
    name: string;
    state: string;
    log: string[];
    instances: number;
    bundleName: string;
    properties: Record<string, any>;
}
