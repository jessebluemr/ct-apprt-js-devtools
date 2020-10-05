<template>
    <div>
        <p>'$apprt' found on page: {{ store.state.isAppRtApplication }}</p>
        <p>System bundle loaded: {{ store.state.isSystemBundleAvailable }}</p>
    </div>
</template>
<script>
    export default {
        props: {
            store: {
                type: Object,
                required: true
            }
        }
    }
</script>
