import React, { HTMLAttributes } from 'react';
import { getResourceName, usePokemonContext } from '@/components';
import { cn } from '@/lib/cn';
import { useLanguage } from '@/stores';

type PokemonNameProps = HTMLAttributes<HTMLSpanElement>;

export const PokemonName = ({ className, ...props }: PokemonNameProps) => {
  const language = useLanguage();
  const pokemon = usePokemonContext();

  return (
    <span
      {...props}
      className={cn(
        'block w-full truncate text-2xl leading-[1.1] font-bold tracking-[-0.012em]',
        className
      )}
    >
      {getResourceName(pokemon.species!.names!, language)}
    </span>
  );
};
