import Vue from 'vue'

import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default-dark.css'

import App from './App.vue'
import router from './router'
import "./firebaseConfig"
import ToggleButton from 'vue-js-toggle-button'

Vue.use(ToggleButton)
Vue.use(VueMaterial);

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')

