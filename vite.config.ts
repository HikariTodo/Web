import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import pages from "vite-plugin-pages";
import unocss from "unocss/vite";

export default defineConfig({
  plugins: [unocss(), solid(), pages()],
});
