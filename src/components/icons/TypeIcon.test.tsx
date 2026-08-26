import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { TypeIcon } from '@/components';

describe('<TypeIcon />', () => {
  it('renders the icon matching a known type', () => {
    render(<TypeIcon type="fire" data-testid="type-icon" />);
    expect(screen.getByTestId('type-icon')).toBeVisible();
  });

  it('logs an error and renders nothing for an unknown type', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      // @ts-expect-error intentionally passing an unsupported type
      <TypeIcon type="cosmic" data-testid="type-icon" />
    );

    expect(container).toBeEmptyDOMElement();
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('cosmic'));

    consoleError.mockRestore();
  });
});
