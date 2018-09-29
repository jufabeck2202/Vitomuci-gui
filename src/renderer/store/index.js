import Vue from 'vue'
import Vuex from 'vuex'

import modules from './modules'
// extra packages
import Toasted from 'vue-toasted'
import VModal from 'vue-js-modal'

Vue.use(Toasted)
Vue.use(Vuex)
Vue.use(VModal, { dialog: true })

export default new Vuex.Store({
  modules,
  strict: process.env.NODE_ENV !== 'production'
})
