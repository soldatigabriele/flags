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
          @mouseenter="onFlagHover"
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


    </div>

    <!-- Enhanced celebration animation with more visual rewards -->
    <div v-if="showCelebration" class="celebration" @click="nextQuestion">
      <div class="celebration-content">
        <div class="trophy">🏆</div>
        <div class="rainbow-stars">
          <div class="star" v-for="n in 12" :key="n">⭐</div>
        </div>
        <h2>Amazing!</h2>
        <p>You got it right!</p>
        <div class="celebration-animals">
          <div class="animal" v-for="animal in celebrationAnimals" :key="animal">{{ animal }}</div>
        </div>
        <div class="big-smiley">😄</div>
        <p class="click-hint">🖱️ Click anywhere to continue! 🖱️</p>
        <div class="confetti">
          <div class="confetti-piece" v-for="n in 30" :key="n"></div>
        </div>
        <div class="sparkles">
          <div class="sparkle" v-for="n in 15" :key="n">✨</div>
        </div>
      </div>
    </div>

    <!-- Stars that appear on correct answer -->
    <div v-if="showStars" class="floating-stars">
      <div class="floating-star" v-for="n in 8" :key="n">⭐</div>
    </div>

    <!-- Hearts that appear on hover -->
    <div v-if="showHearts" class="floating-hearts">
      <div class="floating-heart" v-for="n in 6" :key="n">💖</div>
    </div>

    <!-- Sound effects (hidden audio elements) -->
    <audio ref="correctSound" preload="auto">
      <source :src="correctSoundUrl" type="audio/mpeg">
    </audio>
    <audio ref="wrongSound" preload="auto">
      <source :src="wrongSoundUrl" type="audio/mpeg">
    </audio>
    <audio ref="celebrationSound" preload="auto">
      <source :src="celebrationSoundUrl" type="audio/mpeg">
    </audio>
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
      score: 0,
      showStars: false,
      showHearts: false,
      celebrationAnimals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸'],
      isProcessingAnswer: false,
      // Simple sound URLs using Web Audio API tones
      correctSoundUrl: this.createSoundUrl(), // C, E, G chord
      wrongSoundUrl: this.createSoundUrl(), // Low descending tones
      celebrationSoundUrl: this.createSoundUrl() // Victory fanfare
    }
  },
  mounted() {
    this.generateQuestion()
  },
  methods: {
    // Create simple sound effects using Web Audio API
    createSoundUrl() {
      // For now, return empty string as we'll use programmatic sounds
      return ''
    },

    playSound(type) {
      if (!window.AudioContext && !window.webkitAudioContext) return
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      if (type === 'correct') {
        // Play a happy chord progression
        this.playChord(audioContext, [523.25, 659.25, 783.99], 0.3)
      } else if (type === 'wrong') {
        // Play a gentle "try again" sound
        this.playDescendingTone(audioContext, [300, 250, 200], 0.2)
      } else if (type === 'celebration') {
        // Play victory fanfare
        this.playVictorySound(audioContext)
      }
    },

    playChord(audioContext, frequencies, duration) {
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
        
        oscillator.start(audioContext.currentTime + index * 0.1)
        oscillator.stop(audioContext.currentTime + duration + index * 0.1)
      })
    },

    playDescendingTone(audioContext, frequencies, duration) {
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.15)
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime + index * 0.15)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration + index * 0.15)
        
        oscillator.start(audioContext.currentTime + index * 0.15)
        oscillator.stop(audioContext.currentTime + duration + index * 0.15)
      })
    },

    playVictorySound(audioContext) {
      const melody = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50]
      melody.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.2)
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + index * 0.2)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3 + index * 0.2)
        
        oscillator.start(audioContext.currentTime + index * 0.2)
        oscillator.stop(audioContext.currentTime + 0.3 + index * 0.2)
      })
    },

    generateQuestion() {
      // Reset state
      this.selectedFlag = null
      this.showFeedback = false
      this.showCelebration = false
      this.shakeWrong = false
      this.showStars = false
      this.showHearts = false
      this.isProcessingAnswer = false
      
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
      if (this.showFeedback || this.isProcessingAnswer) return // Prevent multiple clicks
      
      this.selectedFlag = index
      this.isCorrect = index === this.correctIndex
      this.showFeedback = true
      this.isProcessingAnswer = true
      
      if (this.isCorrect) {
        this.score++
        
        // Play correct sound immediately
        this.playSound('correct')
        
        // Show floating stars
        this.showStars = true
        setTimeout(() => {
          this.showStars = false
        }, 2000)
        
        // Show celebration after a short delay
        setTimeout(() => {
          if (this.isProcessingAnswer) { // Only show if we're still processing
            this.showCelebration = true
            this.playSound('celebration')
            
            // Auto-hide celebration after 5 seconds as a fallback
            setTimeout(() => {
              if (this.showCelebration) {
                this.nextQuestion()
              }
            }, 5000)
          }
        }, 800)
      } else {
        // Play gentle "try again" sound
        this.playSound('wrong')
        
        this.shakeWrong = true
        setTimeout(() => {
          this.shakeWrong = false
          this.showFeedback = false
          this.selectedFlag = null
          this.isProcessingAnswer = false
        }, 1200) // Slightly longer for toddlers to process
      }
    },

    // Add hover effects for more interactivity
    onFlagHover() {
      this.showHearts = true
      setTimeout(() => {
        this.showHearts = false
      }, 1000)
    },
    
    nextQuestion() {
      // Only proceed if we're actually showing the celebration
      if (!this.showCelebration) return
      
      // Reset processing state
      this.isProcessingAnswer = false
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
  transform: translateY(-10px) scale(1.05);
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  border-color: #FFD700;
  animation: wiggle 0.5s ease-in-out;
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

/* Enhanced visual rewards for toddlers */
.rainbow-stars {
  display: flex;
  justify-content: center;
  margin: 20px 0;
  flex-wrap: wrap;
}

.star {
  font-size: 2rem;
  animation: rainbowSpin 1s ease-in-out infinite;
  margin: 5px;
}

.star:nth-child(2n) { animation-delay: 0.1s; }
.star:nth-child(3n) { animation-delay: 0.2s; }
.star:nth-child(4n) { animation-delay: 0.3s; }

.big-smiley {
  font-size: 4rem;
  animation: giggleBounce 0.5s ease-in-out infinite alternate;
  margin: 20px 0;
}

.celebration-animals {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin: 20px 0;
  gap: 10px;
}

.animal {
  font-size: 2.5rem;
  animation: animalDance 1s ease-in-out infinite;
  margin: 5px;
}

.animal:nth-child(2n) { animation-delay: 0.2s; }
.animal:nth-child(3n) { animation-delay: 0.4s; }
.animal:nth-child(4n) { animation-delay: 0.6s; }

.click-hint {
  font-size: 1.2rem;
  color: #666;
  margin: 15px 0;
  animation: pulse 1.5s ease-in-out infinite;
}

.sparkles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  font-size: 1.5rem;
  animation: sparkleFloat 2s ease-in-out infinite;
}

