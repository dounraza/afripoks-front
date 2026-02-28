import React, { useEffect, useState } from 'react';
import singleJeton from '../../styles/image/single-jeton.png';
import singleJeton1 from '../../styles/image/single-jeton-1.png';
import singleJeton2 from '../../styles/image/single-jeton-2.png';

const Pots = ({ tableState, jetonMany, jeton, potRef, animatePotToWinner, winnerSeats, playerRefs, playSound, shouldShareCards, getVisualSeat, onPotAnimationEnd }) => {
    const [potsAnimation, setPotsAnimation] = useState([]);
    const [animate, setAnimate] = useState(false);
    const [potVisible, setPotVisible] = useState(true);
    

    useEffect(() => {
        // Try to run the pot->winner animation but wait/retry if player refs are not mounted yet.
        let retryTimer = null;
        let endTimer = null;

        const startAnimation = () => {
            if (!potRef.current) {
                // pot not mounted yet, retry shortly
                retryTimer = setTimeout(startAnimation, 50);
                return;
            }

            const potRect = potRef.current.getBoundingClientRect();

            const newAnimations = winnerSeats.map((realSeat) => {
                // winnerSeats contient les SIÈGES RÉELS
                // Convertir realSeat en visualSeat pour accéder à playerRefs correctement
                const vs = getVisualSeat(realSeat);
                const winnerRef = playerRefs[vs];
                const winnerRect = winnerRef?.current?.getBoundingClientRect();
                if (winnerRect) {
                    const startX = potRect.left + potRect.width / 2;
                    const startY = potRect.top + potRect.height / 2;
                    const endX = winnerRect.left + winnerRect.width / 2;
                    const endY = winnerRect.top - 85; // Juste au-dessus de l'avatar
                    return {
                        key: realSeat,
                        startX,
                        startY,
                        endX,
                        endY,
                    };
                }
                return null;
            }).filter(Boolean);

            if (newAnimations.length === 0) {
                // Some winner refs not ready yet, retry shortly
                retryTimer = setTimeout(startAnimation, 50);
                return;
            }

            setPotsAnimation(newAnimations);
            setAnimate(false);
            setPotVisible(true);

            playSound('coinWin', false);

            // Déclenche l'animation dans la frame suivante
            setTimeout(() => {
                setAnimate(true);
            }, 20);

            // Cache le pot principal après l'animation (augmentée à 1200ms pour la nouvelle durée)
            endTimer = setTimeout(() => {
                setPotsAnimation([]);
                setAnimate(false);
                setPotVisible(false); // <-- le pot principal reste caché
                // Callback: update stacks after animation completes
                if (onPotAnimationEnd) {
                    onPotAnimationEnd();
                }
            }, 1200);
        };

        if (animatePotToWinner && winnerSeats.length > 0) {
            startAnimation();
        } else {
            setPotsAnimation([]);
            setAnimate(false);
            setPotVisible(true); // <-- le pot principal réapparaît pour la prochaine main
        }

        return () => {
            if (retryTimer) clearTimeout(retryTimer);
            if (endTimer) clearTimeout(endTimer);
        };
    }, [animatePotToWinner, winnerSeats, playerRefs, potRef, playSound, onPotAnimationEnd, getVisualSeat]);

    useEffect(() => {
        const images = [singleJeton, singleJeton1, singleJeton2, jetonMany, jeton];
        images.forEach(src => {
            const img = new window.Image();
            img.src = src;
        });
    }, []);

    return (
        <>

            <div className="pots-container">
                <div className="pots">
                    {/* Overlay pour les pots animés - Jetons convergent vers le gagnant! */}
                    {potsAnimation.map(({ key, startX, startY, endX, endY }) => {
                        // Générer 10 jetons convergeant précisément vers le gagnant
                        const jetonsVolants = Array.from({ length: 10 }).map((_, idx) => {
                            // Variation MINIMALE pour effet "essaim serré"
                            const offsetX = (Math.random() - 0.5) * 10; // ±5px déviation
                            const offsetY = (Math.random() - 0.5) * 10; // ±5px déviation
                            const delay = idx * 0.08; // Délai en cascade
                            
                            return (
                                <div
                                    key={`jeton-${idx}`}
                                    style={{
                                        position: 'fixed',
                                        left: startX, // Position fixe au pot
                                        top: startY, // Position fixe au pot
                                        width: 28 + Math.random() * 12,
                                        height: 28 + Math.random() * 12,
                                        borderRadius: '50%',
                                        pointerEvents: 'none',
                                        zIndex: 10001,
                                        boxShadow: `0 0 20px rgba(255, 215, 0, 1), 0 0 40px rgba(255, 215, 0, 0.7)`,
                                        backgroundColor: `hsl(${45 + Math.random() * 30}, 100%, ${50 + Math.random() * 10}%)`,
                                        transition: `all 1.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s`,
                                        transform: animate 
                                            ? `translate(${endX - startX + offsetX}px, ${endY - startY + offsetY}px) scale(0.4) rotate(${360 + Math.random() * 360}deg)`
                                            : `translate(0, 0) scale(1) rotate(0deg)`,
                                        opacity: animate ? 0.8 : 1,
                                        animation: animate ? `sparkle 1.3s ease-out ${delay}s forwards` : 'none',
                                    }}
                                >
                                    <img src={[singleJeton, singleJeton1, singleJeton2][idx % 3]} alt="" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))' }} />
                                </div>
                            );
                        });

                        return (
                            <div key={key}>
                                {jetonsVolants}
                                {/* Explosion burst initial */}
                                <div
                                    style={{
                                        position: 'fixed',
                                        left: startX,
                                        top: startY,
                                        width: 100,
                                        height: 100,
                                        borderRadius: '50%',
                                        pointerEvents: 'none',
                                        zIndex: 10000,
                                        boxShadow: animate 
                                            ? `0 0 80px rgba(255, 215, 0, 0.8) inset, 0 0 100px rgba(255, 215, 0, 0.6)`
                                            : 'none',
                                        transform: animate ? 'scale(0.8)' : 'scale(1)',
                                        transition: 'all 0.6s ease-out',
                                        opacity: animate ? 0 : 1,
                                    }}
                                />
                            </div>
                        );
                    })}

                    {!shouldShareCards && potVisible && !animate && (
                        <div
                            className="principals"
                            ref={potRef}
                            style={{
                                color: "white",
                                fontWeight: 600,
                                fontSize: '1.2rem',
                                position: 'relative',
                            }}
                        >
                            {(() => {
                                const principalSize = tableState?.pots?.[0]?.size ?? 0;
                                return (
                                    <>
                                        {principalSize > 0 && (
                                            <img src={jetonMany} alt=""
                                                style={{
                                                    zIndex: -1,
                                                    width: '56px',
                                                    height: '56px',
                                                    objectFit: 'contain',
                                                }} />
                                        )}
                                        <span className="amount-overlay">
                                            {principalSize}
                                        </span>
                                    </>
                                );
                            })()}
                        </div>
                    )}
                    <div className="seondaires">
                        {tableState?.pots?.slice(1).map((pot, index) => (
                            <div key={index + 1} className="pot"
                                style={{
                                    color: 'white',
                                    fontWeight: 600,
                                }}
                            ><img src={jeton} alt="" /> {pot?.size ?? 0}</div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Pots;