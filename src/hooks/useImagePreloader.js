import { useState, useEffect } from "react";

export const useImagePreloader = (imageUrls) => {
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const preloadImages = async () => {
      // On transforme chaque URL en une Promesse
      const promises = imageUrls.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          // Dès que l'image est chargée (onload), on résout la promesse
          img.onload = resolve;
          // Même si ça échoue, on résout pour ne pas bloquer l'app
          img.onerror = (e) => {
            console.error('Error loading images', e);
            resolve();
          };
        });
      });

      // On attend que TOUTES les images soient chargées
      await Promise.all(promises);

      if (isMounted) {
        setImagesPreloaded(true);
      }
    };
    
    if (imageUrls.length > 0) {
      preloadImages();
    } else {
      setImagesPreloaded(true); // Rien à charger
    }

    return () => {
      isMounted = false;
    };
  }, [imageUrls]);

  return { imagesPreloaded };
};