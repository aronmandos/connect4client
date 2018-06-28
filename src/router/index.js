import Vue from 'vue'
import Router from 'vue-router'
import Connect4 from '@/components/Connect4'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Connect4',
      component: Connect4
    }
  ]
})
