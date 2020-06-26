import { useCallback, useState } from "react";
import { useApiWithState } from "./useApiWithState";

type NamesResponse = {
  names: string[];
  loadMoreUrl: string;
};

export function useGetNames() {
  const [loadMoreUrl, setLoadMoreUrl] = useState<string>("");
  const [names, setNames] = useState<string[]>([]);
  const [, load, isLoading, error] = useApiWithState<NamesResponse>();

  const loadNames = useCallback(() => {
    load(
      {
        method: "GET",
        url: "/api/names",
      },
      ({ names, loadMoreUrl }) => {
        setNames(names);
        setLoadMoreUrl(loadMoreUrl);
      }
    );
  }, [load]);

  const loadMore = useCallback(() => {
    load(
      {
        method: "GET",
        url: loadMoreUrl,
      },
      ({ names: newNames, loadMoreUrl }) => {
        setNames([...names, ...newNames]);
        setLoadMoreUrl(loadMoreUrl);
      }
    );
  }, [load, names, loadMoreUrl]);

  return {
    loadNames,
    names,
    isLoading,
    error,
    hasMore: !!loadMoreUrl,
    loadMore,
  };
}
