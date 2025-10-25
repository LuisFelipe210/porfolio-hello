// Dentro do seu arquivo: TestimonialCard.tsx

import React from 'react';

// Lembre-se de adicionar a fonte 'Caveat' para um toque manuscrito
// No seu CSS global: @import url('https://fonts.googleapis.com/css2?family=Caveat&family=Libre+Baskerville:ital@1&display=swap');
// No seu tailwind.config.js:
// theme: { extend: { fontFamily: { caveat: ['Caveat', 'cursive'], serif: ['Libre Baskerville', 'serif'] } } }

interface TestimonialCardProps {
    text: string;
    author: string;
    source: string;
    imageUrl: string;
    rotation: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
                                                             text,
                                                             author,
                                                             source,
                                                             imageUrl,
                                                             rotation,
                                                         }) => {
    return (
        // Container principal: A moldura do Polaroid
        <div
            className="group w-full h-full bg-white p-3 pb-4 shadow-xl rounded-sm border border-gray-200/60
                       transform transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl hover:z-10"
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            {/* A "Foto": Ocupa a parte de cima */}
            <div
                className="w-full h-48 bg-cover bg-center mb-4"
                style={{ backgroundImage: `url(${imageUrl})` }}
            />

            {/* Área de Texto: Na borda branca inferior, garantindo legibilidade */}
            <div className="px-1 flex flex-col h-[calc(100%-13rem)]"> {/* 12rem (h-48) + 1rem (mb-4) */}
                <p className="font-serif text-lg italic text-gray-700 flex-grow mb-4">
                    "{text}"
                </p>
                <div className="text-right">
                    <p className="font-caveat text-2xl text-gray-800 leading-none">{author}</p>
                    <p className="text-xs text-gray-500">{source}</p>
                </div>
            </div>
        </div>
    );
};

export default TestimonialCard;