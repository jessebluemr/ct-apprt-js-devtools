<template>
    <md-table
        :value="filteredItems"
        md-sort="id"
        md-sort-order="asc"
        md-card
        md-fixed-header
    >
        <md-table-toolbar>
            <h1 class="md-title">Bundles
                <md-button
                    class="md-primary"
                    v-on:click="refresh"
                >Refresh</md-button>
            </h1>
            <md-field
                md-clearable
                class="md-toolbar-section-end"
            >
                <md-input
                    placeholder="Search..."
                    v-model="searchTerm"
                />
            </md-field>
        </md-table-toolbar>
        <md-table-empty-state
            md-label="Nothing found"
            :md-description="`No item found for query '${searchTerm}'. Try a different search term or refresh the list.`"
        ></md-table-empty-state>
        <md-table-row
            slot="md-table-row"
            slot-scope="{ item }"
        >
            <md-table-cell>
                <md-button
                    class="md-icon-button"
                    v-on:click="startOrStopBundle(item)"
                >
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
</template>
<script>
    export default {
        name: "bundles-table",
        props: {
            store: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                searchTerm: ""
            };
        },
        computed: {
            items() {
                return this.store?.state?.bundles ?? [];
            },
            filteredItems() {
                let term = this.searchTerm;
                if (!term) {
                    return this.items;
                }
                term = toLower(term);
                return this.items.filter((b) => toLower(b.name).includes(term));
            }
        },
        methods: {
            refresh() {
                this.store.resolveBundles();
            },
            startOrStopBundle(item) {
                this.store.startOrStopBundle(item);
            }
        }
    }

    const toLower = text => text.toLowerCase();

</script>
