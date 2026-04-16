import React, { useEffect, useState } from 'react';
import singleJeton from '../../styles/image/single-jeton.png';
import singleJeton1 from '../../styles/image/single-jeton-1.png';
import singleJeton2 from '../../styles/image/single-jeton-2.png';

const Pots = ({ tableState, jetonMany, jeton, potRef, animatePotToWinner, winnerSeats, playerRefs, playSound, shouldShareCards }) => {
    const [potsAnimation, setPotsAnimation] = useState([]);
    const [animate, setAnimate] = useState(false);
    const [potVisible, setPotVisible] = useState(true);
    

    useEffect(() => {
        if (
            animatePotToWinner &&
            winnerSeats.length > 0 &&
            potRef.current
        ) {
            const potRect = potRef.current.getBoundingClientRect();

            const newAnimations = winnerSeats.map((seat) => {
                const winnerRef = playerRefs[seat];
                const winnerRect = winnerRef?.current?.getBoundingClientRect();
                if (winnerRect) {
                    const startX = potRect.left + potRect.width / 2;
                    const startY = potRect.top + potRect.height / 2;
                    const endX = winnerRect.left + winnerRect.width / 2;
                    const endY = winnerRect.top + winnerRect.height / 2;
                    return {
                        key: seat,
                        startX,
                        startY,
                        endX,
                        endY,
                    };
                }
                return null;
            }).filter(Boolean);

            setPotsAnimation(newAnimations);
            setAnimate(false);
            setPotVisible(true);

            playSound('coinWin', false);

            // Déclenche l'animation dans la frame suivante
            setTimeout(() => {
                setAnimate(true);
            }, 20);

            // Cache le pot principal après l'animation
            setTimeout(() => {
                setPotsAnimation([]);
                setAnimate(false);
                setPotVisible(false); // <-- le pot principal reste caché
            }, 1000);
        } else {
            setPotsAnimation([]);
            setAnimate(false);
            setPotVisible(true); // <-- le pot principal réapparaît pour la prochaine main
        }
    }, [animatePotToWinner, winnerSeats, playerRefs]);

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
                    {/* Overlay pour les pots animés */}
                    {potsAnimation.map(({ key, startX, startY, endX, endY }) => (
                        <div
                            key={key}
                            style={{
                                position: 'fixed',
                                left: startX,
                                top: startY,
                                width: 56,
                                height: 56,
                                pointerEvents: 'none',
                                zIndex: 9999,
                                boxShadow: 'none',
                                transition: 'transform .7s ease-in-out',
                                transform: animate
                                    ? `translate(${endX - startX}px, ${endY - startY}px) scale(0.7)`
                                    : 'translate(0, 0) scale(1)',
                            }}
                        >
                            {/* <img src={jetonMany} alt="" style={{ width: '56px', height: '56px', objectFit: 'contain' }} /> */}
                            {[singleJeton, singleJeton1, singleJeton2].map((jeton, i) => (
                              <div
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  // backgroundColor: 'gold',
                                  borderRadius: '50%',
                                  // boxShadow: `0 0 8px gold`,
                                  // border: `2px solid white`,
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  animation: `animatedCoin 0.7s ease-in-out ${i * 0.1}s forwards`,
                                  transition: `transform 0.2s ease-in-out ${i * 0.1}s`,
                                }}
                              >
                                <img src={jeton} alt="" style={{ width: '100%', height: '100%' }} />
                              </div>
                            ))}
                            <div style={{ color: 'white', fontWeight: 600 }}>{tableState?.pots?.[0]?.size / potsAnimation.length ?? 0}</div>
                        </div>
                    ))}
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
                            {tableState?.pots?.[0]?.size ? (
                                <img src={jetonMany} alt=""
                                    style={{
                                        zIndex: -1,
                                        width: '56px',
                                        height: '56px',
                                        objectFit: 'contain',
                                    }} />
                                // <>
                                //   {[1, 2, 3, 4].map((color, i) => (
                                //     <div
                                //       style={{
                                //         width: '24px',
                                //         height: '24px',
                                //         borderRadius: '50%',
                                //         position: 'absolute',
                                //         top: '50%',
                                //         left: '50%',
                                //       }}
                                //     >
                                //       <img src={singleJeton} alt="" style={{ width: '100%', height: '100%' }} />
                                //     </div>
                                //   ))}
                                // </>
                            ) : null}
                            {tableState?.pots?.[0]?.size ?? 0}
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