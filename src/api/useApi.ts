import { useCallback, useEffect, useRef } from "react";
import { ApiError } from "./ApiError";

export type FetchSettings = {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: object;
};

export type FetchFunctionResult = {
  promise: Promise<Response>;
  cancel: () => void;
};

export type FetchFunction = (
  fetchSettings: FetchSettings
) => FetchFunctionResult;

let fetchFunction: FetchFunction;

export const setFetchFunction = (newFetchFunction: FetchFunction) => {
  fetchFunction = newFetchFunction;
};

export function useApi<R>(): (fetchSettings: FetchSettings) => Promise<R> {
  const cancelRef = useRef<() => void>();

  const fetch = useCallback(async (fetchSettings: FetchSettings): Promise<
    R
  > => {
    if (cancelRef.current) {
      cancelRef.current();
    }

    const { promise, cancel } = fetchFunction(fetchSettings);

    cancelRef.current = cancel;

    const response = await promise;

    if (response.ok) {
      return (await response.json()) as R;
    } else {
      const err = new ApiError((await response.json()).error);
      err.setStatus(response.status);
      throw err;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (cancelRef.current) {
        cancelRef.current();
      }
    };
  }, [cancelRef]);

  return fetch;
}
