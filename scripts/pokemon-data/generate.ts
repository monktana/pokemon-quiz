/**
 * Generates the static public/data/{pokemon,moves,types}.json dataset from
 * PokeAPI. Re-runnable and additive: running it again with a wider ID range
 * merges into the existing files instead of rebuilding from scratch, so
 * adding a future generation is just "widen the range, re-run, commit".
 *
 * Usage:
 *   npx tsx scripts/pokemon-data/generate.ts --from 1 --to 151
 */
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fetchMove, fetchPokemon, fetchSpecies, fetchType } from './pokeapi';
import { isAttackingMove, toMoveRecord, toPokemonRecord, toTypeRecord } from './transform';
import type { MoveRecord, PokemonRecord, TypeRecord } from './types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../../public/data');
const CONCURRENCY = 5;

const parseArgs = (argv: string[]): { from: number; to: number } => {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, '');
    const value = argv[i + 1];
    if (key && value) args.set(key, value);
  }
  return {
    from: Number(args.get('from') ?? 1),
    to: Number(args.get('to') ?? 151),
  };
};

const readExisting = <T extends { id: number }>(filename: string): T[] => {
  const path = resolve(DATA_DIR, filename);
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, 'utf-8')) as T[];
};

const mergeById = <T extends { id: number }>(existing: T[], incoming: T[]): T[] => {
  const byId = new Map(existing.map((item) => [item.id, item]));
  for (const item of incoming) byId.set(item.id, item);
  return Array.from(byId.values()).sort((a, b) => a.id - b.id);
};

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
};

async function generate({ from, to }: { from: number; to: number }) {
  const typeCache = new Map<string, TypeRecord>();
  const moveCache = new Map<string, MoveRecord | null>(); // null = checked, not an attacking move

  const ensureType = async (nameOrUrl: string): Promise<TypeRecord> => {
    const cached = typeCache.get(nameOrUrl);
    if (cached) return cached;
    const record = toTypeRecord(await fetchType(nameOrUrl));
    typeCache.set(nameOrUrl, record);
    return record;
  };

  const ensureMove = async (nameOrUrl: string): Promise<MoveRecord | null> => {
    if (moveCache.has(nameOrUrl)) return moveCache.get(nameOrUrl)!;
    const pokeApiMove = await fetchMove(nameOrUrl);
    if (!isAttackingMove(pokeApiMove)) {
      moveCache.set(nameOrUrl, null);
      return null;
    }
    const type = await ensureType(pokeApiMove.type.name);
    const record = toMoveRecord(pokeApiMove, type.id);
    moveCache.set(nameOrUrl, record);
    return record;
  };

  const generatePokemon = async (id: number): Promise<PokemonRecord> => {
    const pokemon = await fetchPokemon(id);
    const species = await fetchSpecies(pokemon.species.name);

    const types = await Promise.all(pokemon.types.map((t) => ensureType(t.type.name)));
    const moves = await Promise.all(pokemon.moves.map((m) => ensureMove(m.move.name)));

    return toPokemonRecord(
      pokemon,
      species,
      types.map((t) => t.id),
      moves.filter((m): m is MoveRecord => m !== null).map((m) => m.id)
    );
  };

  const ids = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const pokemonRecords: PokemonRecord[] = [];

  for (const batch of chunk(ids, CONCURRENCY)) {
    const results = await Promise.all(
      batch.map(async (id) => {
        console.log(`Fetching Pokemon #${id}...`);
        return generatePokemon(id);
      })
    );
    pokemonRecords.push(...results);
  }

  const pokemon = mergeById(readExisting<PokemonRecord>('pokemon.json'), pokemonRecords);
  const moves = mergeById(
    readExisting<MoveRecord>('moves.json'),
    Array.from(moveCache.values()).filter((m): m is MoveRecord => m !== null)
  );
  const types = mergeById(readExisting<TypeRecord>('types.json'), Array.from(typeCache.values()));

  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(resolve(DATA_DIR, 'pokemon.json'), JSON.stringify(pokemon, null, 2));
  writeFileSync(resolve(DATA_DIR, 'moves.json'), JSON.stringify(moves, null, 2));
  writeFileSync(resolve(DATA_DIR, 'types.json'), JSON.stringify(types, null, 2));

  console.log(
    `Wrote ${pokemon.length} pokemon, ${moves.length} moves, ${types.length} types to ${DATA_DIR}`
  );
}

generate(parseArgs(process.argv.slice(2))).catch((error) => {
  console.error(error);
  process.exit(1);
});
