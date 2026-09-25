import BalloonHelp from "@/components/BalloonHelp";
import BetaDialog from "@/components/BetaDialog";
import BootScreen from "@/components/BootScreen";
import DesktopPattern from "@/components/DesktopPattern";
import Experience from "@/components/Experience";
import FindFile from "@/components/FindFile";
import Footer from "@/components/Footer";
import Grid from "@/components/Grid";
import Hero from "@/components/Hero";
import MenuBar from "@/components/MenuBar";
import PitchDialog from "@/components/PitchDialog";
import PuzzleDialog from "@/components/PuzzleDialog";
import RecentProjects from "@/components/RecentProjects";
import ScreenSaver from "@/components/ScreenSaver";
import ScrollRuler from "@/components/ScrollRuler";
import SystemDialogs from "@/components/SystemDialogs";
import Ticker from "@/components/Ticker";
import WeatherDialog from "@/components/WeatherDialog";

export default function Home() {
  return (
    <>
      <MenuBar />
      <ScrollRuler />
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
      <FindFile />
      <PuzzleDialog />
      <WeatherDialog />
      <DesktopPattern />
      <PitchDialog />
      <BetaDialog />
      <BalloonHelp />
      <ScreenSaver />
      <BootScreen />
    </>
  );
}
