import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import pages from "vite-plugin-pages";
import unocss from "unocss/vite";
import icons from "unplugin-icons/vite";

export default defineConfig({
  plugins: [unocss(), icons({ compiler: "solid" }), solid(), pages()],
});
