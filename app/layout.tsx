import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

const bootScript = `(function(){var d=document.documentElement;d.setAttribute("data-js","");try{if(localStorage.getItem("theme")==="night")d.setAttribute("data-theme","night");var p=localStorage.getItem("pattern-css");if(p&&p.indexOf('url("data:image/svg+xml,')===0){d.style.setProperty("--desktop-pattern",p);d.style.setProperty("--desktop-size","16px 16px")}}catch(e){}})();`;

export const metadata: Metadata = {
  title: "Owais Khan | Mobile Developer",
  description:
    "Owais Khan is a mobile developer in Los Angeles building intuitive iOS and Android apps.",
};

export const viewport: Viewport = {
  themeColor: "#FFFFE3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        {children}
      </body>
    </html>
  );
}
