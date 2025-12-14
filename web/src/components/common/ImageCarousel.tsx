import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPostImageUrl } from "../../utils/postUtils";
import { useLightbox } from "../../context/LightboxContext";

interface ImageCarouselProps {
    images: string[];
    alt?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, alt = "Post content" }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { openLightbox } = useLightbox();

    if (!images || images.length === 0) return null;

    
    if (images.length === 1) {
        return (
            <div className="w-full bg-black/5 dark:bg-black/20 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                    src={getPostImageUrl(images[0])}
                    alt={alt}
                    className="max-h-[500px] w-auto max-w-full object-contain cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        openLightbox(images, 0);
                    }}
                />
            </div>
        );
    }

    const nextSlide = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    return (
        <div className="relative w-full bg-black rounded-lg overflow-hidden group">
            {}
            <div className="flex items-center justify-center h-[500px] bg-black">
                {}
                <div
                    className="absolute inset-0 opacity-30 blur-2xl bg-center bg-cover"
                    style={{ backgroundImage: `url(${getPostImageUrl(images[currentIndex])})` }}
                />

                <img
                    src={getPostImageUrl(images[currentIndex])}
                    alt={`${alt} ${currentIndex + 1}`}
                    className="relative z-10 w-full h-full object-contain cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        openLightbox(images, currentIndex);
                    }}
                />
            </div>

            {}
            {currentIndex > 0 && (
                <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity z-20"
                >
                    <ChevronLeft size={24} />
                </button>
            )}

            {currentIndex < images.length - 1 && (
                <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity z-20"
                >
                    <ChevronRight size={24} />
                </button>
            )}

            {}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                {images.map((_, index) => (
                    <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? "bg-white" : "bg-white/50"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ImageCarousel;
