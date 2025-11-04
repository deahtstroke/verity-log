# Verity Log

This repo contains all the source code for my personal portfolio I dubbed
`verity-log`. Why is it called 'verity'? According to the Merriam Webster dictionary
the word [verity](https://www.merriam-webster.com/dictionary/verity) means
the state of being true or real. This website-portfolio is a true expression of
who I am and how I showcase myself to other people about my career and
aspirations. And why 'log'? That's because I treat it as a ledger of
all my achievements, projects, experiences, and blog notes (in the future).

## Live Site

[Visit my portfolio](https://danielvm.dev)

## Technology Stack

- [Typescript](https://typescriptlang.org) - Javascript with better type inference
- [Svelte](https://svelte.dev) - UI component framework
- [SvelteKit](https://svelte.dev) - A framework utilities for client-side
routing, server-side rendering, and data fetching
- [TailwindCSS](https://tailwindcss.com) - CSS library for optimized inline styles
- [Vite](http://vite.dev) - Build tool for frontend applications

## Project Structure

``` txt
src/
├── lib/
│   ├── components/
│   │   ├── … (component files)
│   │   └── …
│   ├── types/
│   │   ├── … (custom types)
│   │   └── …
│   ├── data/
│   │   ├── … (static or dynamically fetched data)
│   │   └── …
│   └── main.ts
└── utils/
    ├── … (utility files)
    │
    │ routes/
    └── … (page files)
static/
├── assets/ 
    └── .. (static assets)
```

## Other Features

The contact page is served through a custom-made web server in Go I to validate
CloudFlare's Turnstile token sent through the `/contact` form. Additionally, I'm
using Mailgun to send emails through my web server.

## License

MIT License - Feel free to fork or use this template for your own portfolio. Just
make sure you replace your my `resume.pdf` file with your own in the static folder.

___
Built with ❤️ by Daniel
