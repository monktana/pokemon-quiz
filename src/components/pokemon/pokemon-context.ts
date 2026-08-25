import { createContext } from '@/hooks';
import { Pokemon } from '@/api';

const [PokemonContextProvider, usePokemonContext, PokemonContext] = createContext<Pokemon>({
  name: 'PokemonContext',
  hookName: 'usePokemonContext',
  providerName: 'PokemonContextProvider',
});

export { PokemonContextProvider, usePokemonContext, PokemonContext };
