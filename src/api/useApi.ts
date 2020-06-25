import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "./ApiError";

export type RequestEnhancer = (request: Request) => Promise<Request>;

export type ResponseProcessor = (
  response: Response | null,
  err: Error | null
) => Promise<void>;

export type FetchSettings = {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: object;
};

let requestEnhancer: RequestEnhancer;
let responseProcessor: ResponseProcessor;

export const setRequestEnhancer = (newRequestEnhancer: RequestEnhancer) => {
  requestEnhancer = newRequestEnhancer;
};

export const setResponseProcessor = (
  newResponseProcessor: ResponseProcessor
) => {
  responseProcessor = newResponseProcessor;
};

export function useApi<R>(): [
  (fetchSettings: FetchSettings) => Promise<R>,
  boolean,
  ApiError | Error | undefined
] {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const abortController = useRef<AbortController>();

  const load = useCallback(
    async ({ url, method, body }: FetchSettings): Promise<R> => {
      try {
        let data: R | null = null;
        let err: ApiError | null = null;

        if (abortController.current) {
          abortController.current.abort();
        }

        abortController.current = new AbortController();

        setLoading(true);
        setError(undefined);
        let request = new Request(url, {
          method: method,
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
          },
          signal: abortController.current.signal,
        });
        if (typeof requestEnhancer === "function") {
          request = await requestEnhancer(request);
        }
        const response = await fetch(request);
        setLoading(false);

        if (response.ok) {
          data = await response.json();
        } else {
          err = new ApiError((await response.json()).error);
          err.setStatus(response.status);
          setError(err);
        }

        if (typeof responseProcessor === "function") {
          await responseProcessor(response, null);
        }

        if (err) {
          throw err;
        }

        return data as R;
      } catch (err) {
        if (typeof responseProcessor === "function") {
          await responseProcessor(null, err);
        }
        if (err.name !== "AbortError") {
          setLoading(false);
          setError(err);
        }
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [abortController]);

  return [load, loading, error];
}
