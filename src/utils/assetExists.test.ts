import { afterEach, describe, expect, it, vi } from 'vitest';
import { assetExists } from './assetExists';

describe('assetExists', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when a static asset responds to HEAD', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200 })
    );

    await expect(assetExists('/assets/classroom/original.png')).resolves.toBe(true);
  });

  it('falls back to GET when the server does not allow HEAD', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 405 })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);

    await expect(assetExists('/assets/classroom/bg_wall.png')).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({ method: 'GET' });
  });

  it('returns false when both asset probes fail', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404 })
    );

    await expect(assetExists('/assets/classroom/missing.png')).resolves.toBe(false);
  });
});
