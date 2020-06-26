import { useCallback, useState } from "react";
import { ApiError } from "./ApiError";
import { FetchSettings, useApi } from "./useApi";

export function useApiWithState<R>(): [
  R | undefined,
  (fetchSettings: FetchSettings, cb?: (response: R) => void) => Promise<void>,
  boolean,
  ApiError | Error | undefined
] {
  const [data, setData] = useState<R>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const fetch = useApi<R>();

  const load = useCallback(
    async (
      fetchSettings: FetchSettings,
      cb?: (response: R) => void
    ): Promise<void> => {
      try {
        setLoading(true);
        setData(undefined);
        setError(undefined);
        const data = await fetch(fetchSettings);
        setLoading(false);
        setData(data);
        if (typeof cb === "function") {
          cb(data);
        }
      } catch (err) {
        setLoading(false);
        if (err.name !== "AbortError") {
          setError(err);
        } else {
          setData(undefined);
        }
      }
    },
    [fetch]
  );

  return [data, load, loading, error];
}
