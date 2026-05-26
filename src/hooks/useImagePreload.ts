import { useEffect, useMemo, useState } from 'react';

export type ImagePreloadState = {
  total: number;
  loaded: number;
  failedSources: string[];
  isLoaded: boolean;
  progress: number;
};

export function useImagePreload(sources: string[]): ImagePreloadState {
  const uniqueSources = useMemo(
    () => Array.from(new Set(sources.filter(Boolean))),
    [sources]
  );

  const [state, setState] = useState<ImagePreloadState>({
    total: uniqueSources.length,
    loaded: 0,
    failedSources: [],
    isLoaded: uniqueSources.length === 0,
    progress: uniqueSources.length === 0 ? 1 : 0
  });

  useEffect(() => {
    let isCancelled = false;
    const total = uniqueSources.length;

    if (total === 0) {
      setState({
        total: 0,
        loaded: 0,
        failedSources: [],
        isLoaded: true,
        progress: 1
      });
      return;
    }

    setState({
      total,
      loaded: 0,
      failedSources: [],
      isLoaded: false,
      progress: 0
    });

    let finished = 0;
    const failedSources: string[] = [];

    const commit = () => {
      if (isCancelled) {
        return;
      }

      setState({
        total,
        loaded: finished,
        failedSources: [...failedSources],
        isLoaded: finished === total,
        progress: finished / total
      });
    };

    for (const source of uniqueSources) {
      const image = new Image();
      image.onload = () => {
        finished += 1;
        commit();
      };
      image.onerror = () => {
        finished += 1;
        failedSources.push(source);
        commit();
      };
      image.src = source;
    }

    return () => {
      isCancelled = true;
    };
  }, [uniqueSources]);

  return state;
}
