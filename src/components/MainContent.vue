<template>
  <div class="mainLayout">
    <div class="input-container">
      <input 
        type="text" 
        required 
        maxlength="15" 
        placeholder="Enter nickname..." 
        @keyup.enter="goToGame()" 
        v-model="nickname"
        :class="{ 'input-error': error }"
      >
      <p class="error" v-show="error">⚠️ Please enter your nickname</p>
    </div>
    <button class="btn primaryColor btn-lg play-btn" @click="goToGame">
      🎯 PLAY!
    </button>
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
      if(this.nickname.trim() !== ""){
        this.setNickname(this.nickname.trim());
        this.$router.push({
          name: 'Game',
        })
      }
      else{
        this.error = true;
        setTimeout(() => {
          this.error = false;
        }, 3000);
      }
    }
  }
}
</script>

<style scoped>
.mainLayout {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

input {
  background-color: var(--primary-color);
  color: var(--input-text-color);
  border-radius: 10px;
  text-align: center;
  padding: 15px 25px;
  font-size: 18px;
  border: 3px solid transparent;
  outline: none;
  transition: all 0.3s ease;
  min-width: 250px;
}

input:focus {
  border-color: var(--player-color);
  box-shadow: 0 0 15px rgba(21, 130, 230, 0.3);
}

input.input-error {
  border-color: var(--computer-color);
  animation: shake 0.5s ease;
}

.error {
  margin-top: 10px;
  font-size: 14px;
}

.play-btn {
  padding: 15px 50px;
  font-size: 20px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 20px rgba(214, 230, 21, 0.3);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
</style>