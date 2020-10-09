export function createStore() {
    const self = {
        state: {
            isAppRtApplication: false,
            isSystemBundleAvailable: false,
            bundles: [],
            services: [],
            components: [],
            statistics: []
        },

        resolveBundles() {
            this.invoke("$apprt.$spy.bundles", (state, result) => {
                state.bundles = result;
            });
        },
        resolveServices() {
            this.invoke("$apprt.$spy.services", (state, result) => {
                state.services = result;
            });
        },
        resolveComponents() {
            this.invoke("$apprt.$spy.components", (state, result) => {
                state.components = result;
            });
        },
        resolveStatistics() {
            this.invoke("$apprt.$spy.statisticData", (state, result) => {
                state.statistics = toReducedStatistics(result);
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
                if (!self.state.isSystemBundleAvailable) {
                    self.invoke("$apprt.$spy.ready",
                        (state, result) => {
                            self.state.isSystemBundleAvailable = !!result;
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
