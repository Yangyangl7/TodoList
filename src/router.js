import Vue from 'vue'
import Router from 'vue-router'
import firebase from 'firebase'

import Auth from "@/components/Auth.vue"
import Todos from "@/components/Todos.vue"
import Done from "@/components/Done.vue"
import Edit from "@/components/Edit.vue"
import Error from "@/views/404.vue"
import CateTodo from "@/components/CategoryTodo.vue"
import CateDone from "@/components/CategoryDone.vue"

Vue.config.devtools = true;

Vue.use(Router)

const router = new Router({
    mode: 'history',
    routes: [
        {
            path: '*',
            redirect: '/404'
        },
        {
            path: '/login',
            redirect: '/'
        },
        {
            path: '/404',
            name: '404',
            component: Error
        },
        {
            path: '/',
            name: 'Login',
            component: Auth
        },
        {
            path: '/todo',
            name: 'Todos',
            component: Todos,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/done',
            name: 'Done',
            component: Done,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/todo/:id',
            name: 'Edit',
            component: Edit,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/todos/:category',
            name: 'CategoryTodo',
            component: CateTodo,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/done/:category',
            name: 'CategoryDone',
            component: CateDone,
            meta: {
                requiresAuth: true
            }
        }
    ]
})

router.beforeEach((to, from, next) => {
    let currentUser = firebase.auth().currentUser;
    let requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    
    if (requiresAuth && !currentUser) next('/');
    else if (!requiresAuth && currentUser) next('/todos');
    else next();
})

export default router