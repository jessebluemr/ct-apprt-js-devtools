<template>
    <md-app md-mode="fixed">
        <md-app-toolbar class="md-primary">
            <span class="md-title">{{ message }}</span>
        </md-app-toolbar>
        <md-app-content>
            <md-tabs
                :md-active-tab="activeTab"
                @md-changed="activeTabChanged"
            >
                <md-tab
                    id="tab-info"
                    md-label="Info"
                ></md-tab>
                <md-tab
                    id="tab-bundles"
                    md-label="Bundles"
                    :md-disabled="noDataAccess"
                ></md-tab>
                <md-tab
                    id="tab-components"
                    md-label="Components"
                    :md-disabled="noDataAccess"
                ></md-tab>
                <md-tab
                    id="tab-services"
                    md-label="Services"
                    :md-disabled="noDataAccess"
                ></md-tab>
                <md-tab
                    id="tab-statistics"
                    md-label="Statistics"
                    :md-disabled="noDataAccess"
                ></md-tab>
            </md-tabs>
            <info
                v-if="activeTab === 'tab-info'"
                v-bind:store="store"
            ></info>
            <bundles-table
                v-if="activeTab === 'tab-bundles'"
                v-bind:store="store"
            ></bundles-table>
            <components-table
                v-if="activeTab === 'tab-components'"
                v-bind:store="store"
            ></components-table>
            <services-table
                v-if="activeTab === 'tab-services'"
                v-bind:store="store"
            ></services-table>
            <statistics-table
                v-if="activeTab === 'tab-statistics'"
                v-bind:store="store"
            ></statistics-table>
        </md-app-content>
    </md-app>
</template>
<script>
    import Info from "./info.vue";
    import BundlesTable from "./bundles.vue";
    import ServicesTable from "./services.vue";
    import StatisticsTable from "./statistics.vue";
    import ComponentsTable from "./components.vue";

    export default {
        data: {
            store: undefined,
            message: 'app.rt Dev Tools',
            activeTab: undefined
        },
        components: {
            Info,
            BundlesTable,
            ServicesTable,
            ComponentsTable,
            StatisticsTable
        },
        computed: {
            noDataAccess() {
                return !(this.store?.state?.isSystemBundleAvailable);
            }
        },
        methods: {
            showInfo() {
                this.activeTab = "tab-info";
            },
            activeTabChanged(id) {
                if (this.activeTab === id) {
                    return;
                }
                this.activeTab = id;
                switch (id) {
                    case "tab-bundles":
                        if (!this.store.hasBundles()) {
                            this.store.resolveBundles();
                        }
                        break;
                    case "tab-components":
                        if (!this.store.hasComponents()) {
                            this.store.resolveComponents();
                        }
                        break;
                    case "tab-services":
                        if (!this.store.hasServices()) {
                            this.store.resolveServices();
                        }
                        break;
                    case "tab-statistics":
                        if (!this.store.hasStatistics()) {
                            this.store.resolveStatistics();
                        }
                        break;
                }
            }
        }
    }
</script>
