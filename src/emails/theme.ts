export const emailTheme = {
  colors: {
    page: '#F6F7F8',
    surface: '#FFFFFF',
    text: '#161719',
    muted: '#62656A',
    subtle: '#8C8E92',
    border: '#E9EAEC',
    panel: '#F8F8F9',
    accent: '#7A1F35',
    accentSoft: '#F4E9EC',
  },
  fontFamily: "'Satoshi', Arial, Helvetica, sans-serif",
  satoshiStylesheet:
    'https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap',
  contentWidth: 600,
  assets: {
    logo:
      'https://res.cloudinary.com/dyfxkq2nk/image/upload/v1786915969/76C34E06-039E-431B-9F83-A4231D78372C_qczweo.png',
    knotty:
      'https://res.cloudinary.com/dyfxkq2nk/image/upload/v1786382511/ChatGPT_Image_Aug_10_2026_12_19_19_PM_lvpkey.png',
  },
  urls: {
    home: 'https://masseurmatch.com',
    support: 'mailto:support@masseurmatch.com',
    billing: 'mailto:billing@masseurmatch.com',
    legal: 'mailto:legal@masseurmatch.com',
  },
} as const;
