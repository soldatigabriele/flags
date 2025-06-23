<template>
  <div class="flag-game">
    <div class="header">
      <h1>🏁 Flag Game! 🏁</h1>
      <div class="header-controls">
        <div class="score">Score: {{ score }}</div>
        <button class="settings-btn" @click="showSettings = true" title="Settings">
          ⚙️
        </button>
      </div>
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
          @touchstart="onFlagTouch(index)"
          @mouseenter="onFlagHover"
        >
          <div class="flag-emoji">{{ flag.emoji }}</div>
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

    <!-- Settings Modal -->
    <div v-if="showSettings" class="settings-modal" @click.self="closeSettings">
      <div class="settings-content">
        <div class="settings-header">
          <h2>⚙️ Game Settings</h2>
          <button class="close-btn" @click="closeSettings">✕</button>
        </div>
        
        <div class="settings-section">
          <h3>🏁 Select Flags for the Game</h3>
          <p class="settings-hint">Choose which flags you want to practice with:</p>
          
          <div class="flag-selection-controls">
            <button class="select-all-btn" @click="selectAllFlags">Select All</button>
            <button class="deselect-all-btn" @click="deselectAllFlags">Deselect All</button>
            <button class="popular-flags-btn" @click="selectPopularFlags">Popular Flags</button>
          </div>
          
          <div class="selected-count">
            {{ selectedFlagsCount }} of {{ allFlags.length }} flags selected
          </div>
          
          <div class="flags-grid">
            <div 
              v-for="flag in allFlags" 
              :key="flag.name"
              class="flag-checkbox"
              :class="{ 'selected': selectedFlags.includes(flag.name) }"
              @click="toggleFlag(flag.name)"
            >
              <input 
                type="checkbox" 
                :id="flag.name"
                :checked="selectedFlags.includes(flag.name)"
                @change="toggleFlag(flag.name)"
              >
              <label :for="flag.name">
                <span class="flag-emoji-small">{{ flag.emoji }}</span>
                <span class="flag-name-small">{{ flag.name }}</span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="settings-actions">
          <button class="save-btn" @click="saveSettings">💾 Save Settings</button>
          <button class="cancel-btn" @click="closeSettings">❌ Cancel</button>
        </div>
      </div>
    </div>

    <!-- Enhanced celebration animation with more visual rewards -->
    <div v-if="showCelebration" class="celebration" @click="nextQuestion" @touchstart="nextQuestion">
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
      allFlags: FLAGS_CONFIG,
      flags: [], // Will be populated from selected flags
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
      showSettings: false,
      selectedFlags: [], // Array of flag names that are selected
      // Simple sound URLs using Web Audio API tones
      correctSoundUrl: this.createSoundUrl(), // C, E, G chord
      wrongSoundUrl: this.createSoundUrl(), // Low descending tones
      celebrationSoundUrl: this.createSoundUrl() // Victory fanfare
    }
  },
  computed: {
    selectedFlagsCount() {
      return this.selectedFlags.length
    }
  },
  mounted() {
    this.loadSettings()
    this.generateQuestion()
  },
  methods: {
    // Load settings from localStorage
    loadSettings() {
      try {
        const savedFlags = localStorage.getItem('flagGame_selectedFlags')
        if (savedFlags) {
          this.selectedFlags = JSON.parse(savedFlags)
        } else {
          // Default to all flags if no settings saved
          this.selectedFlags = this.allFlags.map(flag => flag.name)
        }
        this.updateFlagsFromSelection()
      } catch (error) {
        console.error('Error loading settings:', error)
        // Fallback to all flags
        this.selectedFlags = this.allFlags.map(flag => flag.name)
        this.updateFlagsFromSelection()
      }
    },

    // Save settings to localStorage
    saveSettings() {
      try {
        localStorage.setItem('flagGame_selectedFlags', JSON.stringify(this.selectedFlags))
        this.updateFlagsFromSelection()
        this.closeSettings()
        // Show a brief success message
        this.showSaveSuccess = true
        setTimeout(() => {
          this.showSaveSuccess = false
        }, 2000)
      } catch (error) {
        console.error('Error saving settings:', error)
        alert('Failed to save settings. Please try again.')
      }
    },

    // Update the flags array based on selected flags
    updateFlagsFromSelection() {
      this.flags = this.allFlags.filter(flag => this.selectedFlags.includes(flag.name))
    },

    // Toggle a flag's selection
    toggleFlag(flagName) {
      const index = this.selectedFlags.indexOf(flagName)
      if (index > -1) {
        this.selectedFlags.splice(index, 1)
      } else {
        this.selectedFlags.push(flagName)
      }
    },

    // Select all flags
    selectAllFlags() {
      this.selectedFlags = this.allFlags.map(flag => flag.name)
    },

    // Deselect all flags
    deselectAllFlags() {
      this.selectedFlags = []
    },

    // Select popular flags (common countries)
    selectPopularFlags() {
      const popularCountries = [
        'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
        'France', 'Italy', 'Spain', 'Japan', 'China', 'Brazil', 'Mexico',
        'India', 'Russia', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
        'Switzerland', 'Austria', 'Belgium', 'Ireland', 'New Zealand'
      ]
      this.selectedFlags = this.allFlags
        .filter(flag => popularCountries.includes(flag.name))
        .map(flag => flag.name)
    },

    // Close settings modal
    closeSettings() {
      this.showSettings = false
      // Reset to saved selection if not saved
      this.loadSettings()
    },

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
      // Check if we have enough flags to play
      if (this.flags.length < 2) {
        alert('Please select at least 2 flags in settings to play the game!')
        this.showSettings = true
        return
      }

      // Reset state
      this.selectedFlag = null
      this.showFeedback = false
      this.showCelebration = false
      this.shakeWrong = false
      this.showStars = false
      this.showHearts = false
      this.isProcessingAnswer = false
      
      // Pick a random target flag from selected flags
      this.currentTarget = this.flags[Math.floor(Math.random() * this.flags.length)]
      
      // Pick a random wrong flag from selected flags
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
        
        // Show celebration immediately
        this.showCelebration = true
        this.playSound('celebration')
        
        // Auto-hide celebration after 5 seconds as a fallback
        setTimeout(() => {
          if (this.showCelebration) {
            this.nextQuestion()
          }
        }, 5000)
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

    // Touch event handler for better touch screen experience
    onFlagTouch(index) {
      // Prevent default touch behavior
      event.preventDefault()
      // Show hearts on touch
      this.onFlagHover()
      // Select flag
      this.selectFlag(index)
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
  /* Touch screen optimizations */
  touch-action: manipulation;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
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

.header-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 15px;
}

.score {
  font-size: 1.5rem;
  background: rgba(255,255,255,0.2);
  padding: 10px 20px;
  border-radius: 25px;
  display: inline-block;
}

.settings-btn {
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

/* Settings Modal Styles */
.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
}

.settings-content {
  background: white;
  color: #333;
  border-radius: 20px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: settingsPop 0.3s ease;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-radius: 20px 20px 0 0;
}

.settings-header h2 {
  margin: 0;
  font-size: 2rem;
}

.close-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.1);
}

