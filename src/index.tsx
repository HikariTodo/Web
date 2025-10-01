/* @refresh reload */
import "uno.css";
import routes from "~solid-pages";

import { Router } from "@solidjs/router";
import { render } from "solid-js/web";
import { Suspense } from "solid-js";

render(
  () => (
    <Router root={(props) => <Suspense>{props.children}</Suspense>}>
      {routes}
    </Router>
  ),
  document.getElementById("root")!
);
