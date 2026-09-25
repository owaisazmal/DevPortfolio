# My Portfolio

Welcome to my personal portfolio, built using **Next.js**! This project showcases my skills, projects, and experience. Feel free to explore and reach out if you'd like to connect.

## Table of Contents

- [Demo](#demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Using This as a Template](#using-this-as-a-template)
- [License](#license)

## Demo

Check out the live version of my portfolio [here](https://owaisazmal.github.io/DevPortfolio/).

## Features

The whole site is a love letter to the classic Macintosh desktop (System 7), rebuilt for a modern, responsive web.

### The desktop

- **Startup sequence**: Every visit boots up like an old Mac: the screen warms up, a happy phone appears, the welcome box loads its extensions and the page dithers into view. Any key, click or tap skips it.
- **Menu bar**: File, Edit, View, Special and Help menus with full keyboard navigation, plus a live Los Angeles clock and temperature.
- **Real windows**: Collapse a window into its title bar, zoom it to full width, or roll every window up at once from the Edit menu.
- **Night Mode**: A dark-paper theme that's remembered on your next visit.
- **Desktop Patterns**: Paint an 8×8 tile and the whole page wears it.
- **Sound effects**: Optional square-wave clicks and chirps, and a startup chime on Restart. Off by default.
- **Balloon Help**: Switch it on from the Help menu and every part of the page explains itself.
- **Find File**: Press `/` or `Cmd/Ctrl + K` to search every project, job and command on the page.
- **Screensaver**: Kicks in after two idle minutes on desktop, or straight away from Special › Sleep.
- **Desk accessories**: A sliding-tile Puzzle cut from my avatar, and Weather Util, a one-bit remake of my weather app running on live data from [Open-Meteo](https://open-meteo.com).

### The work

- **Phone preview**: The hero phone flips between a lock screen of notifications, a home screen of my apps (tap an icon for details) and a Messages thread.
- **Projects**: Screenshots are dithered down to one bit and come into color on hover, or as you scroll past on a phone. Filter by iOS, Android or Web, and open a Get Info window for the full stack, with created and modified dates pulled live from GitHub.
- **Experience**: My work history as a Finder list view, with sortable columns and folders that open to show what I did there.
- **currently.log**: A status window showing my latest public push, straight from the GitHub API.
- **Offers**: Pitch me an app idea on a fill-in-the-blanks stationery pad, or sign up for my beta programme through a mock installer, with a seat counter showing how many spots are left.
- **Contact**: A System 7 alert box with a Regarding menu. Pick freelance, beta testing, an app idea or just saying hi, and OK opens the matching email, the pitch pad or the beta installer.
- **Scroll ruler**: A ruler down the left edge shows where you are on the page and jumps between sections.

### Under the hood

- **Responsive**: Designed for phones, tablets and desktops alike.
- **Accessible**: Keyboard-friendly menus and dialogs, and animations switch off for anyone who prefers reduced motion.
- **Static**: Exported as a fully static site and hosted on GitHub Pages.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for responsive and customizable designs.
- **Icons & Images**: Utilized SVGs for high-quality icons and images.
- **Deployment**: [GitHub Pages](https://pages.github.com/) for hosting.

## Installation

Install the project dependencies using npm:

```plaintext
npm install
```

Running the Project
```plaintext
npm run dev
```

## Project Structure

The project structure is organized as follows:

```plaintext
.
├── .github/
│   └── workflows/
│       └── nextjs.yml          # GitHub Actions workflow for CI/CD
├── app/                        # Application-specific files and configurations
│   └── ...
├── components/                 # Reusable components such as Navbar, Footer, ProjectCard, etc.
│   ├── Navbar.js
│   ├── Footer.js
│   ├── ProjectCard.js
│   └── ...
├── data/                       # Static data used within the app
│   ├── ...
├── public/                     # Static assets like images, icons, and fonts
│   ├── images/
│   ├── icons/
│   └── ...
├── utils/                      # Utility functions and constants used throughout the project
│   ├── constants.js
│   ├── helpers.js
│   └── ...
├── .eslintrc.json              # ESLint configuration file
├── .gitignore                  # Git ignore file
├── README.md                   # Project documentation (this file)
├── next.config.mjs             # Next.js configuration file
├── package-lock.json           # Lockfile for dependencies (npm)
├── package.json                # Project dependencies and npm scripts
├── postcss.config.mjs          # PostCSS configuration file for Tailwind CSS
├── tailwind.config.ts          # Tailwind CSS configuration file
└── tsconfig.json               # TypeScript configuration file
```

## Using This as a Template

You're welcome to fork this portfolio and make it your own. It's released under the [MIT License with Attribution](LICENSE), which asks for one thing in return: a visible credit on the site you build, for example in the footer:

> Design by [Owais Khan](https://github.com/owaisazmal/DevPortfolio)

The license covers the code, not me. Please replace my name, photos, résumé, projects and writing with your own before you publish. The design is shareable; the story is mine.

## License

Copyright &copy; 2026 Owais Khan. The code is released under the [MIT License with Attribution](LICENSE). Personal content (my photos, résumé, project screenshots and written copy) is not covered by the license and remains all rights reserved.
