import 'bulma/css/bulma.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'mdbvue/build/css/mdb.css'
import Vue from 'vue'
import axios from 'axios'
import App from './App'
import router from './router'
import store from './store'
import VueAnalytics from 'vue-analytics'
Vue.use(VueAnalytics, {
  id: 'UA-129015574-1'
})

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
