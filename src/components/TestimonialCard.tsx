import React from 'react';

interface TestimonialCardProps {
    text: string;
    author: string;
    source: string;
    imageUrl: string;
    rotation: number;
    alt?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
                                                             text,
                                                             author,
                                                             source,
                                                             imageUrl,
                                                             rotation,
                                                             alt,
                                                         }) => {
    return (
        <div
            className="group w-full h-full bg-white p-1.5 pb-2 shadow-lg rounded-sm border border-gray-200/60
                 transform transition-transform duration-300 ease-out hover:scale-105 hover:shadow-xl hover:z-10
                 will-change-transform"
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            <div className="w-full h-32 sm:h-40 mb-1.5 sm:mb-2 overflow-hidden rounded-sm">
                <img
                    src={imageUrl}
                    alt={alt || `Foto de ${author}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
            </div>

            <div className="px-1 flex flex-col flex-1">
                <p className="font-serif text-xs sm:text-sm italic text-gray-700 flex-grow mb-1.5 sm:mb-2">
                    "{text}"
                </p>
                <div className="text-right">
                    <p className="font-caveat text-base sm:text-lg text-gray-800 leading-none">{author}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">{source}</p>
                </div>
            </div>
        </div>
    );
};

export default TestimonialCard;

// Para o TestimonialsSection.tsx, altere também a linha do Skeleton:
// <Skeleton className="h-[18rem] sm:h-[20rem] w-full rounded-sm bg-gray-200 dark:bg-zinc-800" />