import { defineConfig } from 'vocs'

export default defineConfig({
  title: 'Docs',
  logoUrl: '/pwn-white.svg',
  sidebar: [
    {
      text: 'Getting Started',
      link: '/getting-started',
    },
    {
      text: 'SDKs',
      items: [
        {
          text: 'React',
          link: '/react-examples',
        },
        {
          text: 'Vue',
          link: '/vue-examples',
        },
      ],
    },
    {
      text: 'API Reference',
      link: '/api-reference',
    },
  ],
  // Brand theme configuration
  theme: {
    accentColor: '#00FFE0',
    colorScheme: 'dark',
    variables: {
      color: {
        background: '#111111', 
        backgroundDark: '#080808',
        background3: '#080808',
        
        text: '#F3F1FF', 
        text3: '#F3F1FF',
        border: '#434343', 
      },
      fontFamily: {
        default: '"Supreme", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
      },
    }
  },
})
