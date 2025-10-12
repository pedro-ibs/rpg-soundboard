// Variáveis globais
let activeAudios = new Map(); // Mapa para armazenar múltiplos áudios ativos
let musicCards = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
	loadCardsFromStorage();
	setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
	// Botão salvar card
	document.getElementById('saveCardBtn').addEventListener('click', saveCard);
	
	// Botão exportar
	document.getElementById('exportBtn').addEventListener('click', exportConfig);
	
	// Botão importar
	document.getElementById('importBtn').addEventListener('click', function() {
		document.getElementById('importFile').click();
	});
	
	// Input de importação
	document.getElementById('importFile').addEventListener('change', importConfig);
	
	// Controles globais
	document.getElementById('pause-all').addEventListener('click', pauseAllAudios);
	document.getElementById('resume-all').addEventListener('click', resumeAllAudios);
	document.getElementById('stop-all').addEventListener('click', stopAllAudios);
	
	// Resetar modal ao fechar
	document.getElementById('addCardModal').addEventListener('hidden.bs.modal', function() {
		document.getElementById('cardForm').reset();
		document.getElementById('editingCardId').value = '';
		document.getElementById('addCardModalLabel').textContent = 'Adicionar Novo Card de Música';
		document.getElementById('audioFileHelp').style.display = 'block';
	});
}

// Carregar cards do localStorage
function loadCardsFromStorage() {
	const savedCards = localStorage.getItem('rpgMusicCards');
	if (savedCards) {
		musicCards = JSON.parse(savedCards);
		renderCards();
	} else {
		
		// Cards padrão
		musicCards = [ ];

		saveCardsToStorage();
		renderCards();
	}
}

// Salvar cards no localStorage
function saveCardsToStorage() {
	localStorage.setItem('rpgMusicCards', JSON.stringify(musicCards));
}

// Renderizar cards na tela
function renderCards() {
	const container = document.getElementById('cards-container');
	container.innerHTML = '';
	
	// Agrupar cards por categoria
	const categories = {};
	musicCards.forEach(card => {
	if (!categories[card.category]) {
		categories[card.category] = [];
	}
	categories[card.category].push(card);
	});
	
	// Renderizar cada categoria
	for (const category in categories) {
	const categoryTitle = document.createElement('h3');
	categoryTitle.className = 'category-title';
	categoryTitle.textContent = category;
	container.appendChild(categoryTitle);
	
	const row = document.createElement('div');
	row.className = 'row';
	
	categories[category].forEach(card => {
		const col = document.createElement('div');
		col.className = 'col-md-4';
		
		const musicCard = document.createElement('div');
		musicCard.className = 'music-card';
		musicCard.dataset.id = card.id;
		
		// Verificar se este card está tocando
		const isPlaying = activeAudios.has(card.id) && !activeAudios.get(card.id).paused;
		const isPaused = activeAudios.has(card.id) && activeAudios.get(card.id).paused;
		
		if (isPlaying) {
		musicCard.classList.add('card-playing');
		} else if (isPaused) {
		musicCard.classList.add('card-paused');
		}
		
		musicCard.innerHTML = `
		<h5>${card.title}</h5>
		<button class="btn-music" data-src="${card.audioSrc}">
			${isPlaying ? 'Parar' : 'Tocar'} ${card.title}
		</button>
		<input type="range" class="volume-control" min="0" max="1" step="0.1" value="${card.volume}">
		<div class="loop-toggle">
			<input class="form-check-input loop-checkbox" type="checkbox" ${card.loop ? 'checked' : ''}>
			<label class="form-check-label">Repetir</label>
		</div>
		<div class="control-buttons">
			<button class="btn btn-sm btn-info pause-btn" ${!activeAudios.has(card.id) ? 'disabled' : ''}>
			<i class="bi bi-pause"></i> Pausar
			</button>
			<button class="btn btn-sm btn-success resume-btn" ${!activeAudios.has(card.id) ? 'disabled' : ''} style="display: none;">
			<i class="bi bi-play"></i> Continuar
			</button>
			<button class="btn btn-sm btn-danger stop-btn" ${!activeAudios.has(card.id) ? 'disabled' : ''}>
			<i class="bi bi-stop"></i> Parar
			</button>
		</div>
		<div class="card-actions">
			<button class="btn btn-sm btn-warning edit-card">
			<i class="bi bi-pencil"></i> Editar
			</button>
			<button class="btn btn-sm btn-danger delete-card">
			<i class="bi bi-trash"></i> Excluir
			</button>
		</div>
		`;
		
		col.appendChild(musicCard);
		row.appendChild(col);
	});
	
	container.appendChild(row);
	}
	
	// Adicionar eventos aos botões recém-criados
	document.querySelectorAll('.btn-music').forEach(button => {
	button.addEventListener('click', function() {
		const src = this.getAttribute('data-src');
		const cardId = parseInt(this.closest('.music-card').dataset.id);
		const isPlaying = activeAudios.has(cardId) && !activeAudios.get(cardId).paused;
		
		if (isPlaying) {
		stopAudio(cardId);
		} else {
		playAudio(cardId, src);
		}
	});
	});
	
	document.querySelectorAll('.volume-control').forEach(control => {
	control.addEventListener('input', function() {
		const cardId = parseInt(this.closest('.music-card').dataset.id);
		const card = musicCards.find(c => c.id === cardId);
		
		if (card) {
		card.volume = parseFloat(this.value);
		saveCardsToStorage();
		
		// Se este card está tocando, atualizar o volume
		if (activeAudios.has(cardId)) {
			activeAudios.get(cardId).volume = this.value;
		}
		}
	});
	});
	
	document.querySelectorAll('.loop-checkbox').forEach(checkbox => {
	checkbox.addEventListener('change', function() {
		const cardId = parseInt(this.closest('.music-card').dataset.id);
		const card = musicCards.find(c => c.id === cardId);
		
		if (card) {
		card.loop = this.checked;
		saveCardsToStorage();
		
		// Se este card está tocando, atualizar o loop
		if (activeAudios.has(cardId)) {
			activeAudios.get(cardId).loop = this.checked;
		}
		}
	});
	});
	
	document.querySelectorAll('.pause-btn').forEach(button => {
	button.addEventListener('click', function() {
		const cardId = parseInt(this.closest('.music-card').dataset.id);
		pauseAudio(cardId);
	});
	});
	
	document.querySelectorAll('.resume-btn').forEach(button => {
	button.addEventListener('click', function() {
		const cardId = parseInt(this.closest('.music-card').dataset.id);
		resumeAudio(cardId);
	});
	});
	
	document.querySelectorAll('.stop-btn').forEach(button => {
	button.addEventListener('click', function() {
		const cardId = parseInt(this.closest('.music-card').dataset.id);
		stopAudio(cardId);
	});
	});
	
	document.querySelectorAll('.edit-card').forEach(button => {
	button.addEventListener('click', function() {
		const cardId = parseInt(this.closest('.music-card').dataset.id);
		editCard(cardId);
	});
	});
	
	document.querySelectorAll('.delete-card').forEach(button => {
	button.addEventListener('click', function() {
		const cardId = parseInt(this.closest('.music-card').dataset.id);
		deleteCard(cardId);
	});
	});
	
	updatePlayingTracksList();
}

