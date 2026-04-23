module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['dark', 'light', 'forest', 'ocean', 'sunset', 'pastel', 'midnight', 'coffee', 'sky', 'cherry']
  }
}
