import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pictus Brand Colors
        pictus: {
          black: '#141511',
          white: '#F8F8F8',
          lime: '#B6E036',
          // Lemon Lime Palette
          lime50: '#F7FCE9',
          lime100: '#EFFBD3',
          lime200: '#DFFA7',
          lime300: '#CEEA7B',
          lime400: '#BEE34F',
          lime500: '#AEDD22',
          lime600: '#9BD015',
          lime700: '#88B419',
          lime800: '#6F9618',
          lime900: '#5C7D17',
          lime950: '#32470C',
          // Onyx Palette (Dark grays)
          onyx50: '#F3F4F1',
          onyx100: '#E7E9E3',
          onyx200: '#CFD2C8',
          onyx300: '#B7BBAA',
          onyx400: '#9FA8F',
          onyx500: '#878F71',
          onyx600: '#6C710B',
          onyx700: '#515944',
          onyx800: '#3B3920',
          onyx900: '#1B1C17',
          onyx950: '#13140D',
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
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
