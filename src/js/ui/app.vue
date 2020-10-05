<template>
    <md-app md-mode="fixed">
        <md-app-toolbar class="md-primary">
            <span class="md-title">{{ message }}</span>
        </md-app-toolbar>
        <md-app-content>
            <md-tabs @md-changed="activeTabChanged">
                <md-tab
                    id="tab-info"
                    md-label="Info"
                ></md-tab>
                <md-tab
                    id="tab-bundles"
                    md-label="Bundles"
                ></md-tab>
                <md-tab
                    id="tab-components"
                    md-label="Components"
                ></md-tab>
                <md-tab
                    id="tab-services"
                    md-label="Services"
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
        </md-app-content>
    </md-app>
</template>
<script>
    import Info from "./info.vue";
    import BundlesTable from "./bundles.vue";
    import ServicesTable from "./services.vue";
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
            ComponentsTable
        },
        computed: {
        },
        methods: {
            activeTabChanged(id) {
                this.activeTab = id;
                switch (id) {
                    case "tab-bundles":
                        this.store.resolveBundles();
                        break;
                    case "tab-components":
                        this.store.resolveComponents();
                        break;
                    case "tab-services":
                        this.store.resolveServices();
                        break;
                }
            }
        }
    }
</script>
