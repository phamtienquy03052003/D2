import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface LightboxContextType {
    isOpen: boolean;
    images: string[];
    currentIndex: number;
    openLightbox: (images: string[], index?: number) => void;
    closeLightbox: () => void;
    nextImage: () => void;
    prevImage: () => void;
    setImageIndex: (index: number) => void;
}

const LightboxContext = createContext<LightboxContextType | undefined>(undefined);

export const LightboxProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openLightbox = (imgs: string[], index = 0) => {
        setImages(imgs);
        setCurrentIndex(index);
        setIsOpen(true);
    };

    const closeLightbox = () => {
        setIsOpen(false);
        setImages([]);
        setCurrentIndex(0);
    };

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const setImageIndex = (index: number) => {
        if (index >= 0 && index < images.length) {
            setCurrentIndex(index);
        }
    };

    return (
        <LightboxContext.Provider
            value={{
                isOpen,
                images,
                currentIndex,
                openLightbox,
                closeLightbox,
                nextImage,
                prevImage,
                setImageIndex,
            }}
        >
            {children}
        </LightboxContext.Provider>
    );
};

export const useLightbox = () => {
    const context = useContext(LightboxContext);
    if (context === undefined) {
        throw new Error('useLightbox must be used within a LightboxProvider');
    }
    return context;
};
