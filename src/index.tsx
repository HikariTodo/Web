/* @refresh reload */
import "uno.css";
import routes from "~solid-pages";

import { Router } from "@solidjs/router";
import { render } from "solid-js/web";
import { ErrorBoundary, Show, Suspense } from "solid-js";
import database from "./database";
import SideBar from "./components/SideBar";

render(
  () => (
    <ErrorBoundary
      fallback={(err, reset) => (
        <div onClick={reset}>error: {err.toString()}</div>
      )}
    >
      <Show
        when={!database.loading && !database.error}
        fallback={
          <Show
            when={database.error}
            fallback={
              <>
                <p>Loading the database...</p>
              </>
            }
          >
            <p>An error occurred while loading the local database.</p>
            <p>{database.error!.message}</p>
          </Show>
        }
      >
        <Router
          root={(props) => (
            <div class="flex h-screen bg-gray-50">
              <SideBar />
              <Suspense fallback={<p>loading route...</p>}>
                {props.children}
              </Suspense>
            </div>
          )}
        >
          {routes}
        </Router>
      </Show>
    </ErrorBoundary>
  ),
  document.getElementById("root")!
);
