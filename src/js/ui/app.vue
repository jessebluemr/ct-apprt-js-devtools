<template>
    <md-app md-mode="fixed">
        <md-app-toolbar class="md-primary">
            <span class="md-title">{{ message }}</span>
        </md-app-toolbar>
        <md-app-content>
            <p>$apprt: {{ store.state.isAppRtApplication }}</p>
            <p>$system: {{ store.state.systemBundleAvailable }}</p>
            <bundles-table v-bind:store="store"></bundles-table>
            <services-table v-bind:store="store"></services-table>
            <components-table v-bind:store="store"></components-table>
        </md-app-content>
    </md-app>
</template>
<script>
    import BundlesTable from "./bundles.vue";
    import ServicesTable from "./services.vue";
    import ComponentsTable from "./components.vue";
    export default {
        data: {
            store: undefined,
            message: 'app.rt Dev Tools',
        },
        components: {
            BundlesTable,
            ServicesTable,
            ComponentsTable
        },
        computed: {
        },
        methods: {
        }
    }
</script>
