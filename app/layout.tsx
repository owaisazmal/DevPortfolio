import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Instrument_Serif, Pixelify_Sans } from "next/font/google";
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

const pixel = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixel",
});

const bootScript = `(function(){var d=document.documentElement;d.setAttribute("data-js","");try{if(localStorage.getItem("theme")==="night")d.setAttribute("data-theme","night")}catch(e){}})();`;

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
      className={`${serif.variable} ${sans.variable} ${mono.variable} ${pixel.variable}`}
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        {children}
      </body>
    </html>
  );
}
