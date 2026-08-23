import React, { HTMLAttributes } from 'react';
import { types, TypeTag, usePokemonContext } from '@/components';
import { cn } from '@/lib/cn';

type PokemonTagsProps = HTMLAttributes<HTMLDivElement>;

export const PokemonTags = ({ className, ...props }: PokemonTagsProps) => {
  const pokemon = usePokemonContext();

  return (
    <div className={cn('flex gap-1', className)} {...props}>
      {pokemon.types?.map((type) => (
        <TypeTag key={type.id} type={type.name! as types} text={type.names!} />
      ))}
    </div>
  );
};