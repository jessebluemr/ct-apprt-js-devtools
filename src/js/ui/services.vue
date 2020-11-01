<template>
    <div>
        <md-progress-spinner
            v-if="loading"
            md-mode="indeterminate"
        />
        <div v-if="!loading">
            <md-toolbar
                class="md-table-toolbar md-transparent"
                :md-elevation="0"
            >
                <div class="md-toolbar-section-start">
                    <md-button
                        class="md-primary"
                        v-on:click="refresh"
                    >Refresh</md-button>
                    <span>{{amountOfShownItems}}</span>
                    <md-button
                        class="md-primary"
                        v-on:click="toggleShowAll"
                    >{{showAll ? "Show less": "Show all"}}</md-button>
                </div>
                <md-field
                    md-clearable
                    class="md-toolbar-section-end"
                >
                    <md-input
                        placeholder="Search..."
                        v-model="searchTerm"
                    />
                </md-field>
            </md-toolbar>
            <md-table
                :value="reducedItems"
                md-sort="id"
                md-sort-order="asc"
                md-height="100%"
            >
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
        </div>
    </div>
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
                searchTerm: "",
                showAll: false,
                maxItems: 25
            };
        },
        computed: {
            loading() {
                return this.store?.state?.servicesLoading ?? false;
            },
            items() {
                return this.store?.state?.services ?? [];
            },
            amountOfShownItems() {
                let allItems = this.filteredItems;
                const allCount = allItems.length;
                let showCount = this.maxItems;
                if (this.showAll || allItems.length <= this.maxItems) {
                    showCount = allCount;
                }
                return `${showCount} of ${allCount} items`;
            },
            reducedItems() {
                let allItems = this.filteredItems;
                if (this.showAll || allItems.length <= this.maxItems) {
                    return allItems;
                }
                return allItems.slice(0, this.maxItems);
            },
            filteredItems() {
                let term = this.searchTerm;
                if (!term) {
                    return this.items;
                }
                term = toLower(term);
                return this.items.filter((item) => toLower(item.provide).includes(term));
            }
        },
        methods: {
            refresh() {
                this.store.resolveServices();
            },
            toggleShowAll() {
                this.showAll = !this.showAll;
            }
        }
    }

    const toLower = text => text.toLowerCase();

</script>
