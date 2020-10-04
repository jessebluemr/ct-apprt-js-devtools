<template>
    <md-table
        :value="filteredItems"
        md-sort="id"
        md-sort-order="asc"
        md-card
        md-fixed-header
    >
        <md-table-toolbar>
            <h1 class="md-title">Services
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
                    placeholder="Search ..."
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
            <md-table-cell
                md-label="ID"
                md-numeric
                md-sort-by="id"
            >{{ item.id }}</md-table-cell>
            <md-table-cell
                md-label="Provides"
                md-sort-by="provide"
            >{{ item.provide }}</md-table-cell>
            <md-table-cell
                md-label="Component"
                md-sort-by="component"
            >{{ item.component }}</md-table-cell>
            <md-table-cell
                md-label="Bundle"
                md-sort-by="bundle"
            >{{ item.bundle }}</md-table-cell>
            <md-table-cell
                md-label="Ranking"
                md-sort-by="ranking"
                md-numeric
            >{{ item.ranking }}</md-table-cell>
        </md-table-row>
    </md-table>
</template>
<script>
    export default {
        name: "services-table",
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
                return this.store?.state?.services ?? [];
            },
            filteredItems() {
                let term = this.searchTerm;
                if (!term) {
                    return this.items;
                }
                term = toLower(term);
                return this.items.filter((b) => toLower(b.provide).includes(term));
            }
        },
        methods: {
            refresh() {
                this.store.resolveServices();
            }
        }
    }

    const toLower = text => text.toLowerCase();

</script>
