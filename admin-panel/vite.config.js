import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [react()],
        server: {
            proxy: {
                '/api/cloudflare-analytics': {
                    target: 'https://api.cloudflare.com/client/v4',
                    changeOrigin: true,
                    // rewrite removed to avoid possible double-slash or missing segment issues
                    configure: (proxy, options) => {
                        proxy.on('proxyReq', (proxyReq, req, res) => {
                            // Securely attach the CF_API_TOKEN without compiling it into the React app
                            proxyReq.setHeader('Authorization', `Bearer ${env.CF_API_TOKEN || ''}`);
                        });
                    }
                }
            }
        }
    }
})
