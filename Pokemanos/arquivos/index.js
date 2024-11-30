const { createApp } = Vue;

createApp({
    data() {
        return {
            pokemons: [],
            loading: true,
            searchText: '',
            nextPage: 1
        };
    },
    created() {
        this.callAPI();
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeUnmount() { // O método correto é 'beforeUnmount' ao invés de 'destroyed'
        window.removeEventListener('scroll', this.handleScroll);
    },
    methods: {
        async callAPI() {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?offset=${(this.nextPage - 1) * 151}&limit=151`);
                const data = await response.json();
                const pokemonDetailsPromises = data.results.map(async pokemon => this.fetchPokemonData(pokemon.url));
                const pokemonDetails = await Promise.all(pokemonDetailsPromises);
                this.pokemons = [...this.pokemons, ...pokemonDetails];
                this.nextPage++;
                this.loading = false;
            } catch (error) {
                console.error(error);
            }
        },
        async fetchPokemonData(url) {
            try {
                const response = await fetch(url);
                const data = await response.json();
                return {
                    id: data.id,
                    name: this.capitalize(data.name),
                    weight: data.weight,
                    types: data.types,
                    sprites: data.sprites,
                    showDetails: false
                };
            } catch (e) {
                console.error(e);
            }
        },
        handleScroll() {
            const bottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight;
            if (bottomOfWindow && !this.loading) {
                this.loading = true;
                this.callAPI();
            }
        },
        getTypeClass(pokemon) {
            const types = pokemon.types.map(type => type.type.name);
            if (types.length === 1) {
                return `single-type ${types[0]}`;
            } else {
                return `dual-type ${types[0]} type2-${types[1]}`;
            }
        },
        capitalize(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    },
    computed: {
        filteredPokemons() {
            return this.pokemons.filter(pokemon =>
                pokemon.name.toLowerCase().includes(this.searchText.toLowerCase())
            );
        }
    }
}).mount('#app');