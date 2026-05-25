/**
 * Pokédex - Script Principal
 * Responsável pela listagem de pokémons
 * API: PokeAPI (https://pokeapi.co/)
 */

// ==========================================
// CONFIGURAÇÕES E CONSTANTES
// ==========================================

const CONFIG = {
    API_BASE_URL: 'https://pokeapi.co/api/v2',
    POKEMON_PER_PAGE: 30, // Pokémons por página
    MAX_POKEMON: 1028, // Primeiras gerações para performance
    BATCH_SIZE: 20, // Requisições em lotes
};

// ==========================================
// ESTADO DA APLICAÇÃO
// ==========================================

let appState = {
    currentPage: 1,
    pokemonList: [],
    filteredList: [],
    isLoading: false,
    searchQuery: '',
    selectedType: '',
};

// ==========================================
// SELETORES DO DOM
// ==========================================

const elements = {
    pokemonContainer: document.getElementById('pokemonContainer'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    errorMessage: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText'),
    infoMessage: document.getElementById('infoMessage'),
    infoText: document.getElementById('infoText'),
    searchInput: document.getElementById('searchInput'),
    clearBtn: document.getElementById('clearBtn'),
    typeFilter: document.getElementById('typeFilter'),
    prevPageBtn: document.getElementById('prevPage'),
    nextPageBtn: document.getElementById('nextPage'),
    currentPageItem: document.getElementById('currentPageItem'),
};

// Debounce para a busca
let searchTimeout;

// ==========================================
// FUNÇÕES UTILITÁRIAS
// ==========================================

/**
 * Exibe o spinner de carregamento
 */
function showLoading() {
    elements.loadingSpinner.classList.remove('d-none');
    appState.isLoading = true;
}

/**
 * Oculta o spinner de carregamento
 */
function hideLoading() {
    elements.loadingSpinner.classList.add('d-none');
    appState.isLoading = false;
}

/**
 * Exibe mensagem de erro
 * @param {string} message - Mensagem de erro
 */
function showError(message) {
    elements.errorText.textContent = message;
    elements.errorMessage.classList.remove('d-none');
    hideLoading();
}

/**
 * Oculta mensagem de erro
 */
function hideError() {
    elements.errorMessage.classList.add('d-none');
}

/**
 * Exibe mensagem de informação
 * @param {string} message - Mensagem
 */
function showInfo(message) {
    elements.infoText.textContent = message;
    elements.infoMessage.classList.remove('d-none');
}

/**
 * Oculta mensagem de informação
 */
function hideInfo() {
    elements.infoMessage.classList.add('d-none');
}

/**
 * Capitaliza a primeira letra de uma string
 * @param {string} str - String a ser capitalizada
 * @returns {string} String capitalizada
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ==========================================
// FUNÇÕES DE API
// ==========================================

/**
 * Busca a lista de pokémons da API
 * @async
 * @returns {Promise<Array>} Array com dados dos pokémons
 */
async function fetchPokemonList() {
    try {
        showLoading();
        hideError();

        // Busca lista inicial de pokémons
        const response = await fetch(
            `${CONFIG.API_BASE_URL}/pokemon?limit=${CONFIG.MAX_POKEMON}&offset=0`
        );

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Busca detalhes em lotes para evitar timeout
        const pokemonDetails = [];
        for (let i = 0; i < data.results.length; i += CONFIG.BATCH_SIZE) {
            const batch = data.results.slice(i, i + CONFIG.BATCH_SIZE);
            const batchDetails = await Promise.all(
                batch.map(pokemon => fetchPokemonDetails(pokemon.name))
            );
            pokemonDetails.push(...batchDetails.filter(p => p !== null));
        }

        appState.pokemonList = pokemonDetails;
        appState.filteredList = [...pokemonDetails];
        
        hideLoading();
        populateTypeFilter();
        renderPokemonList();
        showInfo(`Carregados ${pokemonDetails.length} pokémons com sucesso!`);
        
    } catch (error) {
        console.error('Erro ao buscar lista de pokémons:', error);
        showError(
            'Erro ao carregar pokémons. Verifique sua conexão de internet e tente novamente.'
        );
    }
}

/**
 * Busca detalhes de um pokémon específico
 * @async
 * @param {string} nameOrId - Nome ou ID do pokémon
 * @returns {Promise<Object|null>} Objeto com dados do pokémon ou null em caso de erro
 */
async function fetchPokemonDetails(nameOrId) {
    try {
        const response = await fetch(
            `${CONFIG.API_BASE_URL}/pokemon/${nameOrId}`
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        
        // Tenta obter a imagem em diferentes formatos
        const image = data.sprites.other?.['official-artwork']?.front_default || 
                     data.sprites.front_default || 
                     data.sprites.other?.dream_world?.front_default ||
                     'https://via.placeholder.com/150?text=Sem+Imagem';

        return {
            id: data.id,
            name: data.name,
            image: image,
            types: data.types.map(type => type.type.name),
            stats: data.stats,
            abilities: data.abilities,
            moves: data.moves,
            weight: data.weight,
            height: data.height,
        };

    } catch (error) {
        console.error(`Erro ao buscar detalhes do pokémon ${nameOrId}:`, error);
        return null;
    }
}

// ==========================================
// FUNÇÕES DE FILTRO DE TIPOS
// ==========================================

/**
 * Popula o filtro de tipos com tipos únicos
 */
function populateTypeFilter() {
    const allTypes = new Set();
    
    appState.pokemonList.forEach(pokemon => {
        pokemon.types.forEach(type => allTypes.add(type));
    });
    
    const sortedTypes = Array.from(allTypes).sort();
    
    elements.typeFilter.innerHTML = '<option value="">Todos os tipos</option>';
    
    sortedTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = capitalize(type);
        elements.typeFilter.appendChild(option);
    });
}

