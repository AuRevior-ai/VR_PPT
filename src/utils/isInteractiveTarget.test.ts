import { describe, expect, it } from 'vitest';
import { isInteractiveTarget } from './isInteractiveTarget';

describe('isInteractiveTarget', () => {
  it('treats nested content inside a button as interactive', () => {
    const spanInsideButton = {
      closest: (selector: string) => (selector.includes('button') ? {} : null)
    } as unknown as EventTarget;

    expect(isInteractiveTarget(spanInsideButton)).toBe(true);
  });

  it('treats form inputs as interactive', () => {
    const input = {
      closest: (selector: string) => (selector.includes('input') ? {} : null)
    } as unknown as EventTarget;

    expect(isInteractiveTarget(input)).toBe(true);
  });

  it('does not treat the plain scene surface as interactive', () => {
    const div = {
      closest: () => null
    } as unknown as EventTarget;

    expect(isInteractiveTarget(div)).toBe(false);
  });
});
