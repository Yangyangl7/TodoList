<template>
    <div class="auth">
        <img alt="Vue logo" src="../assets/logo2.png">

        <h1 class="welcome">Welcome to YToDo, your fantastic todo list web.</h1>
        <template v-if="!user">
            <h2 class="welcome">First of first</h2>
            <md-button class="md-raised md-primary" @click="signInWithGoogle">
                Sign in with Google
            </md-button>
        </template>

        <template v-if="user">
            <md-button  class="md-raised md-primary" @click="signOut">
                LOGOut
            </md-button>
        </template>

    </div>
</template>

<script>
import { db, auth, provider } from "@/firebaseConfig"

export default {
  name: "auth",
  data() {
    return {
      user: null
    };
  },
  beforeCreate: function() {
    auth.onAuthStateChanged(user => {
      if (user) {
        this.user = user;
        
        db.collection("user").doc(user.email).get().then(function(doc) {
          if (!doc.exists) {
            db.collection("user").doc(user.email).set({
              name: user.displayName,
              email: user.email,
            })
          }
        })

        this.$router.replace('todo')
      }
    });
  },
  methods: {
    signInWithGoogle: function() {
      auth.signInWithRedirect(provider)
          .catch(err => alert('Oops. ' + err.message))
    },
    signOut: function() {
      auth
        .signOut()
        .then(() => {
          this.user = null
        })
        .catch(err => alert('Oops. ' + err.message));
    }
  }
};

</script>

<style scoped>

.welcome {
    color: #7f36e2; 
}
.sign{
  background-color: #7f36e2;
  color: white; 
}

</style>