// Tocar áudio
function playAudio(cardId, src) {
	// Parar áudio anterior se já estiver tocando
	if (activeAudios.has(cardId)) {
	stopAudio(cardId);
	}
	
	const card = musicCards.find(c => c.id === cardId);
	if (!card) return;
	
	const audio = new Audio(src);
	audio.loop = card.loop;
	audio.volume = card.volume;
	
	audio.addEventListener('ended', function() {
	if (!audio.loop) {
		stopAudio(cardId);
	}
	});
	
	audio.play();
	activeAudios.set(cardId, audio);
	
	updateCardUI(cardId);
	updatePlayingTracksList();
}

// Pausar áudio
function pauseAudio(cardId) {
	if (activeAudios.has(cardId)) {
	const audio = activeAudios.get(cardId);
	if (!audio.paused) {
		audio.pause();
		updateCardUI(cardId);
		updatePlayingTracksList();
	}
	}
}

// Continuar áudio
function resumeAudio(cardId) {
	if (activeAudios.has(cardId)) {
	const audio = activeAudios.get(cardId);
	if (audio.paused) {
		audio.play();
		updateCardUI(cardId);
		updatePlayingTracksList();
	}
	}
}

// Parar áudio
function stopAudio(cardId) {
	if (activeAudios.has(cardId)) {
	const audio = activeAudios.get(cardId);
	audio.pause();
	activeAudios.delete(cardId);
	updateCardUI(cardId);
	updatePlayingTracksList();
	}
}

// Pausar todos os áudios
function pauseAllAudios() {
	let hasPlaying = false;
	activeAudios.forEach((audio, cardId) => {
	if (!audio.paused) {
		audio.pause();
		hasPlaying = true;
	}
	});
	
	if (hasPlaying) {
	document.getElementById('pause-all').style.display = 'none';
	document.getElementById('resume-all').style.display = 'inline-block';
	renderCards();
	}
}

// Continuar todos os áudios
function resumeAllAudios() {
	let hasPaused = false;
	activeAudios.forEach((audio, cardId) => {
	if (audio.paused) {
		audio.play();
		hasPaused = true;
	}
	});
	
	if (hasPaused) {
	document.getElementById('pause-all').style.display = 'inline-block';
	document.getElementById('resume-all').style.display = 'none';
	renderCards();
	}
}

// Parar todos os áudios
function stopAllAudios() {
	activeAudios.forEach((audio, cardId) => {
	audio.pause();
	});
	activeAudios.clear();
	
	document.getElementById('pause-all').style.display = 'inline-block';
	document.getElementById('resume-all').style.display = 'none';
	renderCards();
}

// Atualizar UI do card
function updateCardUI(cardId) {
	// A UI será atualizada no próximo renderCards()
	renderCards();
}

