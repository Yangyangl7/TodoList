<template>
    <div class="todos">
        <md-toolbar  class="menu"  md-elevation="1" v-if="user">
            <!-- <div class="btnDiv" v-if="user"> -->
                <div class="filterBtn" v-bind="newTodo">
                    <md-menu md-size="auto" md-align-trigger>
                        <md-button md-menu-trigger>Filter Todos</md-button>
                        <md-menu-content>
                            <md-menu-item v-for="cate in orderedCates" :key="cate.id">
                                <router-link :to="{name:'CategoryTodo', params:{category: cate.id, cateName: cate.name}}">
                                    <md-button>{{ cate.name }}</md-button>
                                </router-link>
                             </md-menu-item>
                        </md-menu-content>
                    </md-menu>
                </div>

                <div class="doneBtn">
                    <router-link to="/done">
                        <md-button class="doneBtn">Done List</md-button>
                    </router-link>
                </div>

                <div class="logoutBtn">
                    <md-button  class="LogoutBtn" @click.prevent="signOut">
                        LogOut
                    </md-button>
                </div>

                <span class="delete">
                    <select class="deleteNote" v-model="selected" @change="deleteCate(selected)">
                        <option value="">Category Delete Selector</option>    
                        <option v-for="cate in orderedCates" :key="cate.id">{{cate.name}}</option>
                    </select>
                </span>
        </md-toolbar>

        <div class="main">

            <img src="../assets/todo.png">
            <h2>Hello {{user.displayName}}, Here is Todo List.</h2>
            <div v-if="errors.length">
                <b>Please correct the following error(s):</b>
                <h4 class="errMsg" v-for="error in errors" :key="error.id">New Todo {{ error }}</h4>
            </div>

            <div class="inputArea">
                <div class="newNote">
                    <md-field>
                        <label>Naming it carefully, it is used for filtering your todos</label>
                        <md-input v-model="newTodo.category" placeholder="Create a category for the todo" maxlength="15"></md-input>
                    </md-field>
                    <md-field>
                        <md-input v-model="newTodo.title" placeholder="New Todo Summarative Title" maxlength="20"></md-input>
                    </md-field>
                    <md-field>
                        <md-textarea v-model="newTodo.content" class="descInput" maxlength="100" placeholder="New ToDo Detailed Description"></md-textarea>
                    </md-field>

                    <md-button class="md-raised md-primary create" @click="checkForm(newTodo)">Create New Todo</md-button>
                </div>
            </div>

            <div class="noteList" v-for="todo in orderedTodos" :key="todo.id">
                    <div style="margin: 15px 5px">
                        <toggle-button @change="done(todo.id)" :value="false" color="#82C7EB"
                                        :sync="true"/>
                        <h5 v-if="todo.status" style="margin: 0 15px;">Done</h5>
                        <h5 v-if="!todo.status"  style="margin: 0 15px;">Undone</h5>
                    </div>
                    <div class="title">
                        <h5>{{ todo.title }}</h5>
                    </div>
                    <div style="margin: 10px 5px;">
                        <router-link :to="{name:'Edit', params:{id:todo.id}}">
                            <md-button class="md-fab md-mini">
                                    <md-icon>edit</md-icon>
                            </md-button>
                        </router-link>
                    </div>
            </div>
        </div>
    </div>
</template>

<script>
import _ from "lodash"
import { auth,db } from "@/firebaseConfig"

export default {
    name: "todos",
    data () {
        return {
            selected: "",
            errors: [],
            category: [],
            todos: [],
            newTodo: {
                content: "",
                title: "",
                category: ""
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
        checkForm: function (newTodo) {
            this.errors = [];

            if (newTodo.title) {
                this.addTodo(newTodo);
                return true;
            }

            if (!this.newTodo.title) {
                this.errors.push("Title required.");
            }

        },
        done: function (docId) {
            db.collection("note").doc(docId).update({
                status: true
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
            const createdAt = new Date();
            var isExists = false;

            db.collection("category")
              .where("name", "==", newTodo.category)
              .get()
              .then(function() {
                  isExists = true;
              })
              .catch(function() {
                  isExists = false;
              });

            if (!isExists) {
                db.collection("category").add({
                    author: this.user.email,
                    name: newTodo.category,
                    createdAt: createdAt
                });
            }

            db.collection("note").add({
                title: newTodo.title,
                content: newTodo.content,
                category: newTodo.category,
                status: false,
                saveTitle: newTodo.title,
                saveContent: newTodo.content,
                saveCategory: newTodo.category,
                authorEmail: this.user.email,
                createdAt: createdAt
            }).then(this.handler)
        },
        getTodo: function() {
            let self = this;
            self.todos = [];
            db.collection("note")
                .where("authorEmail", "==", auth.currentUser.email)
                .where("status", "==", false)
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
        deleteCate: function(cateName) {
            alert("Step in");
            let self = this;
            db.collection("category")
              .where("name", "==", cateName)
              .get()
              .then(function(querySnapshot) {
                  querySnapshot.forEach(function(doc) {
                      db.collection("category")
                        .doc(doc.id)
                        .delete()
                        .then(self.getCategory());

                      alert("Delete success");
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

<style scoped>

    .delete {
        width: 100%;
    }

    .deleteNote {
        width: 100%;
        border:0px;
        outline:0px;
    }

    .menu {
        background-color: #7f49d1;
        width: 100%;
        position: fixed;
        top: 0;
        overflow: hidden;
        padding:0px;
    }

    .main {
        margin-top: 100px;
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
        width: 80%;
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