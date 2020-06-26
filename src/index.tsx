import React from "react";
import ReactDOM from "react-dom";
import {
  FetchFunctionResult,
  FetchSettings,
  setFetchFunction,
} from "./api/useApi";
import App from "./App";
import "./index.css";
import * as serviceWorker from "./serviceWorker";

setFetchFunction(
  ({ url, method, body }: FetchSettings): FetchFunctionResult => {
    const abortController = new AbortController();
    const request = new Request(url, {
      method: method,
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
      signal: abortController.signal,
    });
    return {
      promise: fetch(request),
      cancel: () => {
        abortController.abort();
      },
    };
  }
);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
