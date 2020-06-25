import { useCallback, useState } from "react";
import { useApi } from "./useApi";

type NamesResponse = {
  names: string[];
  loadMoreUrl: string;
};

export function useGetNames() {
  const [loadMoreUrl, setLoadMoreUrl] = useState<string>("");
  const [names, setNames] = useState<string[]>([]);
  const [load, isLoading, error] = useApi<NamesResponse>();

  const loadNames = useCallback(() => {
    load({
      method: "GET",
      url: "/api/names",
    })
      .then((response) => {
        setNames(response.names);
        setLoadMoreUrl(response.loadMoreUrl);
      })
      .catch(() => {});
  }, [load]);

  const loadMore = useCallback(() => {
    load({
      method: "GET",
      url: loadMoreUrl,
    })
      .then((response) => {
        setNames([...names, ...response.names]);
        setLoadMoreUrl(response.loadMoreUrl);
      })
      .catch(() => {});
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
