import { createContext, useContext, useState } from "react";

interface GalleryContextType {
    isInGallery: boolean;
    setIsInGallery: (value: boolean) => void;
}

const GalleryContext = createContext<GalleryContextType>({
    isInGallery: false,
    setIsInGallery: () => {}
});

export const GalleryProvider = ({ children }: { children: React.ReactNode }) => {
    const [isInGallery, setIsInGallery] = useState(false);
    return (
        <GalleryContext.Provider value={{ isInGallery, setIsInGallery }}>
            {children}
        </GalleryContext.Provider>
    );
};

export const useGallery = () => useContext(GalleryContext);