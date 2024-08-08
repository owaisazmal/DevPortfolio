# My Portfolio

Welcome to my personal portfolio, built using **Next.js**! This project showcases my skills, projects, and experience. Feel free to explore and reach out if you'd like to connect.

## Table of Contents

- [Demo](#demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)

## Demo

Check out the live version of my portfolio [here](https://owaisazmal.github.io/DevPortfolio/).

## Features

- **Navigation**: Easily accessible sections such as About, Projects, Work Experience, and Contact.
- **Project Display**: A detailed showcase of projects with descriptions, technologies used, and GitHub links.
- **Responsive Layout**: Designed to be fully responsive across devices.
- **Work Experience**: Highlights of my professional experience, presented in a visually appealing manner.
- **Social Media Links**: Connect with me on GitHub and LinkedIn.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for responsive and customizable designs.
- **Icons & Images**: Utilized SVGs for high-quality icons and images.
- **Deployment**: [GitHub Pages](https://pages.github.com/) for hosting.

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

