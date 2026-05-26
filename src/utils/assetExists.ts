export async function assetExists(src: string) {
  try {
    const headResponse = await fetch(src, {
      method: 'HEAD',
      cache: 'no-store'
    });

    if (headResponse.ok) {
      return true;
    }

    if (headResponse.status !== 405) {
      return false;
    }

    const getResponse = await fetch(src, {
      method: 'GET',
      cache: 'no-store'
    });

    return getResponse.ok;
  } catch {
    return false;
  }
}
