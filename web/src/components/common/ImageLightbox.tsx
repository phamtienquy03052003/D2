import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLightbox } from '../../context/LightboxContext';
import { getPostImageUrl } from '../../utils/postUtils';

const ImageLightbox: React.FC = () => {
    const {
        isOpen,
        images,
        currentIndex,
        closeLightbox,
        nextImage,
        prevImage
    } = useLightbox();

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowRight':
                nextImage();
                break;
            case 'ArrowLeft':
                prevImage();
                break;
        }
    }, [isOpen, closeLightbox, nextImage, prevImage]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden'; 
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen || images.length === 0) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center animate-fade-in"
            onClick={closeLightbox}
        >
            {}
            <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-white bg-black/50 rounded-full hover:bg-white/20 transition-all z-50"
            >
                <X size={24} />
            </button>

            {}
            <div
                className="relative w-full h-full flex items-center justify-center p-0"
                onClick={(e) => e.stopPropagation()}
            >
                {}
                {images.length > 1 && currentIndex > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                        }}
                        className="absolute left-4 p-3 text-white hover:bg-white/10 rounded-full transition-colors hidden md:block z-50"
                    >
                        <ChevronLeft size={32} />
                    </button>
                )}

                {}
                <img
                    src={getPostImageUrl(images[currentIndex])}
                    alt={`Light box image ${currentIndex + 1}`}
                    className="w-full h-full object-contain select-none"
                />

                {}
                {images.length > 1 && currentIndex < images.length - 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                        }}
                        className="absolute right-4 p-3 text-white hover:bg-white/10 rounded-full transition-colors hidden md:block z-50"
                    >
                        <ChevronRight size={32} />
                    </button>
                )}
            </div>

            {}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
                    {currentIndex + 1} / {images.length}
                </div>
            )}
        </div>
    );
};

export default ImageLightbox;
