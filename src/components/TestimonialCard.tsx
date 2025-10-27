import React from 'react';
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
            className="group w-full h-full bg-white p-1.5 pb-2 sm:p-2 sm:pb-3 shadow-lg rounded-sm border border-gray-200/60
                       transform transition-transform,box-shadow duration-300 ease-out hover:scale-105 hover:shadow-xl hover:z-10
                       will-change-transform"
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            <div
                className="w-full h-32 sm:h-40 bg-cover bg-center mb-2 sm:mb-4"
                style={{ backgroundImage: `url(${imageUrl})` }}
            />

            <div className="px-1 flex flex-col flex-1">
                <p className="font-serif text-sm sm:text-base italic text-gray-700 flex-grow mb-2 sm:mb-4">
                    "{text}"
                </p>
                <div className="text-right">
                    <p className="font-caveat text-lg sm:text-xl text-gray-800 leading-none">{author}</p>
                    <p className="text-xs text-gray-500">{source}</p>
                </div>
            </div>
        </div>
    );
};

export default TestimonialCard;
