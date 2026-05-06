# Pokédex - Aplicação Web Interativa

Uma aplicação web completa e responsiva que consome a **PokeAPI** para exibir informações sobre pokémons de forma dinâmica e interativa.

## 🎯 Objetivo

Desenvolver uma aplicação que demonstre boas práticas de desenvolvimento web moderno utilizando apenas HTML, CSS, Bootstrap e JavaScript puro, com consumo de API através de `fetch` com `async/await`.

## 📋 Recursos

✅ Listagem paginada de pokémons  
✅ Busca e filtro em tempo real  
✅ Página de detalhes com informações completas  
✅ Navegação entre pokémons  
✅ Indicadores de carregamento  
✅ Tratamento robusto de erros  
✅ Interface responsiva e moderna  
✅ Código limpo e bem documentado  

## 📁 Estrutura do Projeto

```
av1-dwb-nome-sobrenome-2bimestre/
├── index.html              # Página principal (listagem)
├── detalhes.html           # Página de detalhes do pokémon
├── css/
│   └── style.css          # Estilos customizados
├── js/
│   ├── script.js          # Lógica da listagem
│   └── detalhes.js        # Lógica de detalhes
└── README.md              # Este arquivo
```

## 🚀 Como Executar

### Opção 1: Usando Live Server (Recomendado)

1. Instale a extensão **Live Server** no VS Code
2. Abra o arquivo `index.html`
3. Clique com botão direito e selecione **"Open with Live Server"**
4. A aplicação será aberta automaticamente em seu navegador

### Opção 2: Diretamente pelo Navegador

1. Navegue até a pasta do projeto
2. Abra `index.html` em seu navegador preferido

> ⚠️ **Nota:** Alguns navegadores podem bloquear requisições CORS de arquivos locais. Use Live Server ou um servidor HTTP local para melhor experiência.

## 📱 Funcionalidades

### Página de Listagem (`index.html`)

- **Exibição em Grid**: Cards dos pokémons organizados em layout responsivo
- **Busca**: Filtro por nome ou ID do pokémon
- **Paginação**: Navegação entre páginas com 12 pokémons por página
- **Loading**: Spinner durante o carregamento dos dados
- **Tratamento de Erros**: Mensagens amigáveis em caso de falha

### Página de Detalhes (`detalhes.html`)

- **Informações Básicas**: Nome, ID, altura e peso
- **Stats**: Barra de progresso visual dos atributos
- **Tipos**: Badges coloridos dos tipos de pokémon
- **Habilidades**: Lista com descrições das habilidades
- **Movimentos**: 10 primeiros movimentos do pokémon
- **Navegação**: Botões para ir ao pokémon anterior/próximo

## 🔌 API Utilizada

### PokeAPI v2

**URL Base:** `https://pokeapi.co/api/v2`

Endpoints utilizados:

- `GET /pokemon?limit=151&offset=0` - Lista de pokémons
- `GET /pokemon/{id|name}` - Detalhes do pokémon
- `GET /ability/{name}` - Descrição da habilidade

**Documentação:** https://pokeapi.co/docs/v2

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso |
|-----------|-----|
| HTML5 | Estrutura semântica |
| CSS3 | Estilos e animações |
| Bootstrap 5 | Framework responsivo |
| JavaScript ES6+ | Lógica da aplicação |
| Fetch API | Consumo de dados |
| URLSearchParams | Parâmetros de URL |

## 💡 Conceitos Implementados

### JavaScript Moderno

- ✅ Async/Await com Fetch API
- ✅ Arrow Functions
- ✅ Template Literals
- ✅ Destructuring
- ✅ Spread Operator
- ✅ Promise.all() para requisições paralelas
- ✅ Event Listeners
- ✅ Manipulação do DOM
- ✅ LocalStorage (preparado para expansão)
- ✅ URLSearchParams

### Boas Práticas

- ✅ Código comentado e limpo
- ✅ Separação de responsabilidades
- ✅ Funções bem definidas
- ✅ Tratamento de erros robusto
- ✅ Responsividade mobile-first
- ✅ Acessibilidade (ARIA labels, alt text)
- ✅ Performance (lazy loading de imagens)
- ✅ Semântica HTML

## 📊 Detalhes de Implementação

### Listagem de Pokémons

```javascript
// Busca lista inicial com async/await
async function fetchPokemonList() {
    const response = await fetch(`${API_URL}/pokemon?limit=151`);
    const data = await response.json();
    // Processa e renderiza dados
}
```

### Busca e Filtro

- Filtra por nome ou ID em tempo real
- Debounce em buscas
- Reinicia paginação após filtro

### Navegação

- Utiliza `URLSearchParams` para capturar parâmetro `?id=`
- Atualiza histórico com `window.history.pushState`
- Suporta botão voltar do navegador

### Tratamento de Erros

- Try/catch em todas as operações assíncronas
- Mensagens descritivas ao usuário
- Fallback para imagens indisponíveis
- Validação de entrada

## 🎨 Design e UX

### Paleta de Cores

- **Primária**: `#667eea` (Roxo)
- **Secundária**: `#764ba2` (Roxo Escuro)
- **Background**: Gradiente roxo
- **Tipos**: Cores específicas por tipo (Fire, Water, Grass, etc.)

### Responsividade

Breakpoints:
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: até 767px

## 📈 Estatísticas

- **Pokémons Exibidos**: 151 (Primeira Geração)
- **Tempo de Carregamento**: ~2-3 segundos
- **Tamanho Total**: ~50KB (sem dependências externas)
- **Requisições API**: ~150+ (paralelas com Promise.all)

## 🔐 Segurança

- Validação de entrada com URLSearchParams
- Tratamento de erros de API
- Sanitização de dados exibidos no DOM
- Sem armazenamento sensível no localStorage

## 🚀 Possíveis Melhorias

- [ ] Cache com Service Workers
- [ ] Favoritos com localStorage
- [ ] Dark mode
- [ ] Comparador de pokémons
- [ ] Filtro por tipo/geração
- [ ] Infinite scroll
- [ ] Animações com CSS mais sofisticadas
- [ ] PWA (Progressive Web App)

## 👨‍💻 Autor

Desenvolvido como avaliação do 2º bimestre de Desenvolvimento Web.

**Disciplina:** Desenvolvimento Web Básico (DWB)  
**Semestre:** 2BI  
**Data:** Maio de 2026

## 📝 Licença

Este projeto é fornecido como material educacional e pode ser usado livremente para fins de aprendizado.

## 🤝 Contribuições

Sugestões e melhorias são bem-vindas!


