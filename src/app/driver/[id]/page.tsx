import { PageContainer } from "@/components/layout/PageContainer";
import { ThemeSetter } from "@/components/providers/ThemeProvider";
import { getDriverData } from "@/lib/team-colors";
import { DriverTabs, DriverStats } from "@/components/ui/DriverTabs";

export default async function DriverDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const driverIdStr = resolvedParams.id ? decodeURIComponent(resolvedParams.id).toUpperCase() : "";
  
  const driverData = getDriverData(driverIdStr);
  if (!driverData) return null;

  const nameChunks = driverData.name.split(" ");
  const firstName = nameChunks[0].toUpperCase();
  const lastName = nameChunks.slice(1).join(' ').toUpperCase();
  
  // Dynamic fallback for image if actual driver photo is unavailable in basic registry
  const heroImage = `https://media.formula1.com/d_driver_fallback_image.png`;

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#0e0e0e] animate-page-in font-sans selection:bg-primary/30" style={{'--primary': 'var(--color-primary)'} as React.CSSProperties}>
      
      <ThemeSetter teamId={driverData.teamId} />
      
      {/* Background Volumetric Lighting tied to Dynamic Color */}
      <div className="fixed inset-0 z-0 pointer-events-none mix-blend-screen transition-all duration-1000 ease-in-out">
         <div className="absolute top-[-10%] left-[-5%] w-[80vw] h-[80vw] bg-primary rounded-full blur-[350px] opacity-[0.06] transition-colors duration-1000 animate-pulse" />
      </div>

      <PageContainer className="pt-24 pb-16 relative z-10 min-h-screen flex flex-col gap-10">
        
        {/* -- HERO SECTION -- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 w-full">
           <div className="flex items-center gap-10 w-full">
              {/* Premium Glass Frame for Image */}
              <div className="w-40 h-40 md:w-56 md:h-56 rounded-full relative overflow-hidden bg-white/[0.01] backdrop-blur-[30px] border border-white/5 transition-transform duration-700 hover:scale-[1.02] shadow-[0_0_50px_rgba(0,0,0,0.5)] shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent mix-blend-overlay z-10" />
                  <img 
                     src={heroImage} 
                     alt={driverData.name} 
                     className="w-full h-full object-cover object-top mix-blend-luminosity hover:mix-blend-normal transition-all duration-1000 scale-110" 
                  />
                  <div className="absolute left-0 bottom-0 top-0 w-2 bg-primary shadow-[0_0_15px_currentColor]" />
              </div>
              
              <div>
                 <p className="label-sm text-primary mb-3 drop-shadow-[0_0_5px_currentColor] tracking-[0.3em] uppercase">
                    {driverData.team}
                 </p>
                 <h1 className="font-display text-[11vw] sm:text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-white drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)] break-words max-w-full">
                   <span className="block text-white/40">{firstName}</span>
                   <span className="block w-full">{lastName}</span>
                 </h1>
              </div>
           </div>
        </div>

        {/* -- STATS ROW -- */}
        <div className="w-full relative z-20">
           <DriverStats driverCode={driverIdStr} />
        </div>

        {/* -- TABS SECTION -- */}
        <div className="flex-1 w-full relative z-10 px-0">
           <DriverTabs driverCode={driverIdStr} />
        </div>

      </PageContainer>
    </div>
  );
}
