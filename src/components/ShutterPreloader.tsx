import Logo from "../assets/logo.svg";

const ShutterPreloader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white animate-preloader-exit pointer-events-none">

            <div className="flex items-center gap-4 md:gap-6 animate-pulse-slow">

                <img
                    src={Logo}
                    alt="Hellô Borges Logo"
                    className="h-16 md:h-24 w-auto"
                />

                <div className="flex flex-col items-start justify-center">
                    <h1 className="text-3xl md:text-5xl font-serif text-zinc-900 leading-none">
                        Hellô Borges
                    </h1>
                    <span className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-orange-600 mt-1 md:mt-2 ml-1">
                        Fotografia
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ShutterPreloader;