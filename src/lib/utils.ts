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
        return url;
    }

    const parts = url.split('/upload/');
    // Verifica se já existem transformações para não as duplicar
    if (parts[1].match(/f_auto|q_auto|w_|h_|c_/)) {
        return url;
    }

    return `${parts[0]}/upload/${transformations}/${parts[1]}`;
}

/**
 * Gera um srcSet responsivo para uma imagem do Cloudinary.
 * @param baseUrl - O URL base da imagem (ex: .../v12345/image.jpg)
 * @param widths - Array de larguras (ex: [400, 800, 1200])
 * @param baseTransforms - Transformações base (ex: "f_auto,q_auto")
 * @returns Uma string srcSet
 */
export function generateCloudinarySrcSet(
    baseUrl: string,
    widths: number[],
    baseTransforms: string = "f_auto,q_auto"
): string {
    if (!baseUrl || !baseUrl.includes('/upload/')) {
        return '';
    }

    const parts = baseUrl.split('/upload/');
    const prefix = `${parts[0]}/upload/`;
    const suffix = parts[1];

    return widths
        .map(width => {
            const transformations = `${baseTransforms},w_${width}`;
            return `${prefix}${transformations}/${suffix} ${width}w`;
        })
        .join(', ');
}