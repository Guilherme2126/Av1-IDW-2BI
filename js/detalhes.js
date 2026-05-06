/**
 * Pokédex - Script de Detalhes
 * Responsável pela exibição detalhada de um pokémon
 * API: PokeAPI (https://pokeapi.co/)
 */

// ==========================================
// CONFIGURAÇÕES E CONSTANTES
// ==========================================

const CONFIG = {
    API_BASE_URL: 'https://pokeapi.co/api/v2',
    MAX_MOVES_DISPLAY: 10,
    MAX_POKEMON: 1025, // Todos os pokémons disponíveis
};

// ==========================================
// ESTADO DA APLICAÇÃO
// ==========================================

let appState = {
    currentPokemonId: null,
    currentPokemonData: null,
    isLoading: true,
};

// ==========================================
// SELETORES DO DOM
// ==========================================

const elements = {
    loadingSpinner: document.getElementById('loadingSpinner'),
    errorMessage: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText'),
    detailsContainer: document.getElementById('detailsContainer'),
    pokemonImage: document.getElementById('pokemonImage'),
    pokemonName: document.getElementById('pokemonName'),
    pokemonTypes: document.getElementById('pokemonTypes'),
    pokemonId: document.getElementById('pokemonId'),
    statsContainer: document.getElementById('statsContainer'),
    abilitiesContainer: document.getElementById('abilitiesContainer'),
    movesContainer: document.getElementById('movesContainer'),
    prevPokemonBtn: document.getElementById('prevPokemon'),
    nextPokemonBtn: document.getElementById('nextPokemon'),
};

// ==========================================
// FUNÇÕES UTILITÁRIAS
// ==========================================

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
    elements.detailsContainer.classList.add('d-none');
    hideLoading();
}

/**
 * Capitaliza a primeira letra de uma string
 * @param {string} str - String a ser capitalizada
 * @returns {string} String capitalizada
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Obtém o parâmetro de URL
 * @param {string} param - Nome do parâmetro
 * @returns {string|null} Valor do parâmetro
 */
function getUrlParameter(param) {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(param);
}

/**
 * Atualiza URL sem recarregar a página
 * @param {number} pokemonId - ID do pokémon
 */
function updateUrl(pokemonId) {
    window.history.pushState({ pokemonId }, '', `detalhes.html?id=${pokemonId}`);
}

// ==========================================
// FUNÇÕES DE API
// ==========================================

/**
 * Busca detalhes de um pokémon
 * @async
 * @param {number} pokemonId - ID do pokémon
 * @returns {Promise<Object>} Objeto com dados do pokémon
 */
