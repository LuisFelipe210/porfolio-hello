import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Adiciona transformações de otimização a um URL do Cloudinary.
 * @param url - O URL original da imagem.
 * @param transformations - Uma string com as transformações (ex: "f_auto,q_auto,w_800").
 * @returns O novo URL otimizado.
 */
export function optimizeCloudinaryUrl(url: string, transformations: string): string {
    if (!url || !url.includes('/upload/')) {
        return url; // Retorna o URL original se não for um URL válido do Cloudinary
    }

    const parts = url.split('/upload/');
    // Verifica se já existem transformações para não as duplicar
    if (parts[1].match(/f_auto|q_auto|w_|h_|c_/)) {
        return url;
    }

    return `${parts[0]}/upload/${transformations}/${parts[1]}`;
}