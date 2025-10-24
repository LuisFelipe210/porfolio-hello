import React from 'react';

interface TestimonialCardProps {
    text: string;
    author: string;
    source: string; // Ex: "on using the app with the card"
    color: 'green' | 'yellow' | 'blue'; // Definimos cores para os cards
    rotation: number; // Ângulo de rotação em graus (-10 a 10)
    delay: number; // Atraso na animação de entrada (em ms)
}

const colorMap = {
    green: 'bg-green-300', // Ou a cor exata da Petal
    yellow: 'bg-yellow-200',
    blue: 'bg-blue-300',
};

const TestimonialCard: React.FC<TestimonialCardProps> = ({ text, author, source, color, rotation, delay }) => {
    const cardColorClass = colorMap[color] || colorMap.green; // Default para verde

    return (
        <div
            className={`relative p-6 sm:p-8 rounded-lg shadow-lg flex flex-col justify-between 
                        transform origin-center-bottom transition-all duration-700 ease-out 
                        opacity-0 animate-fade-in-up ${cardColorClass}`}
            style={{
                transform: `rotate(${rotation}deg)`,
                animationDelay: `${delay}ms`,
            }}
        >
            {/* Canto Dobrado (simulação simples com div, CSS mais avançado seria melhor) */}
            <div className="absolute top-0 right-0 w-0 h-0 border-t-[30px] border-l-[30px] border-solid
                            border-r-transparent border-b-transparent"
                 style={{
                     borderTopColor: 'rgba(0,0,0,0.1)', // Sombra para o canto
                     borderLeftColor: cardColorClass.replace('bg-', '#'), // Cor de fundo do card
                     transform: 'rotate(90deg)' // Ajuste para o canto superior direito
                 }}
            ></div>

            <p className="text-gray-800 text-base leading-relaxed mb-4 flex-grow italic">
                "{text}"
            </p>
            <div className="text-right">
                <p className="font-semibold text-gray-900 text-lg mb-0.5">{author}</p>
                <p className="text-gray-600 text-sm">{source}</p>
            </div>
        </div>
    );
};

export default TestimonialCard;