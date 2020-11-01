import Vue from "vue";
import VueMaterial from "vue-material";
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'
Vue.use(VueMaterial)
import App from "./app.vue";
import { createStore } from "./shared-store";
function init() {
    const store = createStore();
    store.resolveApprt();
    const app = new Vue(App);
    (app as any).store = store;
    const body = document.getElementsByTagName("body")[0];
    const div = document.createElement("div");
    body.appendChild(div);
    app.$mount(div);

    // registerHook to check page again, if panel is switched
    (window as any).refreshPanel = function (show) {
        store.resetState();
        show && store.resolveApprt();
        (app as any).showInfo();
    }
}
window.onload = init;
