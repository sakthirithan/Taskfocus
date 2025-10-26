// Audio alert system using Web Audio API
class AudioAlert {
  private audioContext: AudioContext | null = null;

  private getContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    const context = this.getContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration);
  }

  // Alert for break time - calming descending tones
  playBreakAlert() {
    this.playTone(800, 0.15);
    setTimeout(() => this.playTone(600, 0.15), 150);
    setTimeout(() => this.playTone(400, 0.3), 300);
  }

  // Alert for focus time - energetic ascending tones
  playFocusAlert() {
    this.playTone(400, 0.15);
    setTimeout(() => this.playTone(600, 0.15), 150);
    setTimeout(() => this.playTone(800, 0.3), 300);
  }

  // Alert for task completion - celebratory sequence
  playCompleteAlert() {
    this.playTone(523, 0.2); // C
    setTimeout(() => this.playTone(659, 0.2), 200); // E
    setTimeout(() => this.playTone(784, 0.4), 400); // G
  }
}

export const audioAlert = new AudioAlert();
