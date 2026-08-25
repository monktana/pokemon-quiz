import React, { SVGProps } from 'react';

import { BugIcon } from './Bug';
import { DarkIcon } from './Dark';
import { DragonIcon } from './Dragon';
import { ElectricIcon } from './Electric';
import { FairyIcon } from './Fairy';
import { FightingIcon } from './Fighting';
import { FireIcon } from './Fire';
import { FlyingIcon } from './Flying';
import { GhostIcon } from './Ghost';
import { GrassIcon } from './Grass';
import { GroundIcon } from './Ground';
import { IceIcon } from './Ice';
import { NormalIcon } from './Normal';
import { PoisonIcon } from './Poison';
import { PsychicIcon } from './Psychic';
import { RockIcon } from './Rock';
import { SteelIcon } from './Steel';
import { WaterIcon } from './Water';

export const Types = [
  'bug',
  'dark',
  'dragon',
  'electric',
  'fairy',
  'fighting',
  'fire',
  'flying',
  'ghost',
  'grass',
  'ground',
  'ice',
  'normal',
  'poison',
  'psychic',
  'rock',
  'steel',
  'water',
] as const;

export type types = (typeof Types)[number];

export const TypeIcon = ({ type, ...rest }: { type: types } & SVGProps<SVGSVGElement>) => {
  switch (type) {
    case 'bug':
      return <BugIcon {...rest} />;
    case 'dark':
      return <DarkIcon {...rest} />;
    case 'dragon':
      return <DragonIcon {...rest} />;
    case 'electric':
      return <ElectricIcon {...rest} />;
    case 'fairy':
      return <FairyIcon {...rest} />;
    case 'fighting':
      return <FightingIcon {...rest} />;
    case 'fire':
      return <FireIcon {...rest} />;
    case 'flying':
      return <FlyingIcon {...rest} />;
    case 'ghost':
      return <GhostIcon {...rest} />;
    case 'grass':
      return <GrassIcon {...rest} />;
    case 'ground':
      return <GroundIcon {...rest} />;
    case 'ice':
      return <IceIcon {...rest} />;
    case 'normal':
      return <NormalIcon {...rest} />;
    case 'poison':
      return <PoisonIcon {...rest} />;
    case 'psychic':
      return <PsychicIcon {...rest} />;
    case 'rock':
      return <RockIcon {...rest} />;
    case 'steel':
      return <SteelIcon {...rest} />;
    case 'water':
      return <WaterIcon {...rest} />;
    default:
      console.error(`no type icon found for: ${type}`);
      break;
  }
};
