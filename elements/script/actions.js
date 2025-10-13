
function showModelCard( element_id  ){

   	const element = document.getElementById(element_id);
        const modal = bootstrap.Modal.getInstance(element) || new bootstrap.Modal(element);
	modal.show();
}


function hideModelCard( element_id  ){
   	const element = document.getElementById(element_id);
        const modal = bootstrap.Modal.getInstance(element) || new bootstrap.Modal(element);
        modal.hide();
}


function formListener( form_id, exec  ){

	const form = document.getElementById( form_id );
	
	form.addEventListener('submit', function(event) {
	
		event.preventDefault()
		event.stopPropagation()

		if (!form.checkValidity()) {
			return;
		}
		
		form.classList.add('was-validated')
	
		exec()	
	}, false);

	return form;
}




function renderProfileButtons(container_id, profiles) {

	const container = document.getElementById( container_id );
	container.innerHTML = "";

	profiles.forEach(element => {
		let template = `<li class="nav-item" role="presentation"><button class="nav-link" id="id-profile-tab-btn-${ element.name.toLowerCase() }" data-bs-toggle="pill" data-bs-target="#id-profile-tab-content-${ element.name.toLowerCase() }" type="button" role="tab" aria-controls="pills-all" aria-selected="true"><i class="bi bi-music-note-list"></i>${ element.name }</button></li>`;
		container.innerHTML = container.innerHTML + template;
	});
}


function renderProfileContent(container_id, profiles/*, category*/) {
	
	const container = document.getElementById( container_id );
	container.innerHTML = "";
	
	profiles.forEach(element => {

		let template = `<div class="tab-pane fade show" id="id-profile-tab-content-${ element.name.toLowerCase() }" role="tabpanel" aria-labelledby="pills-all-tab">
			<div class="tab-content p-3">
				<div class="d-flex align-self-start mb-5">
					<i class="bi bi-volume-up-fill m-2"></i>
					<input type="range" class="volume-control m-2" min="0" max="1" step="0.01" value="${ element.volume }" id="id-profile-tab-content-${ element.name.toLowerCase() }-volume">
				</div>

				<div id="id-profile-tab-content-${ element.name.toLowerCase() }-category">
					teste de conteudo para ${ element.name }
				</div>
			</div>
		</div>`

		container.innerHTML = container.innerHTML + template;
	});
}


// function renderProfileContent(container_id, profiles/*, category*/) {
	
// 	const container = document.getElementById( container_id );
// 	container.innerHTML = "";

// 	profiles.forEach(element => {
// 		let template = `<div class="tab-pane fade show" id="id-profile-tab-content-${ element.name.toLowerCase() }" role="tabpanel" aria-labelledby="pills-all-tab"><div class="row" id="all-sounds-container"> teste de conteudo para ${ element.name }</div></div>`;
// 		container.innerHTML = container.innerHTML + template;
// 	});
// }

function updateImputOption(container_id, array) {

	const container = document.getElementById( container_id );
	container.innerHTML = "";

	array.forEach(element => {
		let template = `<option value="${element}">${element}</option>`;
		container.innerHTML = container.innerHTML + template;
	});
}