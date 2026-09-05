import { chance } from '@/lib/random';

// Kept low: STAB questions are a bonus layer on top of the effectiveness
// question, not a coin flip - most rounds should still be effectiveness.
const STAB_QUESTION_CHANCE = 0.2;
export const shouldAskStab = (): boolean => chance(STAB_QUESTION_CHANCE);

// Kept fairly high: a switch is a lightweight, non-punishing transition (no
// fainting involved), so it can afford to show up more often than the STAB
// question chance without disrupting the core guessing loop.
const ATTACKER_SWITCH_CHANCE = 0.4;
export const shouldSwitchAttacker = (): boolean => chance(ATTACKER_SWITCH_CHANCE);
