import Experience from "@/components/Experience";
import Footer from "@/components/Footer";
import Grid from "@/components/Grid";
import Hero from "@/components/Hero";
import MenuBar from "@/components/MenuBar";
import RecentProjects from "@/components/RecentProjects";
import SystemDialogs from "@/components/SystemDialogs";
import Ticker from "@/components/Ticker";

export default function Home() {
  return (
    <>
      <MenuBar />
      <main className="overflow-x-clip">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Hero />
        </div>
        <Ticker />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Grid />
          <RecentProjects />
          <Experience />
        </div>
      </main>
      <Footer />
      <SystemDialogs />
    </>
  );
}
