
function showModelCard( target_id  ){

   	const element = document.getElementById(target_id);
        const modal = bootstrap.Modal.getInstance(element) || new bootstrap.Modal(element);
	modal.show();
}


function hideModelCard( target_id  ){
   	const element = document.getElementById(target_id);
        const modal = bootstrap.Modal.getInstance(element) || new bootstrap.Modal(element);
        modal.hide();
}

function renderModelCard( target_id, model_id, title, html_body ){

   	const element = document.getElementById(target_id);

	const template = `<div class="modal fade" id="${model_id}" tabindex="-1" aria-labelledby="${model_id}-label" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<h5 class="modal-title" id="${model_id}-label">${title}</h5>
				</div>

				<div class="modal-body">
					${html_body}
				</div>
			</div>
		</div>
	</div>`;

	element.innerHTML = element.innerHTML + template;
}

function buildCardBody( sound ){
	const template = `<h5>${sound.title}</h5>
	
	<div class="control-buttons btn-group mb-2">
		<button class="btn btn-sm btn-success resume-btn" id="id-sound-event-play-${sound.id}">
			<i class="bi bi-play"></i> 
		</button>
		<button class="btn btn-sm btn-info pause-btn" id="id-sound-event-pause-${sound.id}">
			<i class="bi bi-pause"></i> 
		</button>
		<button class="btn btn-sm btn-danger stop-btn" id="id-sound-event-stop-${sound.id}">
			<i class="bi bi-stop"></i> 
		</button>
	</div>
	
	<div class="audio-progress mb-2">
		<div class="d-flex justify-content-between align-items-center mb-1">
			<small id="id-sound-time-${sound.id}">0:00 / 0:00</small>
		</div>
		<progress 
			class="form-range" 
			id="id-sound-progress-${sound.id}" 
			value="0" 
			max="100" 
			style="width: 100%; height: 6px;"
		></progress>
	</div>

	<div class="d-flex align-self-start mb-2">
		<i class="bi bi-volume-up-fill m-2"></i>
		<input type="range" class="volume-control m-2" min="0" max="1" step="0.01" value="${sound.volume}" id="id-sound-event-volume-${sound.id}">
	</div>
	
	<div class="loop-toggle mb-2">
		<input class="form-check-input loop-checkbox" type="checkbox" ${sound.loop ? 'checked' : ''}  id="id-sound-event-loop-${sound.id}" >
		<label class="form-check-label"> <i class="bi bi-repeat"></i> Repetir</label>
	</div>

	
	<div class="card-actions mt-4">
		<button class="btn btn-sm btn-warning edit-card" id="id-sound-event-edit-${sound.id}">
			<i class="bi bi-pencil"></i> Editar
		</button>
		<button class="btn btn-sm btn-danger delete-card" id="id-sound-event-remove-${sound.id}">
			<i class="bi bi-trash"></i> Excluir
		</button>
	</div>`;

	return template;
}



function buildCard( sound, html_body, appState ){

	const audioState = appState.playingSounds.get( String(sound.id) );
	let stateClass = '';
	
	if (audioState == 'playing') {
		stateClass = 'playing';
	} else if (audioState == 'paused') {
		stateClass = 'paused';
	}
	
	const template = `<div class="music-card m-3 col-3 col-md-4 col-sm-10 ${stateClass}" id="id-sound-content-${sound.id}">
		${html_body}
	</div>`;

	return template;

}


function renderCard( container_id, sound_array, appState ){

	const container = document.getElementById( container_id );
	container.innerHTML = "";

	sound_array.forEach(sound => {
		container.innerHTML = container.innerHTML + buildCard(sound, buildCardBody(sound), appState );
	});


}



function handleEvent(target_id, prefix, callback ) {
	if (!target_id || !target_id.startsWith(prefix)) return;
	console.log(`target event: ${target_id}`);
	callback(target_id);	
}


function updateCurrentlyPlaying() {
	const container = document.getElementById('current-tracks');
	const playingSounds = Array.from(appState.playingSounds.entries()).filter(([_, state]) => state === 'playing' || state === 'paused');
		
	if (playingSounds.length === 0) {
		container.innerHTML = '<p class="mb-0 text-muted">Nenhuma faixa tocando</p>';
		return;
	}
    
	let html = '';
	playingSounds.forEach(([soundId, state]) => {
		const sound = filterSoundById(appState.config.sounds, soundId);
		if (sound) {
			html += `<div class="track-item">
				<span>${sound.title}</span>
				<div class="track-controls">
					<span class="badge ${state === 'playing' ? 'bg-success' : 'bg-warning'}">
						${state === 'playing' ? '▶️ Tocando' : '⏸️ Pausada'}
					</span>
					<button class="btn btn-sm btn-outline-secondary" onclick="audioSystem.stop(${soundId})">
						<i class="bi bi-x"></i>
					</button>
				</div>
			</div>`;
		}
	});

	container.innerHTML = html;
}


function rendeCategory( target_id, content_id, title ){
	const html = `<div id="id-content-category-${content_id}" class="mb-5">
		<div class="category border-bottom d-flex justify-content-between">
			<h3 class="category-title m-2" >${title}</h3>
			<div class="d-flex align-self-start m-2">
				<i class="bi bi-volume-up-fill m-2"></i>
				<input type="range" class="volume-control m-2" min="0" max="1" step="0.01" value="1.00" id="id-category-event-volume-${content_id}">
			</div>
		</div>
		<div class="row d-flex flex-md-row flex-sm-column justify-content-center align-items-center mt-3" id="id-content-category-${content_id}-cards">
			<!-- onde os cards devem ser rinderizados -->
		</div>
	</div>`;

	document.getElementById(target_id).innerHTML += html;
}