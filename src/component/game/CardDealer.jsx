import React, { useState, useEffect } from 'react';

/**
 * COMPOSANT : CardDealer
 * Gère l'animation visuelle d'une carte partant du sabot (deck) vers le joueur.
 */
const CardDealer = ({
    playerRef,      // Ref de l'élément DOM du joueur
    tableRef,       // Ref de l'élément DOM de la table
    cardCount = 2,  // Nombre de cartes (2 pour Hold'em, 4 pour Omaha)
    isDealing,      // Boolean : déclenche l'animation
    playerIndex,    // Index du siège (0-8)
    totalPlayers,   // Nombre total de joueurs à la table
    cardBackImage,  // Image du dos de la carte
    zoom = 1        // Facteur d'ajustement responsive
}) => {
    const [startAnimation, setStartAnimation] = useState(false);
    const [coords, setCoords] = useState({ deltaX: 0, deltaY: 0 });

    // Calculer les coordonnées du centre par rapport au joueur
    useEffect(() => {
        if (playerRef.current && tableRef.current && isDealing) {
            const pRect = playerRef.current.getBoundingClientRect();
            const tRect = tableRef.current.getBoundingClientRect();
            
            // Centre de la table
            const tCenterX = tRect.left + tRect.width / 2;
            const tCenterY = tRect.top + tRect.height / 2;
            
            // Centre du joueur
            const pCenterX = pRect.left + pRect.width / 2;
            const pCenterY = pRect.top + pRect.height / 2;

            setCoords({
                deltaX: (tCenterX - pCenterX) / zoom,
                deltaY: (tCenterY - pCenterY) / zoom
            });
        }
    }, [playerRef, tableRef, zoom, isDealing]);

    // Déclencher l'animation avec un léger différé
    useEffect(() => {
        if (isDealing) {
            const timer = setTimeout(() => setStartAnimation(true), 100);
            return () => clearTimeout(timer);
        } else {
            setStartAnimation(false);
        }
    }, [isDealing]);

    // Si on ne distribue pas, on ne rend rien ou on rend un conteneur vide
    if (!isDealing && !startAnimation) return null;

    return (
        <div 
            className="dealer-animation-layer"
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 100
            }}
        >
            {[...Array(cardCount)].map((_, idx) => {
                // Calcul du délai pour l'effet "un par un"
                const delay = (idx * 0.15) + (playerIndex * (0.6 / (totalPlayers || 1)));
                
                // Décalage horizontal final pour les cartes reçues
                const xSpread = (idx - (cardCount - 1) / 2) * 15;

                return (
                    <div
                        key={idx}
                        style={{
                            position: 'absolute',
                            width: '32px',
                            height: '45px',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
                            transitionDelay: `${delay}s`,
                            // État initial (au centre) vs État final (chez le joueur)
                            transform: startAnimation 
                                ? `translate(${xSpread}px, 0px) rotate(0deg) scale(1)` 
                                : `translate(${coords.deltaX}px, ${coords.deltaY}px) rotate(180deg) scale(0.2)`,
                            opacity: startAnimation ? 1 : 0,
                        }}
                    >
                        <img 
                            src={cardBackImage} 
                            alt="deck" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default CardDealer;
