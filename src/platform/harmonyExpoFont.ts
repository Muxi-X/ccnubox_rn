import * as React from 'react';

const loadedFonts = new Set<string>();

const normalizeFontFamilies = (
  fontFamilyOrFontMap: string | Record<string, unknown>
): string[] => {
  if (typeof fontFamilyOrFontMap === 'string') {
    return [fontFamilyOrFontMap];
  }

  return Object.keys(fontFamilyOrFontMap);
};

export const FontDisplay = {
  AUTO: 'auto',
  BLOCK: 'block',
  FALLBACK: 'fallback',
  OPTIONAL: 'optional',
  SWAP: 'swap',
} as const;

export const isLoaded = (fontFamily: string) => loadedFonts.has(fontFamily);

export const getLoadedFonts = () => Array.from(loadedFonts);

export const isLoading = () => false;

export const loadAsync = async (
  fontFamilyOrFontMap: string | Record<string, unknown>,
  _source?: unknown
) => {
  normalizeFontFamilies(fontFamilyOrFontMap).forEach(fontFamily => {
    if (fontFamily) {
      loadedFonts.add(fontFamily);
    }
  });
};

export const unloadAsync = async (
  fontFamilyOrFontMap: string | Record<string, unknown>
) => {
  normalizeFontFamilies(fontFamilyOrFontMap).forEach(fontFamily => {
    loadedFonts.delete(fontFamily);
  });
};

export const unloadAllAsync = async () => {
  loadedFonts.clear();
};

export const useFonts = (
  fontFamilyOrFontMap: string | Record<string, unknown>
): [boolean, Error | null] => {
  const [loaded, setLoaded] = React.useState(() =>
    normalizeFontFamilies(fontFamilyOrFontMap).every(fontFamily =>
      loadedFonts.has(fontFamily)
    )
  );
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let active = true;

    loadAsync(fontFamilyOrFontMap)
      .then(() => {
        if (active) {
          setLoaded(true);
        }
      })
      .catch(caughtError => {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError
              : new Error(String(caughtError))
          );
        }
      });

    return () => {
      active = false;
    };
  }, [fontFamilyOrFontMap]);

  return [loaded, error];
};

export const renderToImageAsync = async () => null;
