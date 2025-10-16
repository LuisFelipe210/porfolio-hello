import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
    server: {
        host: "::",
        port: 8080, // O seu site (frontend) irá correr aqui
        // --- ADICIONE ESTA SECÇÃO DE PROXY ---
        proxy: {
            '/api': {
                target: 'http://localhost:3000', // Redireciona para o servidor das APIs
                changeOrigin: true,
            },
        },
        // ------------------------------------
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));