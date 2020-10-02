<template>
    <md-app md-mode="fixed">
        <md-app-toolbar class="md-primary">
            <span class="md-title">{{ message }}</span>
        </md-app-toolbar>
        <md-app-content>
            <p>$apprt: {{ store.state.isAppRtApplication }}</p>
            <p>$system: {{ store.state.systemBundleAvailable }}</p>
            <md-table
                v-model="filteredBundles"
                md-sort="id"
                md-sort-order="asc"
                md-card
                md-fixed-header
            >
                <md-table-toolbar>
                    <h1 class="md-title">Bundels
                        <md-button
                            class="md-primary"
                            v-on:click="updateBundles"
                        >Refresh</md-button>
                    </h1>
                    <md-field
                        md-clearable
                        class="md-toolbar-section-end"
                    >
                        <md-input
                            placeholder="Search by name..."
                            v-model="searchBundlesTerm"
                        />
                    </md-field>
                </md-table-toolbar>
                <md-table-empty-state
                    md-label="No Bundles found"
                    :md-description="`No bundle found for this '${searchBundlesTerm}' query. Try a different search term or refresh the bundle list.`"
                ></md-table-empty-state>
                <md-table-row
                    slot="md-table-row"
                    slot-scope="{ item }"
                >
                    <md-table-cell>
                        <md-button class="md-icon-button" v-on:click="startOrStopBundle(item)">
                            <md-icon>{{item.state==='ACTIVE' ? "stop" : "play_arrow" }}</md-icon>
                        </md-button>
                    </md-table-cell>
                    <md-table-cell
                        md-label="ID"
                        md-numeric
                        md-sort-by="id"
                    >{{ item.id }}</md-table-cell>
                    <md-table-cell
                        md-label="Name"
                        md-sort-by="name"
                    >{{ item.name }}</md-table-cell>
                    <md-table-cell
                        md-label="Version"
                        md-sort-by="version"
                    >{{ item.version }}</md-table-cell>
                    <md-table-cell
                        md-label="State"
                        md-sort-by="state"
                    >{{ item.state }}</md-table-cell>
                </md-table-row>
            </md-table>
        </md-app-content>
    </md-app>
</template>
<script>
    export default {
        data: {
            store: undefined,
            message: 'app.rt Dev Tools',
            searchBundlesTerm: ""
        },
        computed: {
            bundles() {
                return this.store.state.bundles;
            },
            filteredBundles() {
                let term = this.searchBundlesTerm;
                if (!term) {
                    return this.bundles;
                }
                term = toLower(term);
                return this.bundles.filter((b) => toLower(b.name).includes(term));
            }
        },
        methods: {
            updateBundles() {
                this.store.resolveBundles();
            },
            startOrStopBundle(item){
                this.store.startOrStopBundle(item);
            }
        }
    }

    const toLower = text => text.toLowerCase();

</script>
