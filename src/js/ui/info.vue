<template>
    <div>
        <md-card v-if="!apprtAvailable">
            <md-card-content>
                <div>This application is not based on app.rt (map.apps)</div>
            </md-card-content>
        </md-card>
        <div v-if="apprtAvailable">
            <md-card>
                <md-card-header>
                    <div class="md-title">app.rt Info</div>
                </md-card-header>
                <md-card-content>
                    <div>apprt version: {{systemInfo.version}}</div>
                    <div>apprt-boot version: {{systemInfo.bootVersion}}</div>
                    <div>JS-Registry: <a :href="jsregUrl">{{jsregUrl}}</a></div>
                    <div>BaseUrl: <a :href="systemInfo.contextBase">{{systemInfo.contextBase}}</a></div>
                </md-card-content>
            </md-card>
            <md-card>
                <md-card-header>
                    <div class="md-title">App-Config</div>
                </md-card-header>
                <md-card-content>
                    {{appInfo.name}}
                </md-card-content>
                <md-card-expand>
                    <md-card-actions md-alignment="space-between">
                        <md-card-expand-trigger>
                            <md-button class="md-icon-button">
                                <md-icon>keyboard_arrow_down</md-icon>
                            </md-button>
                        </md-card-expand-trigger>
                    </md-card-actions>
                    <md-card-expand-content>
                        <md-card-content>
                            <pre>{{ appInfo.config }}</pre>
                        </md-card-content>
                    </md-card-expand-content>
                </md-card-expand>
            </md-card>
            <md-card>
                <md-card-header>
                    <div class="md-title">System-Config</div>
                </md-card-header>
                <md-card-expand>
                    <md-card-actions md-alignment="space-between">
                        <md-card-expand-trigger>
                            <md-button class="md-icon-button">
                                <md-icon>keyboard_arrow_down</md-icon>
                            </md-button>
                        </md-card-expand-trigger>
                    </md-card-actions>
                    <md-card-expand-content>
                        <md-card-content>
                            <pre>{{ systemConfigJson }}</pre>
                        </md-card-content>
                    </md-card-expand-content>
                </md-card-expand>
            </md-card>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.md-card {
    margin: 4px;
    display: inline-block;
    vertical-align: top;
}
</style>
<script>
    export default {
        props: {
            store: {
                type: Object,
                required: true
            }
        },
        computed: {
            apprtAvailable() {
                return this.store?.state?.isAppRtApplication;
            },
            systemConfigJson() {
                return this.systemInfo?.config;
            },
            systemInfo() {
                return this.store?.state?.systemInfo;
            },
            appInfo() {
                return this.store?.state?.appInfo;
            },
            jsregUrl() {
                return this.systemConfigJson?.ct?.jsregistry;
            }
        }
    }
</script>
