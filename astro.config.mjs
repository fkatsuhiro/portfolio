import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: 'https://fkatsuhiro.github.io',
  base: '/portfolio', 
  
  integrations: [tailwind()],
});