async function fetchPokemonDetails(pokemonId) {
    try {
        // Validação do ID
        if (pokemonId < 1 || pokemonId > CONFIG.MAX_POKEMON) {
            throw new Error(`ID de pokémon inválido: ${pokemonId}`);
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/pokemon/${pokemonId}`
        );

        if (!response.ok) {
            throw new Error(`Pokémon não encontrado (ID: ${pokemonId})`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
        throw error;
    }
}

/**
 * Busca descrição de uma habilidade
 * @async
 * @param {string} abilityName - Nome da habilidade
 * @returns {Promise<string>} Descrição da habilidade
 */
async function fetchAbilityDescription(abilityName) {
    try {
        const response = await fetch(
            `${CONFIG.API_BASE_URL}/ability/${abilityName}`
        );

        if (!response.ok) {
            return 'Descrição não disponível';
        }

        const data = await response.json();
        
        // Encontra descrição em português, ou inglês como fallback
        const flavorText = data.flavor_text_entries.find(entry => 
            entry.language.name === 'pt-br' || entry.language.name === 'en'
        );

        return flavorText 
            ? flavorText.flavor_text.replace(/\n/g, ' ').trim()
            : 'Descrição não disponível';

    } catch (error) {
        console.error(`Erro ao buscar habilidade ${abilityName}:`, error);
        return 'Descrição não disponível';
    }
}

// ==========================================
// FUNÇÕES DE RENDERIZAÇÃO
// ==========================================

/**
 * Renderiza informações básicas do pokémon
 * @param {Object} pokemon - Dados do pokémon
 */
function renderBasicInfo(pokemon) {
    // Imagem
    const imageUrl = pokemon.sprites.other['official-artwork'].front_default 
        || pokemon.sprites.front_default
        || 'https://via.placeholder.com/300';
    
    elements.pokemonImage.src = imageUrl;
    elements.pokemonImage.alt = pokemon.name;

    // Nome
    elements.pokemonName.textContent = capitalize(pokemon.name);

    // Tipos
    const typeBadges = pokemon.types
        .map(type => `<span class="type-badge type-${type.type.name}">${capitalize(type.type.name)}</span>`)
        .join('');
    elements.pokemonTypes.innerHTML = typeBadges;

    // ID
    elements.pokemonId.textContent = `ID: #${pokemon.id.toString().padStart(3, '0')} | Altura: ${(pokemon.height / 10).toFixed(1)}m | Peso: ${(pokemon.weight / 10).toFixed(1)}kg`;
}

/**
 * Renderiza os stats do pokémon
 * @param {Array} stats - Array de stats
 */
function renderStats(stats) {
    let html = '';

    stats.forEach(stat => {
        const statName = stat.stat.name.replace('-', ' ');
        const statValue = stat.base_stat;
        const percentage = (statValue / 150) * 100; // Calcula percentual baseado em 150 como máximo

        html += `
            <div class="stat-item">
                <div class="stat-name">${capitalize(statName)}</div>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${percentage}%" aria-valuenow="${statValue}" aria-valuemin="0" aria-valuemax="150">
                        ${statValue}
                    </div>
                </div>
            </div>
        `;
    });

    elements.statsContainer.innerHTML = html;
}

/**
 * Renderiza as habilidades do pokémon
 * @async
 * @param {Array} abilities - Array de habilidades
 */
async function renderAbilities(abilities) {
    let html = '';

    for (const ability of abilities) {
        const abilityName = ability.ability.name;
        const isHidden = ability.is_hidden ? ' (Oculta)' : '';
        const description = await fetchAbilityDescription(abilityName);

        html += `
            <div class="ability-item">
                <div class="ability-name">${capitalize(abilityName)}${isHidden}</div>
                <div class="ability-description">${description}</div>
            </div>
        `;
    }

    elements.abilitiesContainer.innerHTML = html || '<p>Sem habilidades disponíveis</p>';
}

/**
 * Renderiza os movimentos do pokémon
 * @param {Array} moves - Array de movimentos
 */
function renderMoves(moves) {
    // Limita a 10 primeiros movimentos
    const limitedMoves = moves.slice(0, CONFIG.MAX_MOVES_DISPLAY);
    
    const moveNames = limitedMoves
        .map(move => `<span class="move-badge">${capitalize(move.move.name)}</span>`)
        .join('');

    const info = moves.length > CONFIG.MAX_MOVES_DISPLAY 
        ? `<p class="text-muted mt-3">Mostrando ${CONFIG.MAX_MOVES_DISPLAY} de ${moves.length} movimentos</p>`
        : '';

    elements.movesContainer.innerHTML = `
        <div class="moves-list">
            ${moveNames}
        </div>
        ${info}
    `;
}

/**
 * Carrega e exibe detalhes do pokémon
 * @async
 * @param {number} pokemonId - ID do pokémon
 */
async function loadPokemonDetails(pokemonId) {
    try {
        // Atualiza URL
        updateUrl(pokemonId);
        appState.currentPokemonId = pokemonId;

        // Busca dados
        const pokemon = await fetchPokemonDetails(pokemonId);
        appState.currentPokemonData = pokemon;

        // Renderiza informações básicas
        renderBasicInfo(pokemon);
        renderStats(pokemon.stats);
        renderMoves(pokemon.moves);

        // Renderiza habilidades de forma assíncrona
        await renderAbilities(pokemon.abilities);

        // Mostra container de detalhes
        elements.detailsContainer.classList.remove('d-none');
        hideLoading();

        // Atualiza buttons de navegação
        updateNavigationButtons();

    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        showError(`Não foi possível carregar o pokémon. ${error.message}`);
    }
}

/**
 * Atualiza o estado dos botões de navegação
 */
function updateNavigationButtons() {
    // Desabilita botão anterior se está no primeiro pokémon
    if (appState.currentPokemonId <= 1) {
        elements.prevPokemonBtn.disabled = true;
        elements.prevPokemonBtn.classList.add('disabled');
    } else {
        elements.prevPokemonBtn.disabled = false;
        elements.prevPokemonBtn.classList.remove('disabled');
    }

    // Desabilita botão próximo se está no último pokémon
    if (appState.currentPokemonId >= CONFIG.MAX_POKEMON) {
        elements.nextPokemonBtn.disabled = true;
        elements.nextPokemonBtn.classList.add('disabled');
    } else {
        elements.nextPokemonBtn.disabled = false;
        elements.nextPokemonBtn.classList.remove('disabled');
    }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

// Botão Pokémon Anterior
elements.prevPokemonBtn.addEventListener('click', () => {
    if (appState.currentPokemonId > 1) {
        loadPokemonDetails(appState.currentPokemonId - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// Botão Próximo Pokémon
elements.nextPokemonBtn.addEventListener('click', () => {
    if (appState.currentPokemonId < CONFIG.MAX_POKEMON) {
        loadPokemonDetails(appState.currentPokemonId + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// Navegação pelo histórico do navegador
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.pokemonId) {
        loadPokemonDetails(e.state.pokemonId);
    }
});

// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Obtém ID da URL
    const pokemonId = getUrlParameter('id');

    if (!pokemonId || isNaN(pokemonId)) {
        showError('ID de pokémon inválido. <a href="index.html">Voltar à listagem</a>');
        return;
    }

    loadPokemonDetails(parseInt(pokemonId));
});
