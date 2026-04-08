export default function PokeLoader() {
  return (
    <>
      <style>{`
        @keyframes dust-float {
          0%, 100% { 
            transform: translateY(0) scale(1); 
            opacity: 0.7; 
          }
          50% { 
            transform: translateY(-60px) scale(1.4); 
            opacity: 1; 
          }
        }

        @keyframes ball-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
        }

        @keyframes circle-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes shadow-pulse {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(1.25); }
        }

        .magic-dust {
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 8px solid;
          animation: dust-float 3.5s infinite ease-in-out;
        }

        .ball {
          animation: ball-bounce 1.8s infinite ease-in-out;
        }

        .circle {
          animation: circle-spin 2.5s linear infinite;
        }

        .shadow {
          animation: shadow-pulse 1.8s infinite ease-in-out;
        }
      `}</style>

      <div className="min-h-screen bg-sky-100 flex items-center justify-center relative overflow-hidden">

        {/* Magic Dust Particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="magic-dust" style={{ left: '15%', top: '25%', borderColor: '#3b82f6', animationDelay: '0s' }} />
          <div className="magic-dust" style={{ left: '25%', top: '35%', borderColor: '#22c55e', animationDelay: '0.2s' }} />
          <div className="magic-dust" style={{ left: '35%', top: '18%', borderColor: '#eab308', animationDelay: '0.4s' }} />
          <div className="magic-dust" style={{ left: '45%', top: '30%', borderColor: '#a855f7', animationDelay: '0.6s' }} />
          <div className="magic-dust" style={{ left: '55%', top: '22%', borderColor: '#06b6d4', animationDelay: '0.8s' }} />
          <div className="magic-dust" style={{ left: '65%', top: '40%', borderColor: '#f97316', animationDelay: '1s' }} />
          <div className="magic-dust" style={{ left: '75%', top: '28%', borderColor: '#ec4899', animationDelay: '0.3s' }} />
          <div className="magic-dust" style={{ left: '20%', top: '48%', borderColor: '#14b8a6', animationDelay: '1.2s' }} />
          <div className="magic-dust" style={{ left: '80%', top: '45%', borderColor: '#ef4444', animationDelay: '0.5s' }} />
        </div>

        {/* Pokéball */}
        <div className="relative flex flex-col items-center">
          <div className="shadow absolute -bottom-6 left-1/2 -translate-x-1/2 w-[160px] h-6 bg-sky-600 rounded-full opacity-60"></div>

          <div className="ball relative w-[200px] h-[200px]">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-red-500 border-[14px] border-black border-b-0 rounded-t-full"></div>

            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-white border-[14px] border-black border-t-0 rounded-b-full"></div>

            <div className="circle absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[58px] h-[58px] bg-white border-[12px] border-black rounded-full flex items-center justify-center">
              <div className="w-5 h-5 bg-black rounded-full"></div>
            </div>
          </div>

          <p className="mt-10 text-gray-700 font-medium text-xl tracking-widest">
            Cargando Pokémon...
          </p>
        </div>
      </div>
    </>
  );
}