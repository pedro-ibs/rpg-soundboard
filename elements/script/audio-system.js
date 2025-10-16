

function createAudioSystem(appState, refreshAllCards, updateCurrentlyPlaying) {
	return {
		instances:	new Map(),
		durations:	new Map(),
		fadeIntervals:	new Map(),

		playlistSounds: [],
		currentPlaylistSoundId: null,
		isPlaylistPlaying: false,

		parseSoundIdSafely( soundId ) {
			if ( isNaN( soundId ) == true ){
				return null;
			}
			return parseInt( soundId );
		},

		areSomeSoundsPaused( ){
			return Array.from(appState.playingSounds.values()).some(state => state === 'paused');
		},

		areAnySoundsPlaying (){
			return Array.from(appState.playingSounds.values()).some(state => state === 'playing');
		},


		hasAnySounds( ){
			return ( this.areAnySoundsPlaying() || this.areSomeSoundsPaused() )
		},

		isSoundPaused(soundId) {
			return appState.playingSounds.get(soundId) === 'paused';
		},

		isSoundPlaying(soundId) {
			return appState.playingSounds.get(soundId) === 'playing';
		},

		isSoundStopped(soundId) {
			return appState.playingSounds.get(soundId) === 'stopped';
		},


		isSoundInPlayingList(soundId) {
			return appState.playingSounds.has( soundId );
		},


		createSoundInstance ( soundId, fileName ){
			console.log("Criar instância do som: ", soundId);
			const audio = new Audio(`sounds/${fileName}`);
			this.instances.set(soundId, audio);
		},

		deleteSoundInstance ( soundId ){
			console.log("Deletar instância do som: ", soundId );
			this.instances.delete( soundId );
		},

		refresIhm(){
			refreshAllCards();
			updateCurrentlyPlaying();

			this.instances.forEach((audio, soundId) => {
				console.log(`Progresso: soundId=${soundId}, estado=${appState.playingSounds.get(soundId)}`);
				this.updateProgress(soundId, audio.currentTime, audio.duration);
			});
		},

		play(soundId) {

			soundId = this.parseSoundIdSafely(soundId);
			if( soundId == null ){
				console.error('Id do som imvalido:', soundId);
				return;
			}
			
			const sound = filterSoundById(appState.config.sounds, soundId);
			
			if (!sound) {
				console.error('Som não encontrado:', soundId);
				return;
			}
			
			const instencedSound = this.instances.get( soundId );

			if( !instencedSound ){
				console.log("Som não está instanciado");
				this.createSoundInstance(soundId, sound.sound);
			}

			const audio = this.instances.get( soundId );

			// Se um som já estiver tocando, ele reinicia
			if ( this.isSoundPlaying( soundId ) == true ){
				console.log(`Reiniciando Som ${soundId}`);
				audio.currentTime = 0;
			}

			const targetVolume	= sound.volume * appState.categoryVolumes[sound.category];
			audio.loop		= sound.loop;
			audio.volume 		= 0;

			audio.onloadedmetadata = () => {
				this.durations.set(soundId, audio.duration);
			};

			audio.ontimeupdate = () => {
				this.updateProgress(soundId, audio.currentTime, audio.duration);
			};

			audio.onended = () => {
				console.log(`Áudio ${soundId} terminou de tocar`);
				
				if (sound.loop) {
					console.log(`Reiniciando áudio ${soundId} (loop ativo)`);
					audio.currentTime = 0;
					audio.play().then(() => {
					appState.playingSounds.set(soundId, 'playing');
						this.refresIhm();
					}).catch(error => {
						console.error('Erro ao reiniciar áudio em loop:', error);
					});
				} else {
					console.log(`Parando áudio ${soundId} (loop inativo)`);
					this.stop(soundId);
				}
			};

			console.log("Tocar som: ", soundId);
			audio.play().then( () =>  {
				appState.playingSounds.set(soundId, 'playing');

				this.applyFadeIn(audio, targetVolume);
				this.instances.set(soundId, audio);
				this.refresIhm();

			}).catch(error => {
				console.error('Erro ao reproduzir áudio:', error);
				showErrorAlert(`Erro ao reproduzir "${sound.title}" - verifique se o arquivo existe na pasta sounds/`);
			});

			this.instances.set(soundId, audio);
		},	

		pause(soundId) {

			soundId = this.parseSoundIdSafely(soundId);
			if( soundId == null ){
				console.error('Id do som imvalido:', soundId);
				return;
			}
			
			const sound = filterSoundById(appState.config.sounds, soundId);
			
			if (!sound) {
				console.error('Som não encontrado:', soundId);
				return;
			}

			const audio = this.instances.get( soundId );

			if( !audio ){
				return;
			}
			
			if ( this.isSoundPaused( soundId ) ){
				console.log(  'O som Já está pausado:', soundId);
				return
			}
			
			if ( this.isSoundPlaying( soundId ) == false ){
				console.log(  'O som não está tocando:', soundId);
				return			
			}

			this.applyFadeOut(audio, 800, () => {
				console.log("Pausar som: ", soundId);
				audio.pause();
				appState.playingSounds.set(soundId, 'paused');
				this.refresIhm();
			});
		},

		stop(soundId) {

			soundId = this.parseSoundIdSafely(soundId);
			if( soundId == null ){
				console.error('Id do som imvalido:', soundId);
				return;
			}
			
			const sound = filterSoundById(appState.config.sounds, soundId);
			
			if (!sound) {
				console.error('Som não encontrado:', soundId);
				return;
			}

			const audio = this.instances.get( soundId );

			if( !audio ){
				return;
			}

			if ( this.isSoundInPlayingList( soundId ) == false ){
				console.log(  'O som não está tocando ou pausado:', soundId);
				return			
			}
			

			this.applyFadeOut(audio, 800, () => {

				console.log("Parando: ", soundId);

				appState.playingSounds.set(soundId, 'stopped');

				audio.pause();
				audio.currentTime = 0;
				this.instances.delete( soundId )

				const progressElement = document.getElementById(`id-sound-progress-${soundId}`);
				if (progressElement) progressElement.value	= 0;

				const timeElement				= document.getElementById(`id-sound-time-${soundId}`);
				if (timeElement) timeElement.textContent	= '0:00 / 0:00';

				this.refresIhm();
			});
		},
		
		// Controles em massa
		playAll() {

			if( this.areSomeSoundsPaused() == false ){
				showWarningAlert("Nehum audio <strong>pausado</strong> no momento!");
				return;
			}

			const soundsToPlay = Array.from(appState.playingSounds.entries()).filter(([_, state]) => state === 'paused').map(([soundId]) => soundId);
			
			if( soundsToPlay.length ){
				soundsToPlay.forEach(soundId => {
					this.play(soundId);
				});
			}
		},

		pauseAll() {

			if( this.areAnySoundsPlaying() == false ){
				showWarningAlert("Nehum audio <strong>tocando</strong> no momento!");
				return
			}

			this.instances.forEach((audio, soundId) => {
				if (!audio.paused && appState.playingSounds.get(soundId) === 'playing') {
					this.pause(soundId);
				}
			});
		},

		stopAll() {

			if( this.hasAnySounds() == false ){
				showWarningAlert("Nehum audio <strong>tocando</strong> ou <strong>pausado</strong> no momento!");
				return;
			}
			
			const soundsToStop = Array.from(appState.playingSounds.keys());

			soundsToStop.forEach(soundId => {
				this.stop(soundId);
			});
		},

		aadSoundInPlaylist(soundId, added) {
			soundId = this.parseSoundIdSafely(soundId);
			if (soundId === null) return;

			if (added) {
				if (!this.playlistSounds.includes(soundId)) {
					this.playlistSounds.push(soundId);
					this.refresIhm();
					console.log(`Som ${soundId} adicionado à playlist`);
				}
			} else {

				const index = this.playlistSounds.indexOf(soundId);
				
				console.log(`Som removido ${soundId}, som tocando atual ${this.currentPlaylistSoundId}`);
				
				// Remove o som da playlist
				this.playlistSounds.splice(index, 1);
				console.log(`Som ${soundId} removido da playlist`);
				
				// Se o som removido era o atual da playlist, avança para o próximo
				if (this.currentPlaylistSoundId === soundId) {
					console.log("Som atual removido, avançando para próximo");
					this.nextInPlaylist();
				}

				// caso não tenha mais sons na playliste pare 
				if (this.playlistSounds.length === 0) {
					this.currentPlaylistSoundId = soundId;
					this.stopPlaylist();
				}

			}
		},

		generatePlaylist() {
			if (this.playlistSounds.length === 0) {
				console.log("Nenhum som na playlist para gerar");
				return;
			}
			
			this.currentPlaylistSoundId = this.playlistSounds[0];

			console.log("Playlist gerada com", this.playlistSounds.length, "sons na ordem original");
		},

		playPlaylist() {
			if (this.playlistSounds.length === 0) {
				showWarningAlert("Nenhum som na playlist! Adicione sons usando o ícone de lista de música.");
				return;
			}

			// Se não há playlist gerada ou o som atual não existe mais, gera uma nova
			if (this.currentPlaylistSoundId === null || !this.playlistSounds.includes(this.currentPlaylistSoundId)) {
				this.generatePlaylist();
			}

			this.isPlaylistPlaying = true;
			this.playCurrentPlaylistSound();
		},


		playCurrentPlaylistSound() {
			if (!this.isPlaylistPlaying || this.currentPlaylistSoundId === null) {
				return;
			}

			const sound = filterSoundById(appState.config.sounds, this.currentPlaylistSoundId);
			
			if (!sound) {
				console.error("Som da playlist não encontrado:", this.currentPlaylistSoundId);
				this.nextInPlaylist();
				return;
			}
		
			this.play(this.currentPlaylistSoundId);
		},


		nextInPlaylist() {
			if (!this.isPlaylistPlaying || this.playlistSounds.length === 0) {
				showWarningAlert("Nenhuma playlist tocando!");
				return;
			}

			// Para o som atual
			if (this.currentPlaylistSoundId !== null) {
				this.stop(this.currentPlaylistSoundId);
			}

			// Encontra o índice atual
			const currentIndex = this.playlistSounds.indexOf(this.currentPlaylistSoundId);
			let nextIndex;
			
			// Se não encontrou o atual ou é o último, vai para o primeiro
			if (currentIndex === -1 || currentIndex >= this.playlistSounds.length - 1) {
				nextIndex = 0;
			} else {
				nextIndex = currentIndex + 1;
			}

			// Define o próximo som
			this.currentPlaylistSoundId = this.playlistSounds[nextIndex];
			
			// Toca o próximo som
			this.playCurrentPlaylistSound();
		},
		
		stopPlaylist() {
			this.isPlaylistPlaying = false;
			
			// Para o som atual se estiver tocando
			if (this.currentPlaylistSoundId !== null) {
				this.stop(this.currentPlaylistSoundId);
			}
			
			this.currentPlaylistSoundId = null;
			console.log("Playlist parada");
		},

		updateProgress(soundId, currentTime, duration) {
			const progressElement	= document.getElementById(`id-sound-progress-${soundId}`);
			const timeElement 	= document.getElementById(`id-sound-time-${soundId}`);
			
			if (progressElement && duration > 0) {
				const progress		= (currentTime / duration) * 100;
				progressElement.value	= progress;
				
				if (timeElement) {
					const currentTimeFormatted	= this.formatTime(currentTime);
					const durationFormatted		= this.formatTime(duration);
					timeElement.textContent		= `${currentTimeFormatted} / ${durationFormatted}`;
				}
			}
		
			const trackProgressElement	= document.getElementById(`id-track-progress-${soundId}`);
			const trackTimeElement		= document.getElementById(`id-track-time-${soundId}`);
		
			if (trackProgressElement && duration > 0) {
				const progress = (currentTime / duration) * 100;
				trackProgressElement.value = progress;
				
				if (trackTimeElement) {
					const currentTimeFormatted	= this.formatTime(currentTime);
					const durationFormatted		= this.formatTime(duration);
					trackTimeElement.textContent	= `${currentTimeFormatted} / ${durationFormatted}`;
				}
			}
		},


		formatTime(seconds) {
			const mins = Math.floor(seconds / 60);
			const secs = Math.floor(seconds % 60);
			return `${mins}:${secs.toString().padStart(2, '0')}`;
		},

		setVolume(soundId, volume) {


			soundId = this.parseSoundIdSafely(soundId);
			if( soundId == null ){
				console.error('Id do som imvalido:', soundId);
				return;
			}
			
			const sound = filterSoundById(appState.config.sounds, soundId);
			
			if (!sound) {
				console.error('Som não encontrado:', soundId);
				return;
			}

			const audio = this.instances.get( soundId );
 
			if( !audio ){
				return;
			}

			sound.volume = volume;
			audio.volume = volume * appState.categoryVolumes[sound.category];

			console.log(`Volume do som para ${volume}`) 
		},

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
			const initialVolume	= 0;
			audio.volume		= initialVolume;
			
			const steps		= 20;
			const stepTime		= duration / steps;
			const volumeStep	= targetVolume / steps;
			
			let currentStep		= 0;
			
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
			
			const steps		= 20;
			const stepTime		= duration / steps;
			const volumeStep	= initialVolume / steps;
			
			let currentStep		= 0;
			
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
			this.fadeIntervals.forEach((interval) => clearInterval(interval));
			this.fadeIntervals.clear();
			
			// Parar todas as instâncias de áudio
			this.instances.forEach((audio, soundId) => {
				audio.pause();
				audio.src = '';
				audio.load();
			});
			this.instances.clear();
		}


	};
}