.sparkle:nth-child(odd) {
  left: 20%;
  animation-delay: 0.3s;
}

.sparkle:nth-child(even) {
  right: 20%;
  animation-delay: 0.6s;
}

.floating-stars {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

.floating-star {
  position: absolute;
  font-size: 3rem;
  animation: floatUp 2s ease-out forwards;
}

.floating-star:nth-child(1) { left: 10%; animation-delay: 0s; }
.floating-star:nth-child(2) { left: 20%; animation-delay: 0.2s; }
.floating-star:nth-child(3) { left: 30%; animation-delay: 0.4s; }
.floating-star:nth-child(4) { left: 40%; animation-delay: 0.6s; }
.floating-star:nth-child(5) { left: 50%; animation-delay: 0.8s; }
.floating-star:nth-child(6) { left: 60%; animation-delay: 1s; }
.floating-star:nth-child(7) { left: 70%; animation-delay: 1.2s; }
.floating-star:nth-child(8) { left: 80%; animation-delay: 1.4s; }

.floating-hearts {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 50;
}

.floating-heart {
  position: absolute;
  font-size: 2rem;
  animation: heartFloat 1s ease-out forwards;
}

.floating-heart:nth-child(1) { left: 15%; animation-delay: 0s; }
.floating-heart:nth-child(2) { left: 30%; animation-delay: 0.1s; }
.floating-heart:nth-child(3) { left: 45%; animation-delay: 0.2s; }
.floating-heart:nth-child(4) { left: 60%; animation-delay: 0.3s; }
.floating-heart:nth-child(5) { left: 75%; animation-delay: 0.4s; }
.floating-heart:nth-child(6) { left: 85%; animation-delay: 0.5s; }

@keyframes rainbowSpin {
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(90deg) scale(1.2); }
  50% { transform: rotate(180deg) scale(1); }
  75% { transform: rotate(270deg) scale(1.2); }
  100% { transform: rotate(360deg) scale(1); }
}

@keyframes giggleBounce {
  0% { transform: scale(1) rotate(-5deg); }
  100% { transform: scale(1.1) rotate(5deg); }
}

@keyframes sparkleFloat {
  0% {
    transform: translateY(0) scale(0);
    opacity: 0;
  }
  50% {
    transform: translateY(-50px) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) scale(0);
    opacity: 0;
  }
}

@keyframes floatUp {
  0% {
    bottom: -10%;
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  20% {
    transform: scale(1) rotate(72deg);
    opacity: 1;
  }
  100% {
    bottom: 110%;
    transform: scale(0.5) rotate(360deg);
    opacity: 0;
  }
}

@keyframes heartFloat {
  0% {
    bottom: 20%;
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    bottom: 80%;
    transform: scale(0.8);
    opacity: 0;
  }
}

@keyframes animalDance {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(-5deg); }
  50% { transform: scale(1.2) rotate(0deg); }
  75% { transform: scale(1.1) rotate(5deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes wiggle {
  0%, 100% { transform: translateY(-10px) scale(1.05) rotate(0deg); }
  25% { transform: translateY(-10px) scale(1.05) rotate(-2deg); }
  75% { transform: translateY(-10px) scale(1.05) rotate(2deg); }
}

/* Enhanced confetti with more colors and variety */
.confetti-piece:nth-child(6n) {
  background: #9C27B0;
  animation-delay: 1s;
  left: 10%;
}

.confetti-piece:nth-child(7n) {
  background: #FF9800;
  animation-delay: 1.2s;
  left: 60%;
}

.confetti-piece:nth-child(8n) {
  background: #E91E63;
  animation-delay: 1.4s;
  left: 40%;
}

/* Make celebration bigger and more exciting */
.celebration-content {
  background: linear-gradient(45deg, #FFD700, #FFA500, #FFD700);
  color: #333;
  padding: 60px;
  border-radius: 30px;
  text-align: center;
  position: relative;
  animation: celebrationPop 0.5s ease;
  border: 5px solid #FF6B6B;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
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