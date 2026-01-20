import { defineConfig } from 'vite' // DEVE ESSERE QUI UNA SOLA VOLTA
import react from '@vitejs/plugin-react' // DEVE ESSERE QUI UNA SOLA VOLTA

// https://vitejs.dev/config/
export default defineConfig({ // DEVE ESSERE QUI UNA SOLA VOLTA
  plugins: [react()],
  resolve: {
    // Questa è la riga che volevi aggiungere:
    dedupe: ['react', 'react-dom'], 
  },
})