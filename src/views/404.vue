<template>
    <div class="auth">
         <img alt="Vue logo" src="../assets/logo2.png">

        <h1 class="welcome">YToDo 404, You typed wrong url.</h1>
        <template>
            <h2 class="welcome">First of first</h2>
            <router-link to="/todo">
                <md-button class="md-raised md-primary">
                    Go Back To Todo List
                </md-button>
            </router-link>
        </template>

    </div>
</template>

<script>
export default {
    name: "error"
}
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
