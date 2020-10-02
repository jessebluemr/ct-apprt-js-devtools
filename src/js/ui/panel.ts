import Vue from "vue";
//import { MdButton, MdContent, MdTabs, MdTab, MdApp, MdToolbar, MdTable} from 'vue-material/dist/components'
import VueMaterial from "vue-material";
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'
Vue.use(VueMaterial)
/*
Vue.use(MdButton);
Vue.use(MdContent);
Vue.use(MdTabs);
Vue.use(MdTab);
Vue.use(MdApp);
Vue.use(MdToolbar);
Vue.use(MdTable);*/
import App from "./app.vue";
import { createStore } from "./shared-store";
function init() {
    const store = createStore();
    store.resolveApprt();
    const app = new Vue(App);
    (app as any).store = store;
    const body = document.getElementsByTagName("body")[0];
    app.$mount();
    body.appendChild(app.$el);
}
window.onload = init;
