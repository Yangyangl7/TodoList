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
                    <md-button class="doneBtn">Done List</md-button>
                </router-link>
            </div>

            <div class="logoutBtn">
                <md-button @click.prevent="signOut">
                    LogOut
                </md-button>
            </div>
        </md-toolbar>

        <div class="main"> 
             <img src="../assets/edit.png">
            <h2 class="welcome">Edit: Here is Edit page !</h2>
            <h3>For "{{editTodo.title}}"</h3>
            <div v-if="errors.length">
                <b>Please correct the following error(s):</b>
                <h4 class="errMsg" v-for="error in errors" :key="error.id">Edit Todo {{ error }}</h4>
            </div>

            <div class="newNote">
                <md-field>
                    <label>Edit it carefully, it is used for filtering your todos</label>
                    <md-input v-model="editTodo.category" :placeholder="editTodo.category" maxlength="15"></md-input>
                </md-field>
                <md-field>
                    <md-input v-model="editTodo.title" :placeholder="editTodo.title" maxlength="20"></md-input>
                </md-field>
                <md-field>
                    <md-textarea v-model="editTodo.content" :placeholder="editTodo.content" class="descInput" maxlength="100"></md-textarea>
                </md-field>

                <span style="margin-right:7.5px;">
                    <md-button class="md-raised md-primary create" @click="checkForm(editTodo)">Edit</md-button>
                </span>
                <span style="margin-left: 7.5px;">
                    <md-button class="md-raised md-primary create" @click="save(editTodo)">Save</md-button>
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import { auth,db } from "@/firebaseConfig"

export default {
    name: "edit",
    data () {
        return {
            errors: [],
            editTodo: {
                content: "",
                title: "",
                category: "",
                cachedCategory: ""
            },
            user: auth.currentUser,
        }
    },
    created () {
        this.load();
    },
    methods: {
        checkForm: function (editTodo) {
            this.errors = [];

            if (editTodo.title) {
                this.modifyTodo(editTodo);
                alert("Modification Success!");
            }

            if (!editTodo.title) {
                this.errors.push("Title required.");
            }

        },
        load: function () {
            let self = this;
            db.collection("note").doc(this.$route.params.id)
              .get().then(function(doc) {
                  if (doc.exists) {
                      self.editTodo.cachedCategory = doc.data().category;
                      self.editTodo.category = doc.data().saveCategory;
                      self.editTodo.content = doc.data().saveContent;
                      self.editTodo.title = doc.data().saveTitle;
                  } else {
                      alert("No Such Todo!");
                      this.$router.replace({path: '/todo', replace: true})
                  }
              }).catch(function(error) {
                  alert(error);
              });
        },
        save: function (editTodo) {
            this.errors = [];

            if (editTodo.title) {
                db.collection("note").doc(this.$route.params.id)
                  .update({
                      saveCategory: editTodo.category,
                      saveTitle: editTodo.title,
                      saveContent: editTodo.content,
                  })
                alert("Saved Success!");
                return true;
            }

            if (!this.editTodo.title) {
                this.errors.push("Title required.");
            }

        },
        done: function (docId) {
            var isDone = this.status;
            if (isDone) {
                isDone = false;
            } 
            else {
                isDone = true;
            }
            this.status = isDone;

            db.collection("note").doc(docId).update({
                status: isDone
            }).then(this.getTodo)
        },
        signOut: function() {
            auth
                .signOut()
                .then(() => {
                this.user = null;
                this.$router.replace('login');
                })
            .catch(err => alert('Oops. ' + err.message));
        },
        modifyTodo: function(editTodo) {
            let self = this;
            db.collection("category")
              .where("name", "==", editTodo.cachedCategory)
              .get()
              .then(function(querySnapshot) {
                    if (!querySnapshot.empty) {
                        querySnapshot.forEach(function(doc) {
                            db.collection("category")
                              .doc(doc.id).update({
                                    name: editTodo.category
                              });
                        })    
                    }
                    else {
                        db.collection("category")
                          .add({
                              name: editTodo.category,
                              author: self.user.email, 
                              createdAt: new Date()
                          })                        
                    }
                })
               .catch(function(err) {
                   alert("Ohh" + err);
               })

            db.collection("note").doc(this.$route.params.id).update({
                title: editTodo.title,
                content: editTodo.content,
                category: editTodo.category,
                saveCategory: editTodo.category,
                saveContent: editTodo.content,
                saveTitle: editTodo.title
            })
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
        overflow: hidden;
        padding: 0;
    }

    .main {
        margin-top: 75px;
    }

    .doneBtn{
        width: 33%;
        margin: 0 atuo;
    }

    .todoBtn{
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