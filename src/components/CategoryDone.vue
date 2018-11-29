<template>
    <div class="todos">
        <md-toolbar  class="menu"  md-elevation="1" v-if="user">
                <div class="todoBtn">
                    <router-link to="/todo">
                        <md-button>Todo List</md-button>
                    </router-link>
                </div>

                <div class="doneBtn">
                    <router-link to="/done">
                        <md-button>Done List</md-button>
                    </router-link>
                </div>

                <div class="logoutBtn">
                    <md-button  class="LogoutBtn" @click.prevent="signOut">
                        LogOut
                    </md-button>
                </div>
        </md-toolbar>
        
        <div class="main">
            <img src="../assets/done.png"><h2>Done: {{ cateName }} category</h2>
            <div v-if="errors.length">
                <b>Please correct the following error(s):</b>
                <h4 class="errMsg" v-for="error in errors" :key="error.id">New Todo {{ error }}</h4>
            </div>

            <div class="newNote">
                <md-field>
                    <md-input v-model="newTodo.title" placeholder="New Todo Summarative Title" maxlength="20"></md-input>
                </md-field>
                <md-field>
                    <md-textarea v-model="newTodo.content" class="descInput" maxlength="100" placeholder="New ToDo Detailed Description"></md-textarea>
                </md-field>

                <md-button class="md-raised md-primary create" @click="checkForm(newTodo)">Create New Done</md-button>
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
    name: "categorydone",
    data () {
        return {
            errors: [],
            todos: [],
            newTodo: {
                content: "",
                title: "",
            },
            cateId: this.$route.params.category,
            cateName: this.$route.params.cateName,
            user: auth.currentUser,
        }
    },
    created () {
        this.getTodo();
    },
    computed: {
       orderedTodos: function() {
           return _.orderBy(this.todos, 'date', 'desc')
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
                status: false
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
            let self = this;
            const createdAt = new Date();
            db.collection("note").add({
                title: newTodo.title,
                content: newTodo.content,
                category: self.cateName,
                status: true,
                saveTitle: newTodo.title,
                saveContent: newTodo.content,
                saveCategory: self.cateName,
                authorEmail: self.user.email,
                createdAt: createdAt
            }).then(this.getTodo())
        },
        getTodo: function() {
            let self = this;
            self.todos = [];

            db.collection("note")
              .where("authorEmail", "==", auth.currentUser.email)
              .where("category", "==", self.cateName)
              .where("status", "==", true)
              .get()
              .then(function(querySnapshot) {
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
                .catch(function(err) {
                    alert("Here is getTodo: " + err);
                })
        }
    }
}

</script>

<style scoped>

    .menu {
        background-color: #7f49d1;
        width: 100%;
        position: fixed;
        top: 0;
        padding: 0;
        overflow: hidden;
    }

    .main {
        margin-top: 75px;
    }

    .todoBtn{
        width: 33%;
        float: 0 auto;
    }

    .doneBtn{
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