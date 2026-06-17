/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./listings.html",
    "./listing-detail.html",
    "./post-listing.html",
    "./js/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'text-main': 'var(--color-text-main)',
        'text-muted': 'var(--color-text-muted)',
        'border-subtle': 'var(--color-border-subtle)',
        whatsapp: '#25D366',
      },
      borderRadius: {
        card: 'var(--radius-card)',
        panel: 'var(--radius-panel)',
      },
      boxShadow: {
        modal: 'var(--shadow-modal)',
        lift: 'var(--shadow-lift)',
      },
      maxWidth: {
        container: '1200px',
      },
    },
  },
  plugins: [],
}
