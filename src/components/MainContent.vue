<template>
  <div class="mainLayout">
    <div class="row">
      <div class="col-12">
        <input type="text" class="col-sm-4 col-sm-offset-4" required maxlength="15" placeholder="Nickname" @keyup.enter="goToGame()" v-model="nickname">
        <p id="errorText" class="error" v-show="error">You need to enter your nickname</p>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <button class="btn primaryColor mt-4 btn-lg" @click="goToGame">PLAY!</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  data() {
    return {
      nickname: '',
      error: false,
    }
  },
  methods: {
    ...mapMutations(['setNickname']),
    goToGame() {
      if(this.nickname != ""){
        this.setNickname(this.nickname);
        this.$router.push({
          name: 'Game',
        })
      }
      else{
        this.error = true;
      }
    }
  }
}
</script>

<style scoped>
input{
  background-color: var(--primary-color);
  color: var(--input-text-color);
  border-radius: 10px;
  text-align: center;
}
</style>