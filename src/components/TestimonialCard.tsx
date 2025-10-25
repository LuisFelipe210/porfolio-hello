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
        <div
            className="group w-full h-full bg-white p-2 pb-3 sm:p-3 sm:pb-4 shadow-lg rounded-sm border border-gray-200/60
                       transform transition-transform,box-shadow duration-300 ease-out hover:scale-105 hover:shadow-xl hover:z-10
                       will-change-transform"
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            <div
                className="w-full h-40 sm:h-48 bg-cover bg-center mb-2 sm:mb-4"
                style={{ backgroundImage: `url(${imageUrl})` }}
            />

            <div className="px-1 flex flex-col flex-1">
                <p className="font-serif text-base sm:text-lg italic text-gray-700 flex-grow mb-2 sm:mb-4">
                    "{text}"
                </p>
                <div className="text-right">
                    <p className="font-caveat text-xl sm:text-2xl text-gray-800 leading-none">{author}</p>
                    <p className="text-xs text-gray-500">{source}</p>
                </div>
            </div>
        </div>
    );
};

export default TestimonialCard;

