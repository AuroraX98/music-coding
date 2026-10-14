import {defineConfig} from 'vite';

export default defineConfig({
  server: {watch: {ignored: ['**/.qa/**', '**/.studio-server.json']}},
});