// Atualizar lista de faixas tocando
function updatePlayingTracksList() {
	const container = document.getElementById('current-tracks');
	
	if (activeAudios.size === 0) {
	container.innerHTML = '<p class="mb-0 text-muted">Nenhuma faixa tocando</p>';
	return;
	}
	
	container.innerHTML = '';
	activeAudios.forEach((audio, cardId) => {
	const card = musicCards.find(c => c.id === cardId);
	if (!card) return;
	
	const trackItem = document.createElement('div');
	trackItem.className = 'track-item';
	
	trackItem.innerHTML = `
		<span>${card.title}</span>
		<div class="track-controls">
		<button class="btn btn-xs ${audio.paused ? 'btn-success' : 'btn-info'}" 
			onclick="${audio.paused ? 'resumeAudio' : 'pauseAudio'}(${cardId})">
			<i class="bi ${audio.paused ? 'bi-play' : 'bi-pause'}"></i>
		</button>
		<button class="btn btn-xs btn-danger" onclick="stopAudio(${cardId})">
			<i class="bi bi-stop"></i>
		</button>
		</div>
	`;
	
	container.appendChild(trackItem);
	});
}

// Salvar/editar card
function saveCard() {
	const cardId = document.getElementById('editingCardId').value;
	const title = document.getElementById('cardTitle').value;
	const audioFile = document.getElementById('audioFile').files[0];
	const category = document.getElementById('cardCategory').value;
	const volume = parseFloat(document.getElementById('defaultVolume').value);
	const loop = document.getElementById('loopToggle').checked;
	
	if (!title) {
	alert('Por favor, preencha o título do card.');
	return;
	}
	
	if (cardId) {
	// Editar card existente
	const cardIndex = musicCards.findIndex(card => card.id === parseInt(cardId));
	if (cardIndex !== -1) {
		musicCards[cardIndex].title = title;
		musicCards[cardIndex].category = category;
		musicCards[cardIndex].volume = volume;
		musicCards[cardIndex].loop = loop;
		
		// Se um novo arquivo de áudio foi selecionado
		if (audioFile) {
		musicCards[cardIndex].audioSrc = URL.createObjectURL(audioFile);
		}
		
		saveCardsToStorage();
		renderCards();
	}
	} else {
	// Criar novo card
	if (!audioFile) {
		alert('Por favor, selecione um arquivo de áudio.');
		return;
	}
	
	// Criar URL para o arquivo de áudio
	const audioURL = URL.createObjectURL(audioFile);
	
	// Criar novo card
	const newCard = {
		id: Date.now(), // ID único baseado no timestamp
		title: title,
		audioSrc: audioURL,
		category: category,
		volume: volume,
		loop: loop
	};
	
	musicCards.push(newCard);
	saveCardsToStorage();
	renderCards();
	}
	
	// Fechar modal e resetar formulário
	const modal = bootstrap.Modal.getInstance(document.getElementById('addCardModal'));
	modal.hide();
}

// Editar card
function editCard(cardId) {
	const card = musicCards.find(c => c.id === cardId);
	if (!card) return;
	
	document.getElementById('editingCardId').value = card.id;
	document.getElementById('cardTitle').value = card.title;
	document.getElementById('cardCategory').value = card.category;
	document.getElementById('defaultVolume').value = card.volume;
	document.getElementById('loopToggle').checked = card.loop;
	document.getElementById('addCardModalLabel').textContent = 'Editar Card de Música';
	document.getElementById('audioFileHelp').style.display = 'block';
	
	const modal = new bootstrap.Modal(document.getElementById('addCardModal'));
	modal.show();
}

// Excluir card
function deleteCard(cardId) {
	if (confirm('Tem certeza que deseja excluir este card?')) {
	// Parar áudio se estiver tocando
	if (activeAudios.has(cardId)) {
		stopAudio(cardId);
	}
	
	musicCards = musicCards.filter(card => card.id !== cardId);
	saveCardsToStorage();
	renderCards();
	}
}

// Exportar configurações
function exportConfig() {
	const dataStr = JSON.stringify(musicCards, null, 2);
	const dataBlob = new Blob([dataStr], {type: 'application/json'});
	
	const link = document.createElement('a');
	link.href = URL.createObjectURL(dataBlob);
	link.download = 'rpg-music-cards.json';
	link.click();
}

// Importar configurações
function importConfig(event) {
	const file = event.target.files[0];
	if (!file) return;
	
	const reader = new FileReader();
	reader.onload = function(e) {
	try {
		const importedCards = JSON.parse(e.target.result);
		if (Array.isArray(importedCards)) {
		// Parar todos os áudios atuais
		stopAllAudios();
		
		musicCards = importedCards;
		saveCardsToStorage();
		renderCards();
		alert('Configurações importadas com sucesso!');
		} else {
		alert('Arquivo inválido. O arquivo deve conter um array de cards.');
		}
	} catch (error) {
		alert('Erro ao importar o arquivo. Verifique se é um JSON válido.');
	}
	};
	reader.readAsText(file);
	
	// Resetar o input de arquivo
	event.target.value = '';
}