<template>
    <div class="todos">
        <md-toolbar  class="menu"  md-elevation="1" v-if="user">
            <!-- <div class="btnDiv" v-if="user"> -->
                <div class="filterBtn" v-bind="newTodo">
                    <md-menu md-size="auto" md-align-trigger>
                        <md-button  md-menu-trigger>Filter Dones</md-button>
                        <md-menu-content>
                             <md-menu-item v-for="cate in orderedCates" :key="cate.id">
                                <router-link :to="{name:'CategoryDone', params:{category: cate.id, cateName: cate.name}}">
                                    <md-button>
                                    {{ cate.name }}  
                                    </md-button>
                                </router-link>
                             </md-menu-item>
                        </md-menu-content>
                    </md-menu>
                </div>

                <div class="doneBtn">
                    <router-link to="/todo">
                        <md-button class="doneBtn">Todo List</md-button>
                    </router-link>
                </div>

                <div class="logoutBtn">
                    <md-button  class="LogoutBtn" @click.prevent="signOut">
                        LogOut
                    </md-button>
                </div>
            <!-- </div> -->
        </md-toolbar>

        <div class="main">
            <img src="../assets/done.png">
            <h2 class="welcome">Hello {{user.displayName}}, Here is Done List !</h2>
                
            <div v-if="errors.length">
                <b>Please correct the following error(s):</b>
                <h4 class="errMsg" v-for="error in errors" :key="error.id">New Todo {{ error }}</h4>
            </div>

            <div class="noteList" v-for="todo in orderedTodos" :key="todo.id">
                    <div style="margin: 15px 5px">
                        <toggle-button @change="done(todo.id)" :value="true"  color="#82C7EB"
                                        :sync="true"/>
                        <h5 v-if="todo.status" style="margin: 0 15px;">Done</h5>
                        <h5 v-if="!todo.status">Undone</h5>
                    </div>

                    <div class="title">
                        <h5>{{ todo.title }}</h5>
                    </div>
                    
            </div>
        </div>
    </div>
</template>

<script>
import _ from "lodash"
import { auth,db } from "@/firebaseConfig"

export default {
    name: "done",
    data () {
        return {
            errors: [],
            category: [],
            todos: [],
            newTodo: {
                content: "",
                title: ""
            },
            user: auth.currentUser,
        }
    },
    created () {
        this.handler();
    },
    computed: {
       orderedTodos: function() {
           return _.orderBy(this.todos, 'date', 'desc')
       },
       orderedCates: function() {
           return _.orderBy(this.category, 'date', 'desc')
       }
    },
    methods: {
        done: function (docId) {
            db.collection("note").doc(docId).update({
                status: false,
            }).then(this.getTodo)
        },
        signOut: function() {
            auth
                .signOut()
                .then(() => {
                this.user = null
                this.$router.replace('login')
                })
            .catch(err => alert('Oops. ' + err.message));
        },
        addTodo: function(newTodo) {
            const createdAt = new Date()
            db.collection("note").add({
                title: newTodo.title,
                content: newTodo.content,
                status: false,
                authorEmail: this.user.email,
                createdAt: createdAt
            }).then(this.getTodo)
        },
        getTodo: function() {
            let self = this;
            self.todos = [];
            db.collection("note")
                .where("authorEmail", "==", auth.currentUser.email)
                .where("status", "==", true)
                .get().then(function(querySnapshot) {
                    querySnapshot.forEach(function(doc) {
                        self.todos.push({
                            id: doc.id,
                            title: doc.data().title,
                            content: doc.data().content,
                            status: doc.data().status,
                            date: doc.data().createdAt,
                            authorEmail: doc.data().authorEmail
                        })
                    })    
                })
        },
        getCategory: function() {
            let self = this;
            self.category = [];
            db.collection("category")
              .where("author", "==", auth.currentUser.email)
              .get().then(function(querySnapshot) {
                  querySnapshot.forEach(function(doc) {
                      self.category.push({
                          id: doc.id,
                          name: doc.data().name,
                          author: doc.data().author,
                          date: doc.data().createdAt
                      })
                  })
              })
        },
        handler: function() {
            this.getTodo();
            this.getCategory();
        }
    }
}

</script>

<style lang="scss" scoped>

    .menu {
            background-color: #7f49d1;
            width: 100%;
            position: fixed;
            top: 0;
    }

    .main {
        margin-top: 75px;
    }

    .doneBtn{
        width: 33%;
        margin: 0 atuo;
    }

    .filterBtn{
        width: 33%;
        float: left;
    }

    .logoutBtn{
        width: 33%;
        float: right;
    }

    .noteInput {
        margin-left: 15px;
    }

    .title {
        color: white;
        font-size: 2ch;
        width: 75%;
    }

    .newNote {
        text-align:center;
        width: 50%;
        display: block;
        margin-left: auto;
        margin-right: auto;
    }

    .noteList {
        background-color:#7029db;
        margin: 10px auto;
        width: 50%;
        border-radius: 15px;
        display: flex;
    }

    .create {
        margin-left: auto;
        margin-right: auto;
        font-size: 1.75ch;
    }

    b {
        color: #ce1030;
    }

    .errMsg {
        color: #ce1030; 
    }

    .descInput {
        display: block;
        margin-left: auto;
        margin-right: auto;
    } 

    .md-switch {
        display: flex;
    }
</style>