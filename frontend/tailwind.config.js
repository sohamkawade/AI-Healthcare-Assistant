module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html", 
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Add custom colors for dark mode
        primary: {
          light: '#4F46E5', // Light mode primary color
          dark: '#1E40AF',  // Dark mode primary color
        },
        background: {
          light: '#FFFFFF', // Light mode background
          dark: '#1A202C',  // Dark mode background
        },
        text: {
          light: '#1F2937', // Light mode text color
          dark: '#F9FAFB',  // Dark mode text color
        },
      },
    },
  },
  plugins: [],
};
