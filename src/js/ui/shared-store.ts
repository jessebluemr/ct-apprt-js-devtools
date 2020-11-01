const APPRT_ACCESS_PREFIX = "$$apprtDevToolsSpy"
import Vue from "vue";



export function createStore() {
    const self = {
        state: createEmptyState(),
        hasBundles() {
            return this.state.bundles.length > 0;
        },
        hasServices() {
            return this.state.services.length > 0;
        },
        hasComponents() {
            return this.state.components.length > 0;
        },
        hasStatistics() {
            return this.state.statistics.length > 0;
        },
        resolveBundles() {
            if (this.state.bundlesLoading) {
                return;
            }
            this.state.bundlesLoading = true;
            this.invoke(`${APPRT_ACCESS_PREFIX}.bundles`, (state, result) => {
                state.bundlesLoading = false;
                state.bundles = result || [];
            });
        },
        resolveServices() {
            if (this.state.servicesLoading) {
                return;
            }
            this.state.servicesLoading = true;
            this.invoke(`${APPRT_ACCESS_PREFIX}.services`, (state, result) => {
                state.servicesLoading = false;
                state.services = result || [];
            });
        },
        resolveComponents() {
            if (this.state.componentsLoading) {
                return;
            }
            this.state.componentsLoading = true;
            this.invoke(`${APPRT_ACCESS_PREFIX}.components`, (state, result) => {
                state.componentsLoading = false;
                state.components = result;
            });
        },
        resolveStatistics() {
            if (this.state.statisticsLoading) {
                return;
            }
            this.state.statisticsLoading = true;
            this.invoke(`${APPRT_ACCESS_PREFIX}.statisticData`, (state, result) => {
                state.statisticsLoading = false;
                const start = new Date().getTime();
                state.statistics = toReducedStatistics(result);
                const end = new Date().getTime();
                console.info("calc statistics took:" + (end - start) + "msec");
            });
        },
        resolveSystemInfo() {
            this.invoke(`${APPRT_ACCESS_PREFIX}.systemInfo`, (state, result) => {
                Vue.set(state, "systemInfo", result);
            });
        },
        resolveAppInfo() {
            this.invoke(`${APPRT_ACCESS_PREFIX}.appInfo`, (state, result) => {
                Vue.set(state, "appInfo", result);
            });
        },

        startOrStopBundle(bundle) {
            const state = bundle.state;
            const method = state === "ACTIVE" ? "stopBundle" : "startBundle";
            this.invoke(`${APPRT_ACCESS_PREFIX}.${method}(${bundle.id})`, () => {
                setTimeout(() => this.resolveBundles(), 200);
            });
        },

        /*invokeAsync(script) {
            sendMessage(script);
        },*/

        invoke(method, cb) {
            invoke(self, method, cb);
        },

        resetState() {
            Vue.set(self, "state", createEmptyState());
        },

        resolveApprt() {
            let lookupCount = 0;
            function lookup() {
                ++lookupCount;
                if (lookupCount > 20) {
                    console.info(`Stop apprt detection, due to to max retries ${lookupCount}`);
                    return;
                }
                if (!self.state.isAppRtApplication) {
                    self.invoke(
                        `${APPRT_ACCESS_PREFIX}.installed`, (state, result) => {
                            state.isAppRtApplication = !!result;
                            if (state.isAppRtApplication) {
                                self.resolveSystemInfo();
                            }
                        }
                    );
                }
                if (!self.state.isSystemBundleAvailable) {
                    self.invoke(`${APPRT_ACCESS_PREFIX}.ready`,
                        (state, result) => {
                            state.isSystemBundleAvailable = !!result;
                            if (!state.isSystemBundleAvailable) {
                                setTimeout(lookup, 300);
                                return;
                            }
                            console.info("[apprt.devtools] Stop apprt detection, system bundle available.");
                            self.resolveSystemInfo();
                            self.resolveAppInfo();
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
    const start = new Date().getTime();
    chrome.devtools.inspectedWindow.eval(
        method,
        (result, isException) => {
            const end = new Date().getTime();
            console.info(`[apprt.devtools] Invoke eval(${method}) took: ${end - start}msec`);
            callback.call(store, store.state, result);
            const endcb = new Date().getTime();
            console.info(`[apprt.devtools] Invoke eval(${method} - callback) took: ${endcb - end}msec`);
        }
    );
}

function sendMessage(script: string) {
    if (!script) {
        return;
    }
    chrome.runtime.sendMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        script: script
    });
}

function toReducedStatistics(fullStatisticsData: Record<string, StatisticMeasureItem[]>): CalcStatisticItem[] {
    return Object.values(fullStatisticsData).map(calcStatistics);
}


function calcStatistics(itemarr: StatisticMeasureItem[]): CalcStatisticItem {
    let count = itemarr.length;
    let name = itemarr[0].name;
    let unfinished = false;
    let min;
    let max;
    let sum;
    for (let i = 0, l = count; i < l; ++i) {
        const notFinished = !itemarr[i].end;
        if (notFinished) {
            --count;
            unfinished = true;
            continue;
        }
        const time = itemarr[i].end - itemarr[i].start;
        if (sum === undefined) {
            // Is first
            min = time;
            max = time;
            sum = time;
        } else {
            min = Math.min(time, min);
            max = Math.max(time, max);
            sum += time;
        }
    }
    return {
        name,
        min,
        max,
        sum,
        avg: sum / count,
        count,
        unfinished,
        org_count: itemarr.length
    };

}

interface StatisticMeasureItem {
    name: string,
    start: number,
    end: number | undefined
}

interface CalcStatisticItem {
    name: string,
    min: number;
    max: number;
    sum: number;
    avg: number;
    count: number;
    unfinished: boolean;
    org_count: number
}


function createEmptyState() {
    return {
        isAppRtApplication: false,
        isSystemBundleAvailable: false,
        bundlesLoading: false,
        bundles: [],
        servicesLoading: false,
        services: [],
        componentsLoading: false,
        components: [],
        statisticsLoading: false,
        statistics: [],
        systemInfo: {},
        appInfo: {}
    };
}
