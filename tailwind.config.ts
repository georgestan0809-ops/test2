import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        status: {
          ok: '#166534',
          warning: '#b45309',
          risk: '#b91c1c'
        }
      }
    }
  },
  plugins: []
};

export default config;
