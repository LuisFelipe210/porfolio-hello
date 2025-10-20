import { v2 as cloudinary } from 'cloudinary';
import { IncomingForm } from 'formidable';

// Configura o Cloudinary com as suas credenciais do .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Desativa o parser de body padrão da Vercel para esta rota
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const form = new IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao processar o upload.' });
            }

            const file = files.file[0];

            if (!file) {
                return res.status(400).json({ error: 'Nenhum ficheiro enviado.' });
            }

            // Faz o upload do ficheiro para o Cloudinary JÁ COM a transformação de marca d'água
            const result = await cloudinary.uploader.upload(file.filepath, {
                folder: 'client-galleries',
                transformation: [
                    {
                        overlay: 'My Brand:logo_yqiqm6',
                        width: 0.30, // 30% da largura da imagem base
                        crop: 'scale',
                        opacity: 10, // Opacidade de 10%
                        flags: ['relative']
                    },
                    {
                        gravity: 'center', // Centralizado
                        x: 0.02, // Pequeno desvio de 2% para a direita
                        y: 0.03, // Pequeno desvio de 3% para baixo
                        flags: ['layer_apply']
                    }
                ]
            });

            return res.status(200).json({ url: result.secure_url });
        });
    } catch (error) {
        console.error('Erro no upload para o Cloudinary:', error);
        return res.status(500).json({ error: 'Falha ao fazer o upload da imagem.' });
    }
}