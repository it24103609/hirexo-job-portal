import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');

          if (normalizedId.includes('/src/pages/dashboard/')) {
            if (normalizedId.includes('/Admin')) return 'dashboard-admin';
            if (normalizedId.includes('/Employer')) return 'dashboard-employer';
            if (normalizedId.includes('/Candidate')) return 'dashboard-candidate';
            if (normalizedId.includes('/NotificationsPage')) return 'dashboard-shared';
          }

          if (normalizedId.includes('/src/pages/public/')) {
            if (normalizedId.includes('/HomePage') || normalizedId.includes('/AboutPage') || normalizedId.includes('/ServicesPage')) {
              return 'public-marketing';
            }
            if (normalizedId.includes('/JobsPage') || normalizedId.includes('/JobDetailsPage')) {
              return 'public-jobs';
            }
            if (normalizedId.includes('/AuthPage') || normalizedId.includes('/LoginPage') || normalizedId.includes('/RegisterPage') || normalizedId.includes('/ForgotPasswordPage') || normalizedId.includes('/ResetPasswordPage')) {
              return 'public-auth';
            }
            if (normalizedId.includes('/BlogListPage') || normalizedId.includes('/BlogDetailsPage')) {
              return 'public-blog';
            }
          }

          if (!normalizedId.includes('node_modules')) return;

          if (normalizedId.includes('/react/') || normalizedId.includes('/react-dom/') || normalizedId.includes('/scheduler/')) {
            return 'react-core';
          }

          if (normalizedId.includes('/react-router/') || normalizedId.includes('/react-router-dom/')) {
            return 'router';
          }

          if (normalizedId.includes('/react-hook-form/') || normalizedId.includes('/@hookform/') || normalizedId.includes('/zod/')) {
            return 'forms';
          }

          if (normalizedId.includes('/lucide-react/') || normalizedId.includes('/react-toastify/') || normalizedId.includes('/clsx/')) {
            return 'ui-vendor';
          }

          if (normalizedId.includes('/axios/')) {
            return 'http';
          }
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
