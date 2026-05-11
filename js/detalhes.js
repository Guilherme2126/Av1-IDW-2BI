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
    MAX_POKEMON: 1025,
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

function hideLoading() {
    elements.loadingSpinner.classList.add('d-none');
    appState.isLoading = false;
}

function showError(message) {
    elements.errorText.textContent = message;
    elements.errorMessage.classList.remove('d-none');
    elements.detailsContainer.classList.add('d-none');
    hideLoading();
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function getUrlParameter(param) {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(param);
}

function updateUrl(pokemonId) {
    window.history.pushState({ pokemonId }, '', `detalhes.html?id=${pokemonId}`);
}

// ==========================================
// FUNÇÕES DE API
// ==========================================

async function fetchPokemonDetails(pokemonId) {
    if (pokemonId < 1 || pokemonId > CONFIG.MAX_POKEMON) {
        throw new Error(`ID de pokémon inválido: ${pokemonId}`);
    }

    const response = await fetch(`${CONFIG.API_BASE_URL}/pokemon/${pokemonId}`);

    if (!response.ok) {
        throw new Error(`Pokémon não encontrado (ID: ${pokemonId})`);
    }

    return response.json();
}

async function fetchAbilityDescription(abilityName) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/ability/${abilityName}`);

        if (!response.ok) {
            return 'Descrição não disponível';
        }

        const data = await response.json();
        const flavorText = data.flavor_text_entries.find(
            (entry) => entry.language.name === 'pt-br' || entry.language.name === 'en'
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

function renderBasicInfo(pokemon) {
    const imageUrl =
        pokemon.sprites.other['official-artwork'].front_default ||
        pokemon.sprites.front_default ||
        'https://via.placeholder.com/300';

    elements.pokemonImage.src = imageUrl;
    elements.pokemonImage.alt = pokemon.name;
    elements.pokemonName.textContent = capitalize(pokemon.name);

    const typeBadges = pokemon.types
        .map(
            (type) =>
                `<span class="type-badge type-${type.type.name}">${capitalize(
                    type.type.name
                )}</span>`
        )
        .join('');

    elements.pokemonTypes.innerHTML = typeBadges;
    elements.pokemonId.textContent = `ID: #${pokemon.id
        .toString()
        .padStart(3, '0')} | Altura: ${(pokemon.height / 10).toFixed(1)}m | Peso: ${(pokemon.weight / 10).toFixed(1)}kg`;
}

function renderStats(stats) {
    const html = stats
        .map((stat) => {
            const statName = capitalize(stat.stat.name.replace('-', ' '));
            const statValue = stat.base_stat;
            const percentage = Math.min(100, (statValue / 150) * 100);

            return `
                <div class="stat-item">
                    <div class="stat-name">${statName}</div>
                    <div class="progress">
                        <div class="progress-bar" role="progressbar" style="width: ${percentage}%" aria-valuenow="${statValue}" aria-valuemin="0" aria-valuemax="150">
                            ${statValue}
                        </div>
                    </div>
                </div>
            `;
        })
        .join('');

    elements.statsContainer.innerHTML = html;
}

async function renderAbilities(abilities) {
    const html = [];

    for (const ability of abilities) {
        const abilityName = ability.ability.name;
        const isHidden = ability.is_hidden ? ' (Oculta)' : '';
        const description = await fetchAbilityDescription(abilityName);

        html.push(`
            <div class="ability-item">
                <div class="ability-name">${capitalize(abilityName)}${isHidden}</div>
                <div class="ability-description">${description}</div>
            </div>
        `);
    }

    elements.abilitiesContainer.innerHTML = html.join('') || '<p>Sem habilidades disponíveis</p>';
}

function renderMoves(moves) {
    const limitedMoves = moves.slice(0, CONFIG.MAX_MOVES_DISPLAY);

    const moveBadges = limitedMoves
        .map(
            (move) =>
                `<span class="move-badge">${capitalize(move.move.name)}</span>`
        )
        .join('');

    const info = moves.length > CONFIG.MAX_MOVES_DISPLAY
        ? `<p class="text-muted mt-3">Mostrando ${CONFIG.MAX_MOVES_DISPLAY} de ${moves.length} movimentos</p>`
        : '';

    elements.movesContainer.innerHTML = `
        <div class="moves-list">
            ${moveBadges}
        </div>
        ${info}
    `;
}

async function loadPokemonDetails(pokemonId) {
    try {
        updateUrl(pokemonId);
        appState.currentPokemonId = pokemonId;

        const pokemon = await fetchPokemonDetails(pokemonId);
        appState.currentPokemonData = pokemon;

        renderBasicInfo(pokemon);
        renderStats(pokemon.stats);
        renderMoves(pokemon.moves);
        await renderAbilities(pokemon.abilities);

        elements.detailsContainer.classList.remove('d-none');
        hideLoading();
        updateNavigationButtons();
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        showError(`Não foi possível carregar o pokémon. ${error.message}`);
    }
}

function updateNavigationButtons() {
    elements.prevPokemonBtn.disabled = appState.currentPokemonId <= 1;
    elements.prevPokemonBtn.classList.toggle('disabled', appState.currentPokemonId <= 1);

    elements.nextPokemonBtn.disabled = appState.currentPokemonId >= CONFIG.MAX_POKEMON;
    elements.nextPokemonBtn.classList.toggle('disabled', appState.currentPokemonId >= CONFIG.MAX_POKEMON);
}

// ==========================================
// EVENT LISTENERS
// ==========================================

elements.prevPokemonBtn.addEventListener('click', () => {
    if (appState.currentPokemonId > 1) {
        loadPokemonDetails(appState.currentPokemonId - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

elements.nextPokemonBtn.addEventListener('click', () => {
    if (appState.currentPokemonId < CONFIG.MAX_POKEMON) {
        loadPokemonDetails(appState.currentPokemonId + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

window.addEventListener('popstate', (event) => {
    if (event.state && event.state.pokemonId) {
        loadPokemonDetails(event.state.pokemonId);
    }
});

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const pokemonId = getUrlParameter('id');

    if (!pokemonId || isNaN(pokemonId)) {
        showError('ID de pokémon inválido. <a href="index.html">Voltar à listagem</a>');
        return;
    }

    loadPokemonDetails(parseInt(pokemonId, 10));
});
