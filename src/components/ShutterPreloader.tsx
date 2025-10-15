// src/components/ShutterPreloader.tsx

import { Camera } from 'lucide-react';
import './ShutterPreloader.css';

const ShutterPreloader = () => {
    return (
        <div className="preloader-container">
            <div className="logo-container">
                {/* Trocamos o texto pelo ícone da câmera */}
                <Camera className="h-16 w-16 text-white" />
            </div>
            <svg className="shutter-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                <g>
                    {/* As 6 lâminas do obturador */}
                    {[0, 60, 120, 180, 240, 300].map((angle) => (
                        <path
                            key={angle}
                            className="shutter-blade"
                            transform={`rotate(${angle} 50 50)`}
                            d="M 50 50 L 30 0 C 40 10, 60 10, 70 0 L 50 50 Z"
                        />
                    ))}
                </g>
            </svg>
        </div>
    );
};

export default ShutterPreloader;