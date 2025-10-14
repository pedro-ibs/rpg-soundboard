
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



function buildCard( sound, html_body ){
	const template = `<div class="music-card m-3 col-3 col-md-4 col-sm-10" id="id-sound-content-${sound.id}">
		${html_body}
	</div>`;

	return template;
}


function renderCard( container_id, sound_array ){

	const container = document.getElementById( container_id );
	container.innerHTML = "";

	sound_array.forEach(sound => {
		container.innerHTML = container.innerHTML + buildCard(sound, buildCardBody(sound) );
	});


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

function handleEvent(target_id, prefix, callback ) {
	if ( target_id.startsWith( prefix ) == false ) return;
	console.log(`target event: ${target_id}`);
	callback(target_id);	
}