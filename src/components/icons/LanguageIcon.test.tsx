import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { LanguageIcon } from '@/components';

describe('<LanguageIcon />', () => {
  it('renders the German flag for de', () => {
    render(<LanguageIcon type="de" data-testid="language-icon" />);
    expect(screen.getByTestId('language-icon')).toBeVisible();
  });

  it('renders the British flag for en', () => {
    render(<LanguageIcon type="en" data-testid="language-icon" />);
    expect(screen.getByTestId('language-icon')).toBeVisible();
  });

  it('logs an error and renders nothing for an unsupported language', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      // @ts-expect-error intentionally passing an unsupported language
      <LanguageIcon type="fr" data-testid="language-icon" />
    );

    expect(container).toBeEmptyDOMElement();
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('fr'));

    consoleError.mockRestore();
  });
});
