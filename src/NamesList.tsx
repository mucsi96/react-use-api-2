import React, { FC, useEffect } from "react";
import { ApiError } from "./api/ApiError";
import { useGetNames } from "./api/useGetNames";

export const NamesList: FC = () => {
  const {
    names,
    loadNames,
    isLoading,
    hasMore,
    loadMore,
    error,
  } = useGetNames();

  useEffect(() => {
    loadNames();
  }, [loadNames]);

  if (error) {
    return (
      <h2>
        {"Error: "}
        {error.message}
        {error instanceof ApiError && ` (${error.status})`}
      </h2>
    );
  }

  return (
    <div>
      {names.map((name) => (
        <button type="button" key={name}>
          {name}
        </button>
      ))}
      {isLoading && "Loading..."}
      {!isLoading && hasMore && (
        <button type="button" onClick={loadMore} className="active">
          Load more
        </button>
      )}
    </div>
  );
};
