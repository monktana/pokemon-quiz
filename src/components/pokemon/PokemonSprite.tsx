import React, { ImgHTMLAttributes } from 'react';
import { usePokemonContext } from '@/components';
import { cn } from '@/lib/cn';

type PokemonSpriteProps = ImgHTMLAttributes<HTMLImageElement>;

export const PokemonSprite = ({ className, ...props }: PokemonSpriteProps) => {
  const pokemon = usePokemonContext();

  return (
    <img
      alt={pokemon.name!}
      className={cn('h-24 w-24 shrink-0 sm:h-32 sm:w-32 md:h-36 md:w-36', className)}
      {...props}
    />
  );
};
