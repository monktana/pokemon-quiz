/* eslint-disable testing-library/prefer-screen-queries */
import { expect, test, type Page } from '@playwright/test';

import { TypeEffectiveness } from '../src/api/schema';
import { calculateEffectiveness } from '../src/lib/calculateEffectiveness';

const effectivenessButtonTestId: Record<TypeEffectiveness, string> = {
  [TypeEffectiveness.NoEffect]: 'no-effect-button',
  [TypeEffectiveness.NotVeryEffective]: 'not-effective-button',
  [TypeEffectiveness.Effective]: 'effective-button',
  [TypeEffectiveness.SuperEffective]: 'super-effective-button',
};

// The correct answer for a round is no longer visible on a network response -
// matchups are generated client-side now. Instead, derive it from the same
// rendered type tags (data-type attributes) a real player sees, fed through
// the same calculateEffectiveness the app itself uses.
const getTypeNames = async (page: Page, containerTestId: string): Promise<string[]> => {
  const attributes = await page
    .locator(`[data-testid="${containerTestId}"] [data-type]`)
    .evaluateAll((elements) => elements.map((element) => element.getAttribute('data-type')!));
  return attributes;
};

const getRoundEffectiveness = async (page: Page): Promise<TypeEffectiveness> => {
  const [moveType] = await getTypeNames(page, 'question');
  const defenderTypeNames = await getTypeNames(page, 'defender-pokemon');

  return calculateEffectiveness(
    { name: moveType },
    defenderTypeNames.map((name) => ({ name }))
  );
};

// The decision buttons are disabled while the next round's matchup is being
// fetched. Waiting for them to be enabled avoids reading a round's data and
// clicking after the app has already moved on to the next one.
const waitForRoundReady = async (page: Page) => {
  await expect(page.getByTestId('no-effect-button')).toBeEnabled();
};

const clickCorrectButton = async (page: Page) => {
  await waitForRoundReady(page);
  const effectiveness = await getRoundEffectiveness(page);
  await page.getByTestId(effectivenessButtonTestId[effectiveness]).click();
};

const clickIncorrectButton = async (page: Page) => {
  await waitForRoundReady(page);
  const effectiveness = await getRoundEffectiveness(page);
  const wrongEffectiveness = Object.values(TypeEffectiveness).find((e) => e !== effectiveness)!;
  await page.getByTestId(effectivenessButtonTestId[wrongEffectiveness]).click();
};

// The team has 6 Pokemon; the game only ends once all of them have fainted.
// Answering incorrectly repeatedly (up to the team size) reliably reaches game over.
const TEAM_SIZE = 6;

const loseGame = async (page: Page) => {
  for (let i = 0; i < TEAM_SIZE; i++) {
    const koCountBefore = await page.locator('[data-testid="team-pokeball"][data-status="ko"]').count();

    await clickIncorrectButton(page);

    if (await page.getByTestId('gameover-message').isVisible()) {
      return;
    }

    // Wait for the KO to actually register before reading the next round's
    // state, so a fast click loop can't race a still-in-flight round change.
    await expect(page.locator('[data-testid="team-pokeball"][data-status="ko"]')).toHaveCount(
      koCountBefore + 1
    );
  }
};

test.describe('Error', () => {
  test('it displays an error screen if the initial request fails', async ({ page }) => {
    await page.route('**/data/pokemon.json', (route) =>
      route.fulfill({
        status: 500,
        path: 'tests/fixtures/error/500.json',
      })
    );

    await page.goto('/');
    await page.getByTestId('start-game-button').click();

    await expect(page.getByTestId('error-header')).toBeVisible();
    await expect(page.getByTestId('error-header')).toHaveText('Something went wrong');

    await expect(page.getByTestId('error-message')).toBeVisible();
    await expect(page.getByTestId('error-message')).toHaveText(
      'An error occured. Please reload the site and try again.'
    );
  });

  // Note: the old "error during the game" / "keeps the score when retrying
  // after an error" tests simulated a network failure on a later round. That
  // failure mode no longer exists - rounds after the first are generated
  // from an already-loaded, in-memory dataset with no network call to fail.
});

