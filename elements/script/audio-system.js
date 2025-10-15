function createAudioSystem(appState, refreshAllCards, updateCurrentlyPlaying) {
	return {
		instances: new Map(),
		durations: new Map(),
		fadeIntervals: new Map(),

		play(soundId) {
			const sound = filterSoundById(appState.config.sounds, soundId);
			
			if (!sound) {
				console.error('Som não encontrado:', soundId);
				return;
			}
			
			// Se já existe uma instância e está pausada, apenas retoma com fade-in
			const existingAudio = this.instances.get(soundId);
			if (existingAudio && appState.playingSounds.get(soundId) === 'paused') {
				const targetVolume = sound.volume * appState.categoryVolumes[sound.category];
				this.applyFadeIn(existingAudio, targetVolume);
				
				existingAudio.play().then(() => {
					appState.playingSounds.set(soundId, 'playing');
					refreshAllCards();
					updateCurrentlyPlaying();
				}).catch(error => {
					console.error('Erro ao retomar áudio:', error);
				});
				return;
			}
			
			// Para qualquer instância anterior deste som
			this.stop(soundId);
			
			// Cria nova instância
			const audio = new Audio(`sounds/${sound.sound}`);
			const targetVolume = sound.volume * appState.categoryVolumes[sound.category];
			audio.loop = sound.loop;
			
			// Aplica fade-in na reprodução
			this.applyFadeIn(audio, targetVolume);
			
			// Quando os metadados são carregados (duração fica disponível)
			audio.onloadedmetadata = () => {
				this.durations.set(soundId, audio.duration);
			};
			
			// Atualiza o progresso continuamente
			audio.ontimeupdate = () => {
				this.updateProgress(soundId, audio.currentTime, audio.duration);
			};
			
			audio.play().then(() => {
				appState.playingSounds.set(soundId, 'playing');
				refreshAllCards();
				updateCurrentlyPlaying();
			}).catch(error => {
				console.error('Erro ao reproduzir áudio:', error);
				showErrorAlert(`Erro ao reproduzir "${sound.title}" - verifique se o arquivo existe na pasta sounds/`);
			});
			
			this.instances.set(soundId, audio);
			
			// Eventos para atualizar UI quando áudio terminar
			audio.onended = () => {
				if (!sound.loop) {
					appState.playingSounds.delete(soundId);
					refreshAllCards();
					updateCurrentlyPlaying();
				}
			};
			
			audio.onpause = () => {
				if (appState.playingSounds.get(soundId) === 'playing') {
					appState.playingSounds.set(soundId, 'paused');
					refreshAllCards();
					updateCurrentlyPlaying();
				}
			};
		},	

		pause(soundId) {
			const audio = this.instances.get(soundId);
			if (audio && !audio.paused) {
				// Aplica fade-out antes de pausar
				this.applyFadeOut(audio, 800, () => {
					audio.pause();
					appState.playingSounds.set(soundId, 'paused');
					refreshAllCards();
					updateCurrentlyPlaying();
				});
			}
		},

		stop(soundId) {
			const audio = this.instances.get(soundId);
			if (audio) {
				// Aplica fade-out antes de parar completamente
				this.applyFadeOut(audio, 800, () => {
					audio.pause();
					audio.currentTime = 0;
					this.instances.delete(soundId);

					const progressElement = document.getElementById(`id-sound-progress-${soundId}`);
					const timeElement = document.getElementById(`id-sound-time-${soundId}`);
					if (progressElement) progressElement.value = 0;
					if (timeElement) timeElement.textContent = '0:00 / 0:00';
			
					appState.playingSounds.delete(soundId);
					refreshAllCards();
					updateCurrentlyPlaying();
				});
			} else {
				// Se não há áudio, apenas limpa o estado
				const progressElement = document.getElementById(`id-sound-progress-${soundId}`);
				const timeElement = document.getElementById(`id-sound-time-${soundId}`);
				if (progressElement) progressElement.value = 0;
				if (timeElement) timeElement.textContent = '0:00 / 0:00';
		
				appState.playingSounds.delete(soundId);
				refreshAllCards();
				updateCurrentlyPlaying();
			}
		},
		
		// Controles em massa
		playAll() {
			const soundsToPlay = Array.from(appState.playingSounds.entries()).filter(([_, state]) => state === 'paused').map(([soundId]) => soundId);
			
			if( soundsToPlay.length ){
				soundsToPlay.forEach(soundId => {
					this.play(soundId);
				});
			}
		},

		pauseAll() {
			this.instances.forEach((audio, soundId) => {
				if (!audio.paused && appState.playingSounds.get(soundId) === 'playing') {
					this.pause(soundId);
				}
			});
		},

		stopAll() {
			const soundsToStop = Array.from(appState.playingSounds.keys());
			soundsToStop.forEach(soundId => {
				this.stop(soundId);
			});
		},
			
		updateProgress(soundId, currentTime, duration) {
			const progressElement = document.getElementById(`id-sound-progress-${soundId}`);
			const timeElement = document.getElementById(`id-sound-time-${soundId}`);
			
			if (progressElement && duration > 0) {
				const progress = (currentTime / duration) * 100;
				progressElement.value = progress;
				
				if (timeElement) {
					const currentTimeFormatted = this.formatTime(currentTime);
					const durationFormatted = this.formatTime(duration);
					timeElement.textContent = `${currentTimeFormatted} / ${durationFormatted}`;
				}
			}
		
			const trackProgressElement = document.getElementById(`id-track-progress-${soundId}`);
			const trackTimeElement = document.getElementById(`id-track-time-${soundId}`);
		
			if (trackProgressElement && duration > 0) {
				const progress = (currentTime / duration) * 100;
				trackProgressElement.value = progress;
				
				if (trackTimeElement) {
					const currentTimeFormatted = this.formatTime(currentTime);
					const durationFormatted = this.formatTime(duration);
					trackTimeElement.textContent = `${currentTimeFormatted} / ${durationFormatted}`;
				}
			}
		},

		// Função para formatar tempo (minutos:segundos)
		formatTime(seconds) {
			const mins = Math.floor(seconds / 60);
			const secs = Math.floor(seconds % 60);
			return `${mins}:${secs.toString().padStart(2, '0')}`;
		},

		setVolume(soundId, volume) {
			const audio = this.instances.get(soundId);
			if ( audio ) {
				const sound = filterSoundById(appState.config.sounds, soundId);
				audio.volume = volume * appState.categoryVolumes[sound.category];
				
				sound.volume = volume;
			}
		},

		// Atualizar volume por categoria
		updateCategoryVolume(category, volume) {
				appState.categoryVolumes[category] = volume;
			
				// Atualiza volume de todas as instâncias desta categoria
				this.instances.forEach((audio, soundId) => {
					const sound = filterSoundById(appState.config.sounds, soundId);
					if (sound && sound.category === category) {
						audio.volume = sound.volume * volume;
				}
			});
		},

		applyFadeIn(audio, targetVolume, duration = 1000) {
			const initialVolume = 0;
			audio.volume = initialVolume;
			
			const steps = 20;
			const stepTime = duration / steps;
			const volumeStep = targetVolume / steps;
			
			let currentStep = 0;
			
			// Limpa qualquer fade anterior
			if (this.fadeIntervals.has(audio)) {
				clearInterval(this.fadeIntervals.get(audio));
			}
			
			const fadeInterval = setInterval(() => {
				currentStep++;
				const newVolume = initialVolume + (volumeStep * currentStep);
				
				if (newVolume >= targetVolume || currentStep >= steps) {
					audio.volume = targetVolume;
					clearInterval(fadeInterval);
					this.fadeIntervals.delete(audio);
				} else {
					audio.volume = newVolume;
				}
			}, stepTime);
			
			this.fadeIntervals.set(audio, fadeInterval);
		},

		applyFadeOut(audio, duration = 1000, onComplete = null) {
			const initialVolume = audio.volume;
			
			const steps = 20;
			const stepTime = duration / steps;
			const volumeStep = initialVolume / steps;
			
			let currentStep = 0;
			
			// Limpa qualquer fade anterior
			if (this.fadeIntervals.has(audio)) {
				clearInterval(this.fadeIntervals.get(audio));
			}
			
			const fadeInterval = setInterval(() => {
				currentStep++;
				const newVolume = initialVolume - (volumeStep * currentStep);
				
				if (newVolume <= 0 || currentStep >= steps) {
					audio.volume = 0;
					clearInterval(fadeInterval);
					this.fadeIntervals.delete(audio);
					
					if (onComplete) {
						onComplete();
					}
				} else {
					audio.volume = newVolume;
				}
			}, stepTime);
			
			this.fadeIntervals.set(audio, fadeInterval);
		},

		cleanup() {
			this.fadeIntervals.forEach((interval, audio) => {
				clearInterval(interval);
			});
			this.fadeIntervals.clear();
		}


	};
}