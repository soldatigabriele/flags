<template>
  <div class="flag-game">
    <div class="header">
      <h1>🏁 Flag Game! 🏁</h1>
      <div class="score">Score: {{ score }}</div>
    </div>

    <div class="game-container" v-if="!showCelebration && currentTarget">
      <!-- Question -->
      <div class="question">
        <h2>Find the flag of:</h2>
        <div class="target-country">{{ currentTarget.name }}</div>
      </div>

      <!-- Flags to choose from -->
      <div class="flags-container">
        <div 
          v-for="(flag, index) in currentOptions" 
          :key="index"
          class="flag-option"
          :class="{ 'selected': selectedFlag === index, 'shake': shakeWrong && selectedFlag === index }"
          @click="selectFlag(index)"
        >
          <div class="flag-emoji">{{ flag.emoji }}</div>
          <div class="flag-name">{{ flag.country }}</div>
        </div>
      </div>

      <!-- Feedback -->
      <div class="feedback" v-if="showFeedback">
        <div v-if="isCorrect" class="correct">
          🎉 Great job! 🎉
        </div>
        <div v-else class="incorrect">
          Try again! 💪
        </div>
      </div>

      <!-- Next button -->
      <button 
        v-if="isCorrect && showFeedback" 
        class="next-btn"
        @click="nextQuestion"
      >
        Next Flag! 🚀
      </button>
    </div>

    <!-- Celebration animation -->
    <div v-if="showCelebration" class="celebration">
      <div class="celebration-content">
        <div class="trophy">🏆</div>
        <h2>Amazing!</h2>
        <p>You got it right!</p>
        <div class="confetti">
          <div class="confetti-piece" v-for="n in 20" :key="n"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { FLAGS_CONFIG } from '../flags-config.js'

export default {
  name: 'FlagGame',
  data() {
    return {
      flags: FLAGS_CONFIG,
      currentTarget: null,
      currentOptions: [],
      correctIndex: 0,
      selectedFlag: null,
      isCorrect: false,
      showFeedback: false,
      showCelebration: false,
      shakeWrong: false,
      score: 0
    }
  },
  mounted() {
    this.generateQuestion()
  },
  methods: {
    generateQuestion() {
      // Reset state
      this.selectedFlag = null
      this.showFeedback = false
      this.showCelebration = false
      this.shakeWrong = false
      
      // Pick a random target flag
      this.currentTarget = this.flags[Math.floor(Math.random() * this.flags.length)]
      
      // Pick a random wrong flag
      let wrongFlag
      do {
        wrongFlag = this.flags[Math.floor(Math.random() * this.flags.length)]
      } while (wrongFlag.name === this.currentTarget.name)
      
      // Randomly place correct flag (left or right)
      this.correctIndex = Math.floor(Math.random() * 2)
      this.currentOptions = []
      
      if (this.correctIndex === 0) {
        this.currentOptions = [this.currentTarget, wrongFlag]
      } else {
        this.currentOptions = [wrongFlag, this.currentTarget]
      }
    },
    
    selectFlag(index) {
      if (this.showFeedback) return // Prevent multiple clicks
      
      this.selectedFlag = index
      this.isCorrect = index === this.correctIndex
      this.showFeedback = true
      
      if (this.isCorrect) {
        this.score++
        setTimeout(() => {
          this.showCelebration = true
          setTimeout(() => {
            this.showCelebration = false
          }, 2000)
        }, 500)
      } else {
        this.shakeWrong = true
        setTimeout(() => {
          this.shakeWrong = false
          this.showFeedback = false
          this.selectedFlag = null
        }, 1000)
      }
    },
    
    nextQuestion() {
      this.generateQuestion()
    }
  }
}
</script>

<style scoped>
.flag-game {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 2.5rem;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.score {
  font-size: 1.5rem;
  background: rgba(255,255,255,0.2);
  padding: 10px 20px;
  border-radius: 25px;
  display: inline-block;
  margin-top: 10px;
}

.game-container {
  text-align: center;
}

.question {
  margin-bottom: 40px;
}

.question h2 {
  font-size: 2rem;
  margin-bottom: 10px;
}

.target-country {
  font-size: 2.5rem;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  background: rgba(255,255,255,0.1);
  padding: 15px 30px;
  border-radius: 15px;
  display: inline-block;
}

.flags-container {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.flag-option {
  background: rgba(255,255,255,0.9);
  border-radius: 20px;
  padding: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 4px solid transparent;
  color: #333;
  min-width: 200px;
}

.flag-option:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  border-color: #FFD700;
}

.flag-option.selected {
  border-color: #4CAF50;
  background: rgba(255,255,255,1);
}

.flag-emoji {
  font-size: 5rem;
  margin-bottom: 15px;
}

.flag-name {
  font-size: 1.5rem;
  font-weight: bold;
}

.feedback {
  margin: 20px 0;
  font-size: 1.8rem;
  font-weight: bold;
}

.correct {
  color: #4CAF50;
  animation: bounce 0.6s ease;
}

.incorrect {
  color: #FF6B6B;
}

.shake {
  animation: shake 0.5s ease-in-out;
}

.next-btn {
  background: #FFD700;
  color: #333;
  border: none;
  padding: 15px 30px;
  font-size: 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  font-family: inherit;
}

.next-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.celebration {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.celebration-content {
  background: white;
  color: #333;
  padding: 50px;
  border-radius: 20px;
  text-align: center;
  position: relative;
  animation: celebrationPop 0.5s ease;
}

.trophy {
  font-size: 5rem;
  animation: bounce 1s infinite;
}

.celebration h2 {
  font-size: 3rem;
  margin: 20px 0;
  color: #FFD700;
}

.celebration p {
  font-size: 1.5rem;
}

.confetti {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.confetti-piece {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #FFD700;
  animation: confettiFall 2s ease-out infinite;
  left: 50%;
  top: 0;
}

.confetti-piece:nth-child(2n) {
  background: #FF6B6B;
  animation-delay: 0.2s;
  left: 20%;
}

.confetti-piece:nth-child(3n) {
  background: #4CAF50;
  animation-delay: 0.4s;
  left: 70%;
}

.confetti-piece:nth-child(4n) {
  background: #2196F3;
  animation-delay: 0.6s;
  left: 30%;
}

.confetti-piece:nth-child(5n) {
  background: #FFD700;
  animation-delay: 0.8s;
  left: 80%;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

@keyframes celebrationPop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes confettiFall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .flags-container {
    flex-direction: column;
    align-items: center;
  }
  
  .flag-option {
    min-width: 250px;
  }
  
  .target-country {
    font-size: 2rem;
    padding: 10px 20px;
  }
  
  .flag-emoji {
    font-size: 4rem;
  }
}
</style> 