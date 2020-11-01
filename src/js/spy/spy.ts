// not this function is injected into the inspected window
// the current attempt is to extend $apprt by a

// $spy field to get access to the current state
export function createSpy() {
    const _apprt = Symbol("_apprt");
    const _system = Symbol("_system");
    const _cpRuntime = Symbol("_cpRuntime");

    function declareGlobalInstances() {
        const spy = createSpyInstance();
        let realApprt;
        Object.defineProperty(window, "$apprt", {
            set(val) {
                realApprt = val;
                if (realApprt) {
                    wrapAppRtInstance(realApprt, spy);
                }
            },
            get() {
                return realApprt;
            }
        });
        Object.defineProperty(window, "$$apprtDevToolsSpy", {
            value: spy,
            writable: false
        });
    }

    function wrapAppRtInstance(apprt, spy) {
        spy[_apprt] = apprt;
        const org_start = apprt.startApp;
        const org_load = apprt.load;
        let startAppCalled = false;
        apprt.startApp = function (options, callback, errCallback) {
            startAppCalled = true;
            options = options || {};
            options.enableStatistics = true;
            org_start(options, (framework) => {
                spy[_system] = framework;
                callback && callback(framework);
            }, errCallback);
        }
        apprt.load = function (initCallback, doNotLoadLauncher) {
            if (startAppCalled) {
                return org_load(initCallback, doNotLoadLauncher);
            }
            console.warn("[apprt.devtools] Please consider to use '$apprt.startApp' instead of '$apprt.load'.");
            if (doNotLoadLauncher) {
                // if launcher not loaded then there is nothing to wrap
                return org_load(initCallback, doNotLoadLauncher);
            }
            // old entry point, we need to control the creation of the Launcher class
            return org_load(function (Launcher) {
                initCallback(function (options) {
                    options = options || {};
                    options.enableStatistics = true;
                    const launcher = new Launcher(options);
                    const org_launch = launcher.launch;
                    launcher.launch = function () {
                        return org_launch.apply(launcher, arguments)
                            .then(function (framework) {
                                spy[_system] = framework;
                                return framework;
                            });
                    }
                    return launcher;
                });
            }, doNotLoadLauncher);
        }
    }

    function createSpyInstance() {
        const spy = {
            get installed() {
                return !!spy[_apprt];
            },
            get ready(): boolean {
                return !!spy[_system];
            },
            get systemInfo(): SystemInfo {
                return detectSystemInfo(spy);
            },
            get appInfo(): AppInfo {
                return detectAppInfo(spy);
            },
            get bundles(): BundleInfo[] {
                if (!spy.ready) {
                    return [];
                }
                return spy[_system].getBundleContext().getBundles().map(toBundleInfo);
            },
            get services(): ServiceInfo[] {
                if (!spy.ready) {
                    return [];
                }
                return spy[_system].getBundleContext().getServiceReferences().map(toServiceInfo);
            },
            get components(): ComponentInfo[] {
                if (!spy.ready) {
                    return [];
                }
                if (!spy[_cpRuntime]) {
                    spy[_cpRuntime] = lookupCPRuntime(spy[_system].getBundleContext());
                }
                return spy[_cpRuntime].getAllComponents().map(toComponentInfo);
            },
            get statisticData(): Record<string, any> {
                if (!spy.ready) {
                    return {};
                }
                return spy[_system].getBundleContext().getStatistics()?.data?.() ?? {};
            },
            startBundle(id) {
                const bundle = spy[_system].getBundleContext().getBundle(id);
                bundle.start();
                return bundle.getStateTitle();
            },
            stopBundle(id) {
                const bundle = spy[_system].getBundleContext().getBundle(id);
                bundle.stop();
                return bundle.getStateTitle();
            }
        }
        return spy;
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

    function detectAppInfo(spy: any): AppInfo {
        if (!spy[_system]) {
            return {
                name: "",
                config: {}
            };
        }
        const systemBundle = spy[_system];
        return {
            name: systemBundle.getBundleContext().getProperty("Application-Name"),
            config: systemBundle.getBundleContext().getProperty("Application-Config")
        };

    }

    function detectSystemInfo(spy: any): SystemInfo {
        if (!spy.installed) {
            return toSystemInfo();
        }
        const config: any = lookupDojoConfig();
        const bootVersion = detectBootVersion();
        let version = "";
        if (require) {
            const packs = (require as any).packs || {};
            for (const n of Object.keys(packs)) {
                if (n == "apprt") {
                    version = packs[n].version || "";
                    break;
                }
            }
        }

        if (!version && spy[_system]) {
            // framework version
            version = spy[_system].getVersion().version
        }

        return toSystemInfo({
            version: version,
            bootVersion: bootVersion,
            registryUrl: config?.ct?.jsregistry ?? "",
            contextBase: spy[_apprt].contextBase,
            config: config
        });
    }

    function lookupDojoConfig() {
        let config;
        try {
            config = Object.assign({}, require("dojo/_base/config"));
        } catch (e) {
            config = Object.assign({}, (window as any).dojoConfig);
        }
        const out: any = {};
        if (config.apprt) {
            out.apprt = config.apprt;
        }
        if (config.ct) {
            out.ct = config.ct;
        }
        if (config.esri) {
            out.esri = config.esri;
        }
        return out;
    }

    function detectBootVersion() {
        let scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; ++i) {
            let script = scripts.item(i);
            if (script.src && script.src.match(/\/apprt-boot\//)) {
                return script.src.match(/apprt-boot\/([^/]+)\//)[1];
            }
        }
        return "";
    }

    function toSystemInfo(props: any = {}): SystemInfo {
        return Object.assign({
            version: "",
            bootVersion: "",
            contextBase: "",
            registryUrl: "",
            config: {}
        }, props);
    }

    // run code
    declareGlobalInstances();
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

interface SystemInfo {
    version: string,
    bootVersion: string,
    registryUrl: string,
    contextBase: string,
    config: any,
}

interface AppInfo {
    name: string,
    config: any
}
