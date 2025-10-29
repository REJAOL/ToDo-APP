import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { VueFire } from 'vuefire'
import {app} from './firebase'

createApp(App)
    .use(router)
    .use(VueFire,{
        firebaseApp:app
    })
    .mount('#app')
