
function validateConfigurationFile(jsonData) {
	
	const DEFAULT_PROFILE	= { name: 'Principal', volume: 1.0 };
	const DEFAULT_CATEGORY	= 'Trilha Sonora';


	const minimalStructure = {
		profile:    [ DEFAULT_PROFILE	],
		category:   [ DEFAULT_CATEGORY	],
		sounds:     [	]
	}; 

	if (typeof jsonData !== 'object' || jsonData === null) {
		return minimalStructure;
	}

	if (!Array.isArray(jsonData.profile)) {
		jsonData.profile = [DEFAULT_PROFILE];
	} if (jsonData.profile.length === 0) {
		jsonData.profile = [DEFAULT_PROFILE];
	} else {
		let principalExists = jsonData.profile.some(item => item.name === 'Principal');
		
		if (!principalExists) {
			jsonData.profile.unshift(DEFAULT_PROFILE);
		} else {
			const principalIndex = jsonData.profile.findIndex(item => item.name === 'Principal');

			if (principalIndex > 0) {
				const principalItem = jsonData.profile.splice(principalIndex, 1)[0];
				jsonData.profile.unshift(principalItem);
			}
		}
	}

	if (!Array.isArray(jsonData.category)) {
		jsonData.category = [ DEFAULT_CATEGORY ];
	} else {
		jsonData.category = jsonData.category.filter(item => item !== DEFAULT_CATEGORY);
		jsonData.category.unshift(DEFAULT_CATEGORY);
	}


	if (!Array.isArray(jsonData.sounds)) {
		jsonData.sounds = [ ];
	}


	// if (typeof jsonData.sounds !== 'object' || jsonData.sounds === null) {
	// 	jsonData.sounds = {};
	// }

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



function getProfile(perfis, nome) {
    return perfis.find( perfil => perfil.name.toLowerCase() === nome.toLowerCase() );
}

function getProfileNames(profiles) {
    return profiles.map(perfil => perfil.name);
}


function getCategory(perfis, nome) {
    return perfis.find( category => category.toLowerCase() === nome.toLowerCase() );
}