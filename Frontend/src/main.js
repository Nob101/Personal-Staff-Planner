//main.js

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router.js'
import './style.css'
import 'vue-multiselect/dist/vue-multiselect.min.css'

//.use(router) damit Routing verwendet wird. Wird damit dann global verwendbar und muss nicht importiert werden! 
// Muss wie die meisten Vue Plugins vor dem mount stehen!
createApp(App).use(router).mount('#app')
