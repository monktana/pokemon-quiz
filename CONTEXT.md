# Pokémon Quiz

A browser quiz that tests players on Pokémon type match-ups: shown an attack and a target, the player guesses how effective it is.

## Language

### The quiz loop

**Round**:
One cycle of the quiz — a Matchup is shown, the player guesses, and a Round Outcome resolves it. A game is a sequence of Rounds until the player's whole Team has fainted.

**Round Outcome**:
What a guess resolves into: the player keeps answering, a Switch happens, the active Pokémon Faints, or (once the last Team member has fainted) the game ends.

**Switch**:
The active Pokémon is swapped for a random, non-fainted Teammate after a correct guess, independent of fainting. A deliberate variety mechanic so a long correct streak doesn't keep quizzing the same attacker (and by extension, largely the same Move Types) round after round.
_Avoid_: swap

**Faint**:
The active Pokémon is knocked out after a wrong guess and takes no further part in the game.
_Avoid_: KO, eliminate

### Type matching

**Matchup**:
The active Pokémon (attacker), a randomly chosen opposing Pokémon (defender), an attack with its own Move Type drawn from the attacker's move pool, and the resulting Effectiveness Bucket — the unit of data behind one Round's question.

**Move Type**:
The single elemental type of the specific attack used this Round. This - not the attacking Pokémon's own Pokémon Type - is what's checked against the defender's Pokémon Type to produce the Effectiveness Bucket: a Fire-type Pokémon using a Ground-type move is judged as Ground vs. the defender, never as Fire vs. it. The most common source of player confusion this quiz produces - it's easy to see the attacker's own type first and reason from that instead.
_Avoid_: attack type, "the attacker's type" (ambiguous with Pokémon Type - say which one is meant)

**Pokémon Type**:
A Pokémon's own intrinsic elemental type(s) - one or two, fixed for that Pokémon. Distinct from Move Type: a Pokémon's Pokémon Type only matters as the defender's side of a Matchup. On the attacker's side, only the used attack's Move Type is relevant, not the attacking Pokémon's Pokémon Type.
_Avoid_: "type" alone whenever the distinction from Move Type matters

**Effectiveness Bucket**:
The four-way classification an attack's type effectiveness collapses into: No Effect, Not Very Effective, Effective, or Super Effective. What Simple difficulty asks the player to guess.
_Avoid_: effectiveness (alone, when a specific bucket is meant)

**Multiplier**:
The precise numeric type-effectiveness value (×0, ×¼, ×½, ×1, ×2, ×4) that an Effectiveness Bucket is derived from. What Expert difficulty asks the player to guess instead of the bucket.

### Roster

**Team**:
The player's six Pokémon for one game. Exactly one is active (the current attacker) at a time; the rest wait to be Switched in or take over after a Faint.
