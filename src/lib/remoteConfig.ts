import { useState, useEffect } from "react";
import { getRemoteConfig, fetchAndActivate, getValue } from "firebase/remote-config";
import { _app } from "./firebase";

export interface FeatureFlags {
  showPersonalBlog: boolean;
  showWorksProduct: boolean;
  showFastRetailing: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  showPersonalBlog: false,
  showWorksProduct: false,
  showFastRetailing: false,
};

let _cached: FeatureFlags | null = null;
let _promise: Promise<FeatureFlags> | null = null;

function loadFlags(): Promise<FeatureFlags> {
  if (_cached) return Promise.resolve(_cached);
  if (_promise) return _promise;

  _promise = (async () => {
    try {
      const rc = getRemoteConfig(_app);
      rc.defaultConfig = DEFAULT_FLAGS as unknown as Record<string, string | number | boolean>;
      // 開発中は毎回 fetch、本番は 1 時間キャッシュ
      rc.settings.minimumFetchIntervalMillis = import.meta.env.DEV ? 0 : 3_600_000;

      await fetchAndActivate(rc);

      _cached = {
        showPersonalBlog: getValue(rc, "showPersonalBlog").asBoolean(),
        showWorksProduct: getValue(rc, "showWorksProduct").asBoolean(),
        showFastRetailing: getValue(rc, "showFastRetailing").asBoolean(),
      };
    } catch {
      _cached = { ...DEFAULT_FLAGS };
    }
    if (typeof window !== "undefined") {
      (window as unknown as Record<string, unknown>).__REMOTE_CONFIG__ = _cached;
    }
    return _cached!;
  })();

  return _promise;
}

export function useFeatureFlags(): { flags: FeatureFlags; loading: boolean } {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlags().then((f) => {
      setFlags(f);
      setLoading(false);
    });
  }, []);

  return { flags, loading };
}
