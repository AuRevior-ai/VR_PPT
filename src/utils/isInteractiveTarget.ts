const interactiveSelector = [
  'a[href]',
  'button',
  'input',
  'label',
  'select',
  'summary',
  'textarea',
  '[role="button"]',
  '[role="switch"]',
  '[data-scene-interactive="true"]'
].join(',');

export function isInteractiveTarget(target: EventTarget | null) {
  const maybeElement = target as { closest?: (selector: string) => Element | object | null } | null;

  if (!maybeElement || typeof maybeElement.closest !== 'function') {
    return false;
  }

  return Boolean(maybeElement.closest(interactiveSelector));
}
