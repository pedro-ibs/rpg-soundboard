
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


