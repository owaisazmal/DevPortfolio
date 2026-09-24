export const contactEmail = "owais.develops@gmail.com";

export const resumeUrl =
  "https://drive.google.com/file/d/19yzUOhVN_0vrONpniMMmz_nodC3Xu_ON/view?usp=sharing";

const mailto = (subject: string) =>
  `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}`;

export const navItems = [
  { name: "About", link: "#about" },
  { name: "Projects", link: "#projects" },
  { name: "Experience", link: "#workExperience" },
  { name: "Contact", link: "#contact" },
];

export const aboutIntro =
  "With each project, I focus on delivering excellence, combining technical expertise with a passion for design.";

export const offers = [
  {
    id: 1,
    window: "build_request.app",
    title: "Want me to build something?",
    body: "Anything at all. Yes, even that app you're currently paying a monthly subscription for. Pitch me the idea, and if I like it, I'll build it and publish it for free. No paywall, no \"Pro\" tier, no \"your free trial has ended\" pop-ups.",
    finePrint: "Fine print: I have to actually like it. Good ideas are the only currency accepted.",
    cta: "Pitch me an idea",
    href: mailto("I have an app idea for you"),
  },
  {
    id: 2,
    window: "beta_tests.log",
    title: "Want to beta test what I'm building?",
    body: "Get my apps before everyone else does. Tap every button, break things on purpose, and tell me what went wrong. Every bug report gets read, appreciated, and fixed (usually in that order).",
    finePrint: "Side effects may include early access and mild bragging rights.",
    cta: "Join the beta",
    href: mailto("Sign me up for the beta"),
  },
];

export type Project = {
  id: number;
  title: string;
  des: string;
  img: string;
  iconLists: string[];
  link: string;
  kind: string;
  repo?: string;
  icon?: string;
  highlights?: string[];
};

export const techLabels: Record<string, string> = {
  re: "React Native",
  ts: "TypeScript",
  expo: "Expo",
  swift: "Swift",
  firebase: "Firebase",
  kotlin: "Kotlin",
  xcode: "Xcode",
  apple: "iOS",
  "html-5": "HTML5",
  "css-3": "CSS3",
  js: "JavaScript",
  tensorflow: "TensorFlow.js",
  "face-detection": "face-api.js",
  chart: "SwiftUICharts",
  api: "REST API",
  git: "Git",
};

export const techLabel = (icon: string) => {
  const key = icon.replace("./", "").replace(".svg", "").replace("-svgrepo-com", "");
  return techLabels[key] ?? key;
};

// Make changes here for projects

export const projects: Project[] = [
  {
    id: 1,
    title: "Rin - Monthly Planning",
    des: "A monthly planner with a radial habit tracker, home screen widgets and encrypted backups, built for iOS and Android.",
    img: "./Rin.png",
    iconLists: ["./re.svg", "./ts.svg", "./expo.svg", "./swift.svg", "./firebase.svg"],
    link: "https://github.com/owaisazmal/Rin",
    kind: "iOS + Android app",
    repo: "owaisazmal/Rin",
    icon: "./rin-icon.png",
    highlights: ["Radial habit tracker", "Home screen widgets", "Encrypted backups"],
  },
  {
    id: 2,
    title: "Kitefold - File Converter",
    des: "A free, fast, 100% on-device image and PDF converter for iOS and Android. No uploads, no account, no paywall.",
    img: "./Kitefold.png",
    iconLists: ["./re.svg", "./ts.svg", "./expo.svg", "./swift.svg", "./kotlin.svg"],
    link: "https://github.com/owaisazmal/PDF-Editor",
    kind: "iOS + Android app",
    repo: "owaisazmal/PDF-Editor",
    icon: "./kitefold-icon.png",
    highlights: ["Image and PDF conversion, fully on-device", "No uploads, no account, no paywall"],
  },
  {
    id: 3,
    title: "Swift Scribe - Notes App",
    des: "A sleek, powerful, and intuitive text editor designed to elevate your writing experience.",
    img: "./Scribe.png",
    iconLists: ["./swift.svg", "./xcode.svg", "./apple.svg"],
    link: "https://github.com/owaisazmal/Swift-Scribe",
    kind: "iOS app",
    repo: "owaisazmal/Swift-Scribe",
  },
  {
    id: 4,
    title: "Emotion Detector - Live",
    des: "This is a web application that detects faces in real-time using the face-api.js library.",
    img: "./FaceDet.png",
    iconLists: ["./html-5-svgrepo-com.svg", "./css-3-svgrepo-com.svg", "./js-svgrepo-com.svg", "./tensorflow.svg", "./face-detection.svg"],
    link: "https://owaisazmal.github.io/Face-Detection/",
    kind: "Web app",
    repo: "owaisazmal/Face-Detection",
    highlights: ["Real-time face detection in the browser", "Built on face-api.js and TensorFlow.js"],
  },
];

export const moreProjects: Project[] = [
  {
    id: 5,
    title: "Expense Tracker",
    des: "An app built with SwiftUI and SwiftUICharts, designed to help users track expenses and visualize spending habits.",
    img: "./ExpTrkr.png",
    iconLists: ["./swift.svg", "./xcode.svg", "./chart.svg", "./api.svg", "./git.svg"],
    link: "https://github.com/owaisazmal/ExpenseTracker",
    kind: "iOS app",
    repo: "owaisazmal/ExpenseTracker",
    highlights: ["SwiftUI with SwiftUICharts", "Visualizes spending habits"],
  },
  {
    id: 6,
    title: "Weather Util",
    des: "This app demonstrates the use of SwiftUI to create a weather information interface. It provides a list of daily weather forecasts.",
    img: "./Weather.png",
    iconLists: ["./swift.svg", "./xcode.svg", "./apple.svg"],
    link: "https://github.com/owaisazmal/WeatherUtil",
    kind: "iOS app",
    repo: "owaisazmal/WeatherUtil",
    highlights: ["SwiftUI interface", "Daily forecast list"],
  },
];

export const workExperience = [
  {
    id: 1,
    title: "Hidonix.inc",
    date: "Aug 2025 - Present",
    desc: "Developed and maintained high-quality mobile applications using Swift and React Native.|Collaborated with design teams for responsive UI/UX implementation.|Led feature development, sprint planning, and code reviews.|Optimized app performance, integrated RESTful APIs, and maintained code quality.|Managed app releases and updates while contributing to technical architecture decisions.",
  },
  {
    id: 2,
    title: "iOS Developer - CSU, Northridge",
    date: "Sep 2022 - Aug 2025",
    desc: "Assisted in the development of a mobile app using Swift, enhancing interactivity.|Maintained and updated existing applications to improve functionality.|Implemented user interface designs using UIKit, Interface Builder, and SwiftUI, ensuring a seamless user experience.|Assisted in preparing technical documentation, including user guides and development manuals, to support application deployment and usage.",
  },
  {
    id: 3,
    title: "Research Assistant - Project IGV",
    date: "Aug 2024 - May 2025",
    desc: "Developed software components using ROS1 to control autonomous ground vehicles.|Collaborated with the Intelligent Ground Vehicle team to implement algorithms for obstacle detection and navigation.",
  },
  {
    id: 4,
    title: "Jr. Java Developer - AHC Tech",
    date: "Aug 2020 - May 2021",
    desc: "Involved in DevOps migration/automation processes for build and deploy systems.|Developed webpages using HTML5, CSS3, and JavaScript.|Tested applications on multiple devices to ensure compatibility standards.|Environment: AWS, Azure, Azure DevOps, Maven, Git, MS SQL, Java/J2EE Technologies.",
  },
];

export const socialMedia = [
  {
    id: 1,
    name: "GitHub",
    link: "https://github.com/owaisazmal",
  },
  {
    id: 3,
    name: "LinkedIn",
    link: "https://www.linkedin.com/in/owais-khan-266492222/",
  },
];
