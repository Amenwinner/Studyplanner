import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

function mountApp() {
  const container = document.getElementById('root');
  if (!container) return;

  try {
    const root = createRoot(container);
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    // Mark application as successfully mounted
    (window as any).__septemstudy_mounted = true;
  } catch (err: any) {
    console.error('Fatal error during React root mounting:', err);
    container.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #0f172a; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; padding: 24px;">
        <div style="max-width: 480px; width: 100%; background: #1e293b; border: 1px solid #ef4444; border-radius: 16px; padding: 28px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(239,68,68,0.15); color: #f87171; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 24px;">⚠</div>
          <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 8px; color: #f8fafc;">Application Startup Error</h2>
          <p style="font-size: 13px; color: #94a3b8; margin-bottom: 16px; line-height: 1.5;">An error prevented the workspace from initializing.</p>
          <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 11px; color: #fca5a5; text-align: left; margin-bottom: 20px; overflow-x: auto; max-height: 120px;">
            ${err?.message || String(err)}
          </div>
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button onclick="window.location.reload()" style="background: #4f46e5; color: white; border: none; font-weight: 600; font-size: 13px; padding: 10px 18px; border-radius: 10px; cursor: pointer;">Reload</button>
            <button onclick="localStorage.clear(); window.location.reload();" style="background: #334155; color: #e2e8f0; border: none; font-weight: 600; font-size: 13px; padding: 10px 18px; border-radius: 10px; cursor: pointer;">Reset Storage & Reload</button>
          </div>
        </div>
      </div>
    `;
  }
}

// Immediate mount if #root exists in the DOM; fallback to DOMContentLoaded if script runs ahead of DOM
if (document.getElementById('root')) {
  mountApp();
} else {
  document.addEventListener('DOMContentLoaded', mountApp);
}
