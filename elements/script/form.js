
function formVal(params) {
	
	(function () {
		'use strict'
	
		var forms = document.querySelectorAll('.needs-validation')
	
		Array.prototype.slice.call(forms)
	
		.forEach(function (form) {
			form.addEventListener('submit', function (event) {
				if (!form.checkValidity()) {
					event.preventDefault()
					event.stopPropagation()
				}
				form.classList.add('was-validated')
			}, false)
		})
	})()
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


function getHtmlOfLoadConfigForm( ){

	const html = `<form id="id-ModelCard-config-form" class="needs-validation", novalidate>
	
		<div class="mb-4">
			<label for="id-ModelCard-config-form-file" class="form-label">Arquivo de Configuração <i class="bi bi-filetype-json"></i> </label>
			<input type="file" class="form-control" id="id-ModelCard-config-form-file" accept="json/*" required>
			<div class="invalid-feedback">
				Por favor, forneça um arquivo valido!.
			</div>


			<div class="alert alert-info mt-3 mb-0">
				<small>
					<i class="bi bi-info-circle"></i>
					<strong>Importante:</strong> Se não houver nenhum arquivo de configuração criado anteriormente, ignore este pop-up e exporte um novo arquivo após adicionar os áudios a mesa de som.
				</small>
			</div>

		</div>
	
		<div class="btn-group modal-footer mt-5 border-0" role="group">
			<button type="submit" class="btn btn-primary" id="id-ModelCard-config-form-save">Carregar Arquivo</button>
		</div>
	</form>`;

	return html;
}

function getHtmlOfSoundForm( action ){

	const html = `<form id="id-ModelCard-sound-${action}-form" class="needs-validation", novalidate>
		
		<div id="id-ModelCard-sound-${action}-form-element" style="display: none" ></div>
		
		<div class="mb-3">
			<label for="id-ModelCard-sound-${action}-form-title" class="form-label">Título do Som ou Musica</label>
			<input type="text" class="form-control" id="id-ModelCard-sound-${action}-form-title" minlength="3" maxlength="20" required>
			<div class="invalid-feedback">
				Por favor, forneça um título válido!. Deve ter pelo menos 3 letras e no máximo 20.
			</div>
		</div>
		
		<div class="mb-4" id="id-ModelCard-sound-${action}-form-file-div" >
			<label for="id-ModelCard-sound-${action}-form-file" class="form-label">Arquivo de Áudio <i class="bi bi-file-music"></i></label>
			<input type="file" value="valor" class="form-control" id="id-ModelCard-sound-${action}-form-file" accept="audio/*" required>
			<div class="invalid-feedback">
				Por favor, forneça um arquivo valido!.
			</div>

			<div class="alert alert-info mt-3 mb-0">
				<small>
					<i class="bi bi-info-circle"></i> 
					<strong>Importante:</strong> Coloque seus arquivos de áudio na pasta <code>sounds/</code> na raiz do projeto para que sejam carregados corretamente.
				</small>
			</div>

		</div>
		
		<div class="mb-4">
			<label for="id-ModelCard-sound-${action}-form-category" class="form-label">Categoria</label>
			<select class="form-select" id="id-ModelCard-sound-${action}-form-category-options" required>
				<option value="soundtrack">Trilha Sonora</option>
				<option value="background">Sons Ambiente</option>
				<option value="effects">Efeitos Sonoros</option>
			</select>
		</div>

		<div class="mb-3">
			<label for="id-ModelCard-sound-${action}-form-volume" class="form-label">Volume Padrão (0-1) <i class="bi bi-volume-up-fill"></i></label>
			<input type="number" class="form-control" id="id-ModelCard-sound-${action}-form-volume" min="0" max="1" step="0.01" value="0.7" required>
		</div>

		<div class="form-check loop-toggle">
			<input class="form-check-input" type="checkbox" id="id-ModelCard-sound-${action}-form-loop" checked>
			<label class="form-check-label" for="id-ModelCard-sound-${action}-form-loop"><i class="bi bi-repeat"></i> Reproduzir em loop</label>
		</div>

		<div class="btn-group modal-footer mt-5 border-0" role="group">
			<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
			<button type="submit" class="btn btn-primary" id="id-ModelCard-sound-${action}-form-save">Salvar</button>
		</div>
	</form>`

	return html;
}



