/**
 * This file generates a simple audio buffer with a synthesized melody
 * that can be used for the music visualizer without requiring external files
 */

// Function to generate a simple melody using Web Audio API
export function generateSampleMusic(audioContext) {
  // Create an audio buffer for a 10-second melody
  const sampleRate = audioContext.sampleRate;
  const duration = 10;
  const bufferSize = sampleRate * duration;
  const audioBuffer = audioContext.createBuffer(2, bufferSize, sampleRate);
  
  // Get the audio data for left and right channels
  const leftChannel = audioBuffer.getChannelData(0);
  const rightChannel = audioBuffer.getChannelData(1);
  
  // Define some notes (frequencies in Hz)
  const notes = [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    349.23, // F4
    392.00, // G4
    440.00, // A4
    493.88, // B4
    523.25  // C5
  ];
  
  // Create a simple melody pattern
  const melodyPattern = [0, 2, 4, 5, 4, 2, 0, 0, 2, 4, 5, 7, 5, 4, 2, 0];
  const noteDuration = 0.25; // quarter notes
  
  // Fill the audio buffer with the melody
  for (let i = 0; i < melodyPattern.length; i++) {
    const noteIndex = melodyPattern[i];
    const frequency = notes[noteIndex];
    const startSample = Math.floor(i * noteDuration * sampleRate);
    const endSample = Math.floor((i + 1) * noteDuration * sampleRate);
    
    // Generate a sine wave for this note
    for (let j = startSample; j < endSample; j++) {
      // Apply envelope to avoid clicks
      let envelope = 1;
      const notePosition = (j - startSample) / (endSample - startSample);
      
      // Simple ADSR envelope
      if (notePosition < 0.1) {
        // Attack
        envelope = notePosition / 0.1;
      } else if (notePosition > 0.8) {
        // Release
        envelope = (1 - notePosition) / 0.2;
      }
      
      // Generate the waveform
      const sampleTime = j / sampleRate;
      const sampleValue = Math.sin(2 * Math.PI * frequency * sampleTime) * 0.5 * envelope;
      
      // Add some harmonics for a richer sound
      const harmonic1 = Math.sin(2 * Math.PI * frequency * 2 * sampleTime) * 0.25 * envelope;
      const harmonic2 = Math.sin(2 * Math.PI * frequency * 3 * sampleTime) * 0.125 * envelope;
      
      // Combine the fundamental and harmonics
      const finalSample = sampleValue + harmonic1 + harmonic2;
      
      // Write to both channels
      if (j < bufferSize) {
        leftChannel[j] = finalSample;
        rightChannel[j] = finalSample;
      }
    }
  }
  
  // Create a loop by repeating the pattern
  for (let i = melodyPattern.length * noteDuration * sampleRate; i < bufferSize; i++) {
    const repeatIndex = i % Math.floor(melodyPattern.length * noteDuration * sampleRate);
    leftChannel[i] = leftChannel[repeatIndex];
    rightChannel[i] = rightChannel[repeatIndex];
  }
  
  return audioBuffer;
}

// Function to create an audio source from the generated buffer
export function createAudioSource(audioContext, audioBuffer) {
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.loop = true;
  return source;
}
