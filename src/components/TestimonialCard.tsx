import React from 'react';

// ... (Lembre-se de ter as fontes 'Caveat' e 'Libre Baskerville' no seu CSS)

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
        // MUDANÇA: Padding menor no mobile (p-2 pb-3) e maior no desktop (sm:p-3 sm:pb-4)
        <div
            className="group w-full h-full bg-white p-2 pb-3 sm:p-3 sm:pb-4 shadow-xl rounded-sm border border-gray-200/60
                       transform transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl hover:z-10"
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            {/* MUDANÇA: Altura da imagem menor no mobile (h-40) e maior no desktop (sm:h-48) */}
            {/* MUDANÇA: Margem inferior menor no mobile (mb-2) e maior no desktop (sm:mb-4) */}
            <div
                className="w-full h-40 sm:h-48 bg-cover bg-center mb-2 sm:mb-4"
                style={{ backgroundImage: `url(${imageUrl})` }}
            />

            {/* MUDANÇA: Removido o 'h-calc' e usado 'flex-1' para o container de texto ser flexível */}
            <div className="px-1 flex flex-col flex-1">
                {/* MUDANÇA: Fonte do texto menor no mobile (text-base) e maior no desktop (sm:text-lg) */}
                {/* MUDANÇA: Margem inferior menor no mobile (mb-2) e maior no desktop (sm:mb-4) */}
                <p className="font-serif text-base sm:text-lg italic text-gray-700 flex-grow mb-2 sm:mb-4">
                    "{text}"
                </p>
                <div className="text-right">
                    {/* MUDANÇA: Fonte do autor menor no mobile (text-xl) e maior no desktop (sm:text-2xl) */}
                    <p className="font-caveat text-xl sm:text-2xl text-gray-800 leading-none">{author}</p>
                    <p className="text-xs text-gray-500">{source}</p>
                </div>
            </div>
        </div>
    );
};

export default TestimonialCard;

