import React from 'react';

import { useTeamQuery } from '@/api';

import { Battle } from './Battle';

export function Game() {
  const { data: team } = useTeamQuery();

  return <Battle team={team} />;
}
