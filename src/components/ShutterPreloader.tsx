import { useEffect, useState } from "react";
import Logo from "../assets/logo.svg";

const ShutterPreloader = () => {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [hideNode, setHideNode] = useState(false);

    // Dados fake da câmera
    const [cameraData, setCameraData] = useState({ iso: 100, shutter: "1/50", aperture: "f/2.8" });

    useEffect(() => {
        // --- SIMULAÇÃO DE CARREGAMENTO ---
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setIsComplete(true), 200); // Pequeno delay no 100%
                    return 100;
                }

                // Randomiza dados da câmera (efeito visual)
                if (Math.random() > 0.7) {
                    setCameraData({
                        iso: [100, 200, 400, 800, 1600][Math.floor(Math.random() * 5)],
                        shutter: ["1/60", "1/125", "1/250", "1/500", "1/1000"][Math.floor(Math.random() * 5)],
                        aperture: ["f/1.8", "f/2.8", "f/4.0", "f/5.6", "f/11"][Math.floor(Math.random() * 5)],
                    });
                }
                return prev + 2; // Velocidade do loading
            });
        }, 30);

        return () => clearInterval(interval);
    }, []);

    // Remove do HTML depois que animação acaba pra liberar o clique
    useEffect(() => {
        if (isComplete) {
            // Tempo da animação de abertura (1.5s) + margem
            const timer = setTimeout(() => setHideNode(true), 1600);
            return () => clearTimeout(timer);
        }
    }, [isComplete]);

    if (hideNode) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden pointer-events-none">

            {/* --- O TRUQUE DA SOMBRA GIGANTE (IRIS) ---
                1. É um círculo transparente (bg-transparent).
                2. Tem uma sombra PRETA sólida gigantesca (shadow-[0_0_0_200vmax_#09090b]).
                3. Começa pequeno (w-0 h-0) -> A sombra cobre tudo.
                4. Cresce (w-[300vmax]) -> A sombra é empurrada pra fora, revelando o buraco (o site).
            */}
            <div
                className={`rounded-full bg-transparent shadow-[0_0_0_200vmax_#09090b] z-20 transition-all duration-[1500ms] ease-[cubic-bezier(0.85,0,0.15,1)] ${
                    isComplete ? "w-[300vmax] h-[300vmax]" : "w-0 h-0"
                }`}
            ></div>

            {/* --- CONTEÚDO (LOGO E DADOS) --- */}
            {/* Fica com z-index maior que a sombra, mas some (opacity-0) quando abre */}
            <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center transition-opacity duration-500 ${isComplete ? "opacity-0" : "opacity-100"}`}>

                {/* LOGO E BARRA */}
                <div className="flex flex-col items-center gap-6">
                    <img
                        src={Logo}
                        alt="Logo"
                        className="h-16 md:h-20 w-auto invert brightness-0" // Inverte cor pra branco
                    />

                    <div className="flex items-center gap-4 font-mono text-sm tracking-widest text-zinc-500">
                        <span className="w-8 text-right text-white">{progress}%</span>
                        <div className="h-[2px] w-32 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-100 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* --- HUD DA CÂMERA (GRIDES E DADOS) --- */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Linhas de Terços (Bem sutil) */}
                    <div className="absolute top-1/3 w-full h-[1px] bg-white/10"></div>
                    <div className="absolute top-2/3 w-full h-[1px] bg-white/10"></div>
                    <div className="absolute left-1/3 h-full w-[1px] bg-white/10"></div>
                    <div className="absolute left-2/3 h-full w-[1px] bg-white/10"></div>

                    {/* Cantoneiras de Foco */}
                    <div className="absolute top-8 left-8 w-6 h-6 border-l-2 border-t-2 border-white/50"></div>
                    <div className="absolute top-8 right-8 w-6 h-6 border-r-2 border-t-2 border-white/50"></div>
                    <div className="absolute bottom-8 left-8 w-6 h-6 border-l-2 border-b-2 border-white/50"></div>
                    <div className="absolute bottom-8 right-8 w-6 h-6 border-r-2 border-b-2 border-white/50"></div>

                    {/* Dados no Rodapé */}
                    <div className="absolute bottom-10 w-full px-10 flex justify-between font-mono text-xs text-yellow-500 font-bold uppercase tracking-wider">
                        <div className="flex gap-4 sm:gap-8">
                            <span>ISO {cameraData.iso}</span>
                            <span>{cameraData.aperture}</span>
                            <span>{cameraData.shutter}</span>
                        </div>
                        <div className="flex gap-2 items-center text-red-500">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span>REC</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ShutterPreloader;