.settings-section {
  padding: 30px;
}

.settings-section h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #667eea;
}

.settings-hint {
  color: #666;
  margin-bottom: 20px;
  font-size: 1rem;
}

.flag-selection-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.select-all-btn, .deselect-all-btn, .popular-flags-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.deselect-all-btn {
  background: #f44336;
}

.popular-flags-btn {
  background: #2196F3;
}

.select-all-btn:hover, .deselect-all-btn:hover, .popular-flags-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 3px 10px rgba(0,0,0,0.2);
}

.selected-count {
  background: #f0f0f0;
  padding: 10px 15px;
  border-radius: 15px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.flags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  border: 2px solid #f0f0f0;
  border-radius: 15px;
}

.flag-checkbox {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.flag-checkbox:hover {
  background: #f8f8f8;
  border-color: #667eea;
}

.flag-checkbox.selected {
  background: #e3f2fd;
  border-color: #2196F3;
}

.flag-checkbox input[type="checkbox"] {
  margin-right: 10px;
  transform: scale(1.2);
}

.flag-checkbox label {
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 100%;
}

.flag-emoji-small {
  font-size: 1.5rem;
  margin-right: 10px;
}

.flag-name-small {
  font-size: 0.9rem;
  font-weight: 500;
}

.settings-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  padding: 20px 30px;
  border-top: 2px solid #f0f0f0;
}

.save-btn, .cancel-btn {
  padding: 12px 25px;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.save-btn {
  background: #4CAF50;
  color: white;
}

.cancel-btn {
  background: #f44336;
  color: white;
}

.save-btn:hover, .cancel-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

@keyframes settingsPop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.game-container {
  text-align: center;
}

.question {
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question h2 {
  font-size: 2rem;
  margin-bottom: 10px;
  padding-right: 10px;
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
  padding: 40px; /* Larger padding for touch */
  cursor: pointer;
  transition: all 0.3s ease;
  border: 4px solid transparent;
  color: #333;
  min-width: 250px; /* Larger minimum width for touch */
  min-height: 200px; /* Minimum height for easy touching */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* Touch optimizations */
  touch-action: manipulation;
  -webkit-tap-highlight-color: rgba(255, 215, 0, 0.3);
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

.flag-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.flag-emoji {
  font-size: 6rem; /* Larger for better visibility on Pi screen */
  margin-bottom: 15px;
}

.flag-name {
  font-size: 1.8rem; /* Larger text for better readability */
  font-weight: bold;
  text-align: center;
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
    gap: 30px; /* Larger gap for touch screens */
  }
  
  .flag-option {
    min-width: 300px; /* Even larger for small touch screens */
    min-height: 220px;
  }
  
  .target-country {
    font-size: 2.2rem;
    padding: 15px 25px;
  }
  
  .flag-emoji {
    font-size: 5rem;
  }

  .settings-content {
    margin: 10px;
    max-height: 95vh;
  }

  .flags-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .flag-selection-controls {
    flex-direction: column;
  }
}

/* Mobile Landscape Optimizations */
@media (max-width: 768px) and (orientation: landscape) {
  .flag-game {
    padding: 10px;
    min-height: 100vh;
  }

  .header {
    margin-bottom: 15px;
  }

  .header h1 {
    font-size: 1.8rem;
    margin-bottom: 5px;
  }

  .header-controls {
    gap: 15px;
    margin-top: 10px;
  }

  .score {
    font-size: 1.2rem;
    padding: 8px 15px;
  }

  .settings-btn {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .question {
    margin-bottom: 20px;
  }

  .question h2 {
    font-size: 1.4rem;
    margin-bottom: 5px;
  }

  .target-country {
    font-size: 1.8rem;
    padding: 10px 20px;
  }

  .flags-container {
    flex-direction: row;
    gap: 20px;
    margin-bottom: 20px;
    justify-content: center;
  }

  .flag-option {
    min-width: 180px;
    min-height: 140px;
    padding: 20px;
    border-radius: 15px;
  }

  .flag-content {
    flex-direction: row;
    align-items: center;
    gap: 15px;
  }

  .flag-emoji {
    font-size: 3.5rem;
    margin-bottom: 0;
  }

  .flag-name {
    font-size: 1.2rem;
    text-align: left;
  }

  .feedback {
    margin: 15px 0;
    font-size: 1.4rem;
  }

  /* Settings Modal for Mobile Landscape */
  .settings-modal {
    padding: 10px;
  }

  .settings-content {
    max-height: 98vh;
    max-width: 95vw;
  }

  .settings-header {
    padding: 15px 20px;
  }

  .settings-header h2 {
    font-size: 1.5rem;
  }

  .close-btn {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }

  .settings-section {
    padding: 20px;
  }

  .settings-section h3 {
    font-size: 1.3rem;
  }

  .flag-selection-controls {
    flex-direction: row;
    gap: 8px;
    margin-bottom: 15px;
  }

  .select-all-btn, .deselect-all-btn, .popular-flags-btn {
    padding: 8px 12px;
    font-size: 0.8rem;
    border-radius: 15px;
  }

  .selected-count {
    padding: 8px 12px;
    font-size: 0.9rem;
    margin-bottom: 15px;
  }

  .flags-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
    max-height: 300px;
    padding: 8px;
  }

  .flag-checkbox {
    padding: 8px;
    border-radius: 8px;
  }

  .flag-emoji-small {
    font-size: 1.2rem;
    margin-right: 8px;
  }

  .flag-name-small {
    font-size: 0.8rem;
  }

  .flag-checkbox input[type="checkbox"] {
    transform: scale(1.3);
    margin-right: 8px;
  }

  .settings-actions {
    padding: 15px 20px;
    gap: 10px;
  }

  .save-btn, .cancel-btn {
    padding: 10px 20px;
    font-size: 1rem;
  }

  /* Celebration Modal for Mobile Landscape */
  .celebration {
    padding: 10px;
  }

  .celebration-content {
    padding: 20px;
    border-radius: 15px;
    max-width: 95vw;
    max-height: 90vh;
    overflow-y: auto;
  }

  .celebration h2 {
    font-size: 1.8rem;
    margin: 10px 0;
  }

  .celebration p {
    font-size: 1.1rem;
    margin: 8px 0;
  }

  .trophy {
    font-size: 2.5rem;
  }

  .big-smiley {
    font-size: 2.5rem;
    margin: 10px 0;
  }

  .click-hint {
    font-size: 0.9rem;
    margin: 8px 0;
  }

  .celebration-animals {
    margin: 10px 0;
    gap: 6px;
  }

  .animal {
    font-size: 1.8rem;
  }

  .rainbow-stars {
    margin: 10px 0;
  }

  .star {
    font-size: 1.3rem;
    margin: 2px;
  }

  .confetti {
    display: none; /* Hide confetti on mobile landscape for better performance */
  }

  .sparkles {
    display: none; /* Hide sparkles on mobile landscape */
  }
}

/* Raspberry Pi optimizations */
@media (max-width: 1024px) and (orientation: landscape) {
  .flag-game {
    padding: 15px;
  }
  
  .flags-container {
    gap: 50px; /* Extra space between flags for easy touching */
  }
  
  .flag-option {
    min-width: 280px;
    min-height: 200px;
    padding: 35px;
    /* Reduce animations for better Pi performance */
    transition: transform 0.2s ease, border-color 0.2s ease;
  }
  
  .flag-option:hover,
  .flag-option:active {
    transform: scale(1.02); /* Smaller scale for better performance */
  }
  
  /* Disable some heavy animations on Pi */
  .sparkle,
  .confetti-piece:nth-child(n+15) {
    display: none; /* Reduce confetti count for better performance */
  }
  
  /* Optimize celebration for Pi */
  .celebration-content {
    padding: 40px;
    /* Reduce shadow effects for better performance */
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
  }
}

/* Touch-specific styles */
@media (pointer: coarse) {
  .flag-option {
    min-height: 240px; /* Extra height for touch */
    padding: 45px;
  }
  
  .click-hint {
    font-size: 1.5rem; /* Larger hint text for touch screens */
    animation: none; /* Disable pulse on touch devices for performance */
    color: #333;
    font-weight: bold;
  }
  
  /* Larger touch targets */
  .celebration {
    cursor: pointer;
  }
  
  .celebration-content {
    min-height: 400px; /* Larger celebration area for easy touching */
  }

  .flag-checkbox {
    padding: 15px; /* Larger touch targets for checkboxes */
  }

  .flag-checkbox input[type="checkbox"] {
    transform: scale(1.5); /* Larger checkboxes for touch */
  }
}

/* Enhanced Mobile Landscape Touch Optimizations */
@media (max-width: 768px) and (orientation: landscape) and (pointer: coarse) {
  .flag-option {
    min-height: 120px;
    padding: 20px;
    /* Ensure minimum touch target size */
    min-width: 220px;
  }

  .flag-content {
    gap: 12px;
  }

  .flag-emoji {
    font-size: 3.2rem;
  }

  .flag-name {
    font-size: 1.1rem;
  }

  .settings-btn {
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
  }

  .flag-checkbox {
    padding: 12px;
    min-height: 50px; /* Ensure minimum touch target */
  }

  .flag-checkbox input[type="checkbox"] {
    transform: scale(1.4);
  }

  .select-all-btn, .deselect-all-btn, .popular-flags-btn {
    min-height: 44px; /* iOS minimum touch target */
    padding: 10px 15px;
  }

  .save-btn, .cancel-btn {
    min-height: 44px;
    padding: 12px 25px;
  }

  /* Improve scrolling in settings */
  .flags-grid {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }

  .flags-grid::-webkit-scrollbar {
    width: 6px;
  }

  .flags-grid::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .flags-grid::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  .flags-grid::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  /* Optimize floating elements for mobile */
  .floating-star {
    font-size: 2.5rem;
  }

  .floating-heart {
    font-size: 1.8rem;
  }

  /* Reduce animation complexity for better performance */
  .sparkle {
    display: none; /* Disable sparkles on mobile for better performance */
  }

  .confetti-piece:nth-child(n+10) {
    display: none; /* Reduce confetti count */
  }
}
</style> 