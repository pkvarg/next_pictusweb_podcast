import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Pictus Brand Colors
        pictus: {
          black: '#0e0f10',
          white: '#f4f2ee',
          // Moss accent ramp (Digital Oasis) — replaces the old lemon-lime scale
          // so the whole app UI reads in the same moss-on-graphite spirit.
          lime: '#94b84a',
          lime50: '#eef4dd',
          lime100: '#e4ecc9',
          lime200: '#d3e0a8',
          lime300: '#c8da90',
          lime400: '#b5c97a',
          lime500: '#a6c05f',
          lime600: '#7a9c36',
          lime700: '#62801f',
          lime800: '#4c6417',
          lime900: '#3d4a22',
          lime950: '#2a331a',
          // Graphite ramp (warm-dark neutrals)
          onyx50: '#F3F4F1',
          onyx100: '#E7E9E3',
          onyx200: '#CFD2C8',
          onyx300: '#B7BBAA',
          onyx400: '#9FA88F',
          onyx500: '#878F71',
          onyx600: '#6e6c68',
          onyx700: '#3f423f',
          onyx800: '#202325',
          onyx900: '#191b1d',
          onyx950: '#131415',
          // Bright Snow Palette (Light grays)
          snow50: '#F2F2F2',
          snow100: '#E6E6E6',
          snow200: '#CCCCCC',
          snow300: '#B3B3B3',
          snow400: '#999999',
          snow500: '#808080',
          snow600: '#666666',
          snow700: '#4D4D4D',
          snow800: '#333333',
          snow900: '#1A1A1A',
          snow950: '#121212',
        },
      },
      fontFamily: {
        'brutal-milk': ['"Brutal Milk"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