test.describe('Game', () => {
  test('it enables the player to start a new game', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('start-game-button').click();

    await expect(page.getByTestId('score-label')).toHaveText('Score');
    await expect(page.getByTestId('score-value')).toHaveText('0');

    await expect(page.getByTestId('game-container')).toBeVisible();

    await expect(page.getByTestId('attacker-pokemon')).toBeVisible();
    await expect(page.getByTestId('defender-pokemon')).toBeVisible();
    await expect(page.getByTestId('question')).toBeVisible();

    await expect(page.getByTestId('decision-buttons')).toBeVisible();

    await expect(page.getByTestId('no-effect-button')).toBeVisible();
    await expect(page.getByTestId('no-effect-button')).toBeEnabled();

    await expect(page.getByTestId('not-effective-button')).toBeVisible();
    await expect(page.getByTestId('not-effective-button')).toBeEnabled();

    await expect(page.getByTestId('effective-button')).toBeVisible();
    await expect(page.getByTestId('effective-button')).toBeEnabled();

    await expect(page.getByTestId('super-effective-button')).toBeVisible();
    await expect(page.getByTestId('super-effective-button')).toBeEnabled();

    await expect(page.getByTestId('team-status')).toBeVisible();
    await expect(page.getByTestId('team-pokeball')).toHaveCount(TEAM_SIZE);
    await expect(page.locator('[data-testid="team-pokeball"][data-status="ok"]')).toHaveCount(TEAM_SIZE);
  });

  test('it increases the score when the guess is correct', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('start-game-button').click();
    await expect(page.getByTestId('game-container')).toBeVisible();

    await clickCorrectButton(page);

    await expect(page.getByTestId('score-value')).toHaveText('1');
  });

  test('it knocks out one team Pokemon on an incorrect guess but keeps the game going', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByTestId('start-game-button').click();
    await expect(page.getByTestId('game-container')).toBeVisible();

    await clickIncorrectButton(page);

    await expect(page.getByTestId('game-container')).toBeVisible();
    await expect(page.getByTestId('gameover-message')).not.toBeVisible();
    await expect(page.locator('[data-testid="team-pokeball"][data-status="ko"]')).toHaveCount(1);
  });

  test('it ends the game once every team Pokemon has fainted', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('start-game-button').click();
    await expect(page.getByTestId('game-container')).toBeVisible();

    await loseGame(page);

    await expect(page.getByTestId('gameover-message')).toBeVisible();
    await expect(page.getByTestId('final-score')).toBeVisible();
    await expect(page.getByTestId('new-game-button')).toBeVisible();
    await expect(page.getByTestId('new-game-button')).toBeEnabled();
    await expect(page.getByTestId('main-menu-button')).toBeVisible();
    await expect(page.getByTestId('main-menu-button')).toBeEnabled();
  });

  test('it enables the player to start a new game after losing', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('start-game-button').click();
    await expect(page.getByTestId('game-container')).toBeVisible();

    await loseGame(page);
    await expect(page.getByTestId('new-game-button')).toBeVisible();

    await page.getByTestId('new-game-button').click();

    await expect(page.getByTestId('game-container')).toBeVisible();
  });

  test('it enables the player to return to the main menu after losing', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('start-game-button').click();
    await expect(page.getByTestId('game-container')).toBeVisible();

    await loseGame(page);
    await expect(page.getByTestId('main-menu-button')).toBeVisible();

    await page.getByTestId('main-menu-button').click();

    await expect(page.getByTestId('pokeball')).toBeVisible();
    await expect(page.getByTestId('start-game-button')).toBeVisible();
    await expect(page.getByTestId('start-game-button')).toBeEnabled();
  });

  test('it displays a loading screen to the player when starting the game', async ({ page }) => {
    // A same-origin static JSON fetch is fast enough that the loading state
    // is not reliably observable without an artificial delay - unlike the
    // old remote-backend call, which was slow enough on its own.
    await page.route('**/data/pokemon.json', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });

    await page.goto('/');
    await page.getByTestId('start-game-button').click();
    await expect(page.getByTestId('loading-container')).toBeVisible();

    await expect(page.getByTestId('loading-container')).not.toBeVisible();
    await expect(page.getByTestId('game-container')).toBeVisible();
  });

  // Note: the old "loading screen during the game" test relied on real
  // network latency between rounds to catch the loading state. Rounds after
  // the first are now generated from an already-loaded in-memory dataset
  // and resolve effectively instantly, so that window no longer reliably
  // exists to test against.
});