// ==========================================
// FUNÇÕES DE RENDERIZAÇÃO
// ==========================================

/**
 * Renderiza a lista de pokémons no DOM
 */
function renderPokemonList() {
    const startIndex = (appState.currentPage - 1) * CONFIG.POKEMON_PER_PAGE;
    const endIndex = startIndex + CONFIG.POKEMON_PER_PAGE;
    const paginatedList = appState.filteredList.slice(startIndex, endIndex);

    // Limpa container
    elements.pokemonContainer.innerHTML = '';

    if (paginatedList.length === 0) {
        elements.pokemonContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning text-center">
                    <p>Nenhum pokémon encontrado. Tente outra busca.</p>
                </div>
            </div>
        `;
        updatePagination();
        return;
    }

    // Cria cards para cada pokémon
    paginatedList.forEach(pokemon => {
        const card = createPokemonCard(pokemon);
        elements.pokemonContainer.appendChild(card);
    });

    updatePagination();
}

/**
 * Cria um elemento de card para um pokémon
 * @param {Object} pokemon - Dados do pokémon
 * @returns {HTMLElement} Elemento do card
 */
function createPokemonCard(pokemon) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';

    // Cria os badges de tipo
    const typeBadges = pokemon.types
        .map(type => `<span class="type-badge type-${type}">${type}</span>`)
        .join('');

    col.innerHTML = `
        <div class="card pokemon-card" onclick="goToDetails(${pokemon.id})">
            <div class="pokemon-card-header">
                <img 
                    src="${pokemon.image}" 
                    alt="${pokemon.name}"
                    loading="lazy"
                    onerror="this.src='https://via.placeholder.com/150?text=Imagem+Indisponível'"
                >
            </div>
            <div class="pokemon-card-body">
                <h5 class="pokemon-card-title">${capitalize(pokemon.name)}</h5>
                <p class="pokemon-id">ID: #${pokemon.id.toString().padStart(3, '0')}</p>
                <div class="pokemon-types">
                    ${typeBadges}
                </div>
            </div>
        </div>
    `;

    return col;
}

/**
 * Atualiza os botões de paginação
 */
function updatePagination() {
    const totalPages = Math.ceil(appState.filteredList.length / CONFIG.POKEMON_PER_PAGE);

    // Atualiza página atual
    elements.currentPageItem.innerHTML = `<span class="page-link">${appState.currentPage}</span>`;

    // Habilita/desabilita botão anterior
    if (appState.currentPage <= 1) {
        elements.prevPageBtn.classList.add('disabled');
    } else {
        elements.prevPageBtn.classList.remove('disabled');
    }

    // Habilita/desabilita botão próximo
    if (appState.currentPage >= totalPages) {
        elements.nextPageBtn.classList.add('disabled');
    } else {
        elements.nextPageBtn.classList.remove('disabled');
    }
}

// ==========================================
// FUNÇÕES DE BUSCA E FILTRO
// ==========================================

/**
 * Filtra pokémons por nome e tipo
 * @param {string} query - Termo de busca
 * @param {string} type - Tipo selecionado
 */
function filterPokemon(query = appState.searchQuery, type = appState.selectedType) {
    appState.searchQuery = query.toLowerCase().trim();
    appState.selectedType = type;
    appState.currentPage = 1;

    appState.filteredList = appState.pokemonList.filter(pokemon => {
        const matchesSearch = appState.searchQuery === '' ||
            pokemon.name.toLowerCase().includes(appState.searchQuery) ||
            pokemon.id.toString().includes(appState.searchQuery);
        
        const matchesType = appState.selectedType === '' ||
            pokemon.types.includes(appState.selectedType);
        
        return matchesSearch && matchesType;
    });

    if (appState.filteredList.length === 0) {
        if (appState.searchQuery && appState.selectedType) {
            showInfo(`Nenhum pokémon encontrado para "${appState.searchQuery}" do tipo "${capitalize(appState.selectedType)}"`);
        } else if (appState.searchQuery) {
            showInfo(`Nenhum pokémon encontrado para "${appState.searchQuery}"`);
        } else if (appState.selectedType) {
            showInfo(`Nenhum pokémon encontrado do tipo "${capitalize(appState.selectedType)}"`);
        } else {
            hideInfo();
        }
    } else {
        let message = `Encontrados ${appState.filteredList.length} resultado(s)`;
        if (appState.searchQuery && appState.selectedType) {
            message += ` para "${appState.searchQuery}" do tipo "${capitalize(appState.selectedType)}"`;
        } else if (appState.searchQuery) {
            message += ` para "${appState.searchQuery}"`;
        } else if (appState.selectedType) {
            message += ` do tipo "${capitalize(appState.selectedType)}"`;
        }
        showInfo(message);
    }

    renderPokemonList();
}

/**
 * Navegação para página de detalhes
 * @param {number} pokemonId - ID do pokémon
 */
function goToDetails(pokemonId) {
    window.location.href = `detalhes.html?id=${pokemonId}`;
}

// ==========================================
// EVENT LISTENERS
// ==========================================

// Busca em tempo real enquanto digita (com debounce)
elements.searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    
    // Mostra/oculta botão de limpar
    if (e.target.value) {
        elements.clearBtn.style.display = 'block';
    } else {
        elements.clearBtn.style.display = 'none';
    }
    
    // Aplica filtro com debounce de 300ms
    searchTimeout = setTimeout(() => {
        filterPokemon(e.target.value);
    }, 300);
});

// Botão para limpar busca
elements.clearBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    elements.clearBtn.style.display = 'none';
    filterPokemon('');
    elements.searchInput.focus();
});

// Paginação - Página Anterior
elements.prevPageBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (appState.currentPage > 1) {
        appState.currentPage--;
        renderPokemonList();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// Paginação - Próxima Página
elements.nextPageBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const totalPages = Math.ceil(appState.filteredList.length / CONFIG.POKEMON_PER_PAGE);
    if (appState.currentPage < totalPages) {
        appState.currentPage++;
        renderPokemonList();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// Filtro por tipo
elements.typeFilter.addEventListener('change', (e) => {
    filterPokemon(appState.searchQuery, e.target.value);
});

// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado. Iniciando carregamento de pokémons...');
    fetchPokemonList();
});
