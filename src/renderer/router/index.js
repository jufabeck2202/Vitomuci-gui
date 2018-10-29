import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default
    },
    {
      path: '/videos',
      name: 'videos',
      component: require('@/components/VideoList').default
    },
    {
      path: '/download',
      name: 'download',
      component: require('@/components/Download').default
    },
    {
      path: '/finish',
      name: 'finish',
      component: require('@/components/Finish').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
