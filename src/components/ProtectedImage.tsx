import React from 'react';

interface ProtectedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const ProtectedImage: React.FC<ProtectedImageProps> = (props) => {

    // Esta função é chamada quando o usuário tenta clicar com o botão direito na imagem
    const handleContextMenu = (e: React.MouseEvent<HTMLImageElement>) => {
        e.preventDefault(); // Impede que o menu de contexto (salvar imagem, etc.) apareça
    };

    return (
        <img
            {...props}
            onContextMenu={handleContextMenu} // Aplica a função de prevenção
            // As classes abaixo dificultam arrastar e selecionar a imagem
            className={`${props.className} pointer-events-none select-none`}
        />
    );
};

export default ProtectedImage;