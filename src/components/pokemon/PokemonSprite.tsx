import React, { ImgHTMLAttributes } from 'react';
import { usePokemonContext } from '@/components';
import { cn } from '@/lib/cn';

type PokemonSpriteProps = ImgHTMLAttributes<HTMLImageElement>;

export const PokemonSprite = ({ className, ...props }: PokemonSpriteProps) => {
  const pokemon = usePokemonContext();

  return <img alt={pokemon.name!} className={cn('h-50 w-50', className)} {...props} />;
};
