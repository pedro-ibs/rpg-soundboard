
function validateConfigurationFile(jsonData) {
	
	const minimalStructure = {
		id_counter: 0,
		sounds:     [	]
	}; 

	if (typeof jsonData !== 'object' || jsonData === null) {
		return minimalStructure;
	}

	if (!Array.isArray(jsonData.sounds)) {
		jsonData.sounds = [ ];
	}

	return jsonData;
}


function exportConfiguration( title, config ) {
	try {
		const jsonString = JSON.stringify(config, null, 2);
		const blob = new Blob([jsonString], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		
		const a = document.createElement('a');
		a.href = url;
		a.download = `${title}-${new Date().toISOString().split('T')[0]}.json`;
		
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		
		URL.revokeObjectURL(url);
		
		showSuccessAlert( "Configuração exportada com sucesso!" );
		
	} catch (error) {
		console.error('Erro ao exportar configurações:', error);
		alert('Erro ao exportar configurações!');
	}
}

function filterSoundByCategory(sounds, category) {
	return sounds.filter(sound => sound.category === category);
}

function filterSoundById(sounds, id) {
	return sounds.find(sound => sound.id == id);
}

function removeSoundById(sounds, sound_id) {
    return sounds.filter(sound => sound.id != sound_id);
}

function updateSoundById(sounds, id, updates) {
	const soundIndex = sounds.findIndex(sound => sound.id == id);

	if (soundIndex !== -1) {
		sounds[soundIndex] = { ...sounds[soundIndex], ...updates };
		return true;
	}

	return false;
}


function getAudioState(appState, soundId) {
	return appState.playingSounds.get(soundId) || appState.playingSounds.get(String(soundId)) || appState.playingSounds.get(Number(soundId));
}