function createAudioSystem(appState, refreshAllCards, updateCurrentlyPlaying) {
	return {
		instances: new Map(),
		durations: new Map(),

		// play(soundId) {
		// 	const sound = filterSoundById(appState.config.sounds, soundId);
			
		// 	if (!sound) {
		// 		console.error('Som não encontrado:', soundId);
		// 		return;
		// 	}
			
		// 	// Se já existe uma instância e está pausada, apenas retoma
		// 	const existingAudio = this.instances.get(soundId);
		// 	if (existingAudio && appState.playingSounds.get(soundId) === 'paused') {
		// 		existingAudio.play().then(() => {
		// 			appState.playingSounds.set(soundId, 'playing');
		// 			refreshAllCards();
		// 			updateCurrentlyPlaying();
		// 		}).catch(error => {
		// 			console.error('Erro ao retomar áudio:', error);
		// 		});
		// 		return;
		// 	}
			
		// 	// Para qualquer instância anterior deste som
		// 	this.stop(soundId);
			
		// 	// Cria nova instância
		// 	const audio 	= new Audio(`sounds/${sound.sound}`);
		// 	audio.volume	= sound.volume * appState.categoryVolumes[sound.category];
		// 	audio.loop 	= sound.loop;
			
		// 	audio.play().then(() => {
		// 		appState.playingSounds.set(soundId, 'playing');
		// 		refreshAllCards();
		// 		updateCurrentlyPlaying();
		// 	}).catch(error => {
		// 		console.error('Erro ao reproduzir áudio:', error);
		// 		showErrorAlert(`Erro ao reproduzir "${sound.title}" - verifique se o arquivo existe na pasta sounds/`);
		// 	});
			
		// 	this.instances.set(soundId, audio);
			
		// 	// Eventos para atualizar UI quando áudio terminar
		// 	audio.onended = () => {
		// 		if (!sound.loop) {
		// 			appState.playingSounds.delete(soundId);
		// 			refreshAllCards();
		// 			updateCurrentlyPlaying();
		// 		}
		// 	};
			
		// 	audio.onpause = () => {
		// 		if (appState.playingSounds.get(soundId) === 'playing') {
		// 			appState.playingSounds.set(soundId, 'paused');
		// 			refreshAllCards();
		// 			updateCurrentlyPlaying();
		// 		}
		// 	};
		// },

		play(soundId) {
			const sound = filterSoundById(appState.config.sounds, soundId);
			
			if (!sound) {
				console.error('Som não encontrado:', soundId);
				return;
			}
			
			// Se já existe uma instância e está pausada, apenas retoma
			const existingAudio = this.instances.get(soundId);
			if (existingAudio && appState.playingSounds.get(soundId) === 'paused') {
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
			audio.volume = sound.volume * appState.categoryVolumes[sound.category];
			audio.loop = sound.loop;
			
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
				audio.pause();
				appState.playingSounds.set(soundId, 'paused');
				refreshAllCards();
				updateCurrentlyPlaying();
			}
		},

		stop(soundId) {
			const audio = this.instances.get(soundId);
			if (audio) {
				audio.pause();
				audio.currentTime = 0;
				this.instances.delete(soundId);
			}


			const progressElement = document.getElementById(`id-sound-progress-${soundId}`);
			const timeElement = document.getElementById(`id-sound-time-${soundId}`);
			if (progressElement) progressElement.value = 0;
			if (timeElement) timeElement.textContent = '0:00 / 0:00';
	
			appState.playingSounds.delete(soundId);
			refreshAllCards();
			updateCurrentlyPlaying();
		},
		
		setVolume(soundId, volume) {
			const audio = this.instances.get(soundId);
			if ( audio ) {
				const sound = filterSoundById(appState.config.sounds, soundId);
				audio.volume = volume * appState.categoryVolumes[sound.category];
				
				sound.volume = volume;
			}
		},
		
		// Controles em massa
		playAll() {
			// Pega apenas os sons que estão no estado 'paused' ou no mapa de playingSounds
			const soundsToPlay = Array.from(appState.playingSounds.entries()).filter(([_, state]) => state === 'paused').map(([soundId]) => soundId);
			

			// Se há sons pausados, apenas retoma eles
			if( soundsToPlay.length ){
				soundsToPlay.forEach(soundId => {
					this.play(soundId);
				});
				
			}
		},

		pauseAll() {
			// Pausa apenas os sons que estão tocando
			this.instances.forEach((audio, soundId) => {
				if (!audio.paused && appState.playingSounds.get(soundId) === 'playing') {
					this.pause(soundId);
				}
			});
		},

		stopAll() {
			// Para apenas os sons que estão tocando ou pausados
			const soundsToStop = Array.from(appState.playingSounds.keys());
			soundsToStop.forEach(soundId => {
				this.stop(soundId);
			});
		},
			
		updateProgress(soundId, currentTime, duration) {
			// Atualiza progresso nos cards
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
		
			// Atualiza progresso no painel "Faixas Tocando"
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
		}
	};
}