import React, { useEffect, useState, useRef } from 'react';
import { Smile } from "lucide-react";
import SmileyModal from './SmileyModal';
import { smileySocket } from '../../engine/socket';

const Player = ({
    i,
    chips,
    tableState,
    winData,
    sb,
    bb,
    dealer,
    avatars,
    playerRefs,
    tableRef,
    getSrcCard,
    rever,
    foldedPlayers,
    shouldShareCards,
    sharingCards,
    allInArr,
    gameOver,
    isRevealFinished,
    hideStack,
    tableId,
}) => {
    const [smileysOpen, setSmileysOpen] = useState(false);
    const [smiley, setSmiley] = useState(null);
    const [playerSmileys, setPlayerSmileys] = useState([])

    const sendSmiley = (smiley) => {
        const seat = tableState.seat;
        smileySocket.emit('send-smiley', {
            tableId, seat, smiley
        });
    }
    const onReceiveSmiley = (seat, smiley) => {
        console.log('Receive smiley', smiley);
        setPlayerSmileys(prev => {
            return [...prev, { seat, smiley }];
        });
        setTimeout(() => {
            setPlayerSmileys(prev => {
                prev = prev.filter(s => s.seat !== seat);
                return prev;
            });
        }, 5000);
    }

    smileySocket.emit('join', tableId);
    const onConnect = () => {
        console.log('Smiley socket connected !');
    }

    useEffect(() => {
        console.log('Bonjour');
        
        smileySocket.on('connect', onConnect);
        smileySocket.on('receive-smiley', onReceiveSmiley);

        return () => {
            smileySocket.off('connect', onConnect);
            smileySocket.off('receive-smiley', onReceiveSmiley);
        }
    }, []);

    const [displayStack, setDisplayStack] = useState(chips?.stack ?? 0);
    const [isStackHidden, setIsStackHidden] = useState(false);
    const [showResult, setShowResult] = useState(false);
    
    // Références pour verrouiller le solde
    const lastSafeStack = useRef(chips?.stack ?? 0);
    const isLocked = useRef(false);

    useEffect(() => {
        if (chips?.stack === undefined) return;

        const actualStack = chips.stack;
        const isWinPhase = gameOver || (winData?.winStates?.length > 0);
        
        // DÉTECTION PROACTIVE : Si le solde du serveur est supérieur à notre dernier solde sûr,
        // c'est une victoire certaine (ou un gain de pot).
        const isIncreasing = actualStack > lastSafeStack.current;

        // CAS 1 : Phase de jeu normale (Mises, Suivis, Blinds)
        // On n'autorise la mise à jour que si le solde baisse ou reste identique.
        if (!isWinPhase && !isIncreasing) {
            isLocked.current = false;
            lastSafeStack.current = actualStack;
            setDisplayStack(actualStack);
            setIsStackHidden(false);
            setShowResult(false);
            return;
        }

        // CAS 2 : ANTICIPATION (Augmentation détectée avant même le gameOver)
        // On bloque l'affichage sur la valeur d'avant pour préserver la surprise.
        if (!isWinPhase && isIncreasing) {
            isLocked.current = true;
            // On ne touche pas à displayStack, il reste sur lastSafeStack.current
            return;
        }

        // CAS 3 : Phase de victoire confirmée (gameOver ou winData présent)
        const winner = winData?.winStates?.find(w => w.seat === i);
        const isWinner = winner?.isWinner;
        const isLoser = winner && !winner.isWinner && !foldedPlayers.current.has(i);

        if (isWinner || isLoser) {
            isLocked.current = true;
            const hasShowdown = winData?.allCards && Object.values(winData.allCards).some(hand => hand && hand.length > 0);

            // SI PAS DE SHOWDOWN (All Fold)
            if (!hasShowdown) {
                const timer = setTimeout(() => {
                    setDisplayStack(actualStack);
                    lastSafeStack.current = actualStack;
                }, 1000);
                // Ensure showResult is true for "All Fold"
                setShowResult(true);
                return () => clearTimeout(timer);
            }

            // SI SHOWDOWN (Suspense complet)
            if (!isRevealFinished) {
                // Toujours bloqué sur l'ancien montant pendant l'ouverture des cartes
                setDisplayStack(lastSafeStack.current);
                // Ensure showResult is true during card reveal
                setShowResult(true);
            } else {
                // Séquence de suspense (les cartes sont ouvertes)
                // Only trigger the result display if it hasn't been shown yet
                if (!isStackHidden && !showResult) {
                    setIsStackHidden(true);

                    const timerResult = setTimeout(() => {
                        setShowResult(true); // Set showResult to true to display the badge
                    }, 1200);

                    const timerStack = setTimeout(() => {
                        setDisplayStack(actualStack); // Libération finale du nouveau solde
                        setIsStackHidden(false);
                        setShowResult(false); // Reset showResult after the full animation
                        lastSafeStack.current = actualStack;
                    }, 4500);

                    return () => {
                        clearTimeout(timerResult);
                        clearTimeout(timerStack);
                    };
                } else if (isStackHidden && showResult) {
                    // If stack is hidden and results are already shown (e.g., after animation)
                    // ensure stack is updated and showResult is reset for the next hand
                    setDisplayStack(actualStack);
                    setIsStackHidden(false);
                    setShowResult(false);
                    lastSafeStack.current = actualStack;
                }
            }
        } else {
            // Perdants foldés ou spectateurs (pas de victoire ni de défaite affichée directement)
            setDisplayStack(actualStack);
            lastSafeStack.current = actualStack;
            // Ensure showResult is false if not in a win/loss phase
            setShowResult(false);
        }
        }, [chips?.stack, gameOver, isRevealFinished, winData, i]);

        if (!tableState.playerNames[i]) return null;

    const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

    const getAvatarSrc = (avatar) => {
        if (!avatar) return '/avatars/0.png';
        // Si l'avatar est déjà une URL complète ou un blob preview
        if (avatar.startsWith('http') || avatar.startsWith('blob:')) return avatar;
        // Si c'est un avatar uploadé (commence par /uploads)
        if (avatar.startsWith('/uploads')) return `${BASE_URL}${avatar}`;
        
        // Nettoyage du chemin pour les avatars par défaut
        // Si on reçoit "/avatars/5.png", on s'assure de ne pas doubler le préfixe
        let cleanAvatar = avatar;
        if (avatar.startsWith('/avatars/')) {
            cleanAvatar = avatar.replace('/avatars/', '');
        } else if (avatar.startsWith('avatars/')) {
            cleanAvatar = avatar.replace('avatars/', '');
        }
        
        return `/avatars/${cleanAvatar}`;
    };

    const avatarJson = avatars?.find(avt => avt.userId === tableState.playerIds[i]);
    let avatar = avatarJson?.avatar;

    // Fallback pour le joueur local : utiliser l'avatar du sessionStorage s'il est plus récent/différent
    const currentUserId = sessionStorage.getItem('userId');
    if (tableState.playerIds[i] === currentUserId) {
        const sessionAvatar = sessionStorage.getItem('avatar');
        if (sessionAvatar) {
            avatar = sessionAvatar;
        }
    }

    const avatarSrc = getAvatarSrc(avatar);

    const playerRef = playerRefs[i];
    const playerRect = playerRef.current?.getBoundingClientRect();

    let tableCenterX, tableCenterY;
    const tableRect = tableRef.current?.getBoundingClientRect();
    if (tableRect) {
        tableCenterX = tableRect.left + tableRect.width / 2;
        tableCenterY = tableRect.top + tableRect.height / 2;
    }

    let pdx, pdy;
    if (playerRect) {
        pdx = playerRect.left + playerRect.width / 2;
        pdy = playerRect.top + playerRect.height / 2;
    }

    let zoom = 1;
    if (window.innerWidth <= 451 && window.innerWidth > 399) zoom = 0.9;
    if (window.innerWidth <= 399 && window.innerWidth > 350) zoom = 0.8;
    if (window.innerWidth <= 350) zoom = 0.7;

    const getCardCount = () => {
        if (tableState.playerCards && tableState.playerCards.length > 0) return tableState.playerCards.length;
        if (winData.allCards) {
            const firstHand = winData.allCards.find(hand => hand && hand.length > 0);
            if (firstHand) return firstHand.length;
        }
        return 2; // Default to 2 if unknown
    };

    const cardCount = getCardCount();

    return (
        <>
            <div
                ref={playerRefs[i]}
                className={`
                    player 
                    seat${i} 
                    ${(winData?.winStates ?? []).length > 0 && winData.winStates.find(w => w.seat === i)?.isWinner && isRevealFinished ?'win': '' }
                    ${tableState.toAct === i ?'active': '' }`
                }
                style={{ borderRadius: 12 }}
                key={i}
            >
                <div
                    style={{
                        position: 'absolute',
                        bottom: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: -1,
                    }}
                >
                    {isRevealFinished && winData?.winStates?.find(w => w.seat === i)?.handName && (
                        <div className="hand-name-badge" style={{ display: 'none' }}>
                            {winData.winStates.find(w => w.seat === i).handName}
                        </div>
                    )}
                    <div
                        style={{
                            width: '40pt',
                            height: '40pt',
                            backgroundColor: '#579',
                            borderRadius: '100%',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            border: '2px solid #EEE',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: tableState.toAct === i ? '0 0 0 0 rgba(255, 255, 0, 0.7)' : 'none',
                            animation: tableState.toAct === i ? 'sonar-yellow 2s infinite' : 'none',
                        }}
                    >
                        <style>{`
                            @keyframes sonar-yellow {
                                0% { box-shadow: 0 0 0 0 rgba(255, 255, 0, 0.9); }
                                50% { box-shadow: 0 0 0 15px rgba(255, 255, 0, 0.5); }
                                100% { box-shadow: 0 0 0 25px rgba(255, 255, 0, 0); }
                            }
                        `}</style>
                        <img
                            src={BASE_URL+sessionStorage.getItem('avatar') }
                            alt="avatar"
                            style={{
                                objectFit: 'cover',
                                width: '100%',
                                height: '100%',
                            }}
                        />
                    </div>
                </div>
                <div className={`player-cards ${cardCount > 2 ? 'omaha' : ''}`}>
                    {(winData?.allCards ?? []).length > 0 ? (
                        <div className={`card-containers ${cardCount > 2 ? 'omaha' : ''}`}>
                            {(winData.allCards[i] ?? []).length > 0 && !foldedPlayers.current.has(i) && (
                                <>
                                    {(winData.allCards[i]).map((card, idx) => (
                                        <div className="card" key={idx}>
                                            <img src={getSrcCard(card)} alt="" />
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            {tableState.activeSeats.includes(i) && (
                                i === tableState.seat && tableState.playerCards != null ? (
                                    <div className={`card-containers ${cardCount > 2 ? 'omaha' : ''}`}
                                        style={{
                                            transform: 'translateY(50%)',
                                            zIndex: -1,
                                        }}
                                    >
                                        {tableState.playerCards.map((card, idx) => (
                                            <div className="card" key={idx}>
                                                <img src={getSrcCard(card)} alt="" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div
                                        className={`card-containers ${cardCount > 2 ? 'omaha' : ''}`}
                                        style={{
                                            transform: 'translateY(50%)',
                                            zIndex: -1,
                                        }}
                                    >
                                        {[...Array(cardCount)].map((_, idx) => (
                                            <div className="card" key={idx}><img src={rever} alt="" /></div>
                                        ))}
                                    </div>
                                )
                            )}

                            {shouldShareCards && (
                                <div
                                    className={`card-containers ${cardCount > 2 ? 'omaha' : ''}`}
                                    style={{
                                        transform: 'translateY(50%)',
                                        zIndex: -1,
                                    }}
                                >
                                    {[...Array(cardCount)].map((_, idx, arr) => {
                                        const count = arr.length;
                                        // Spread cards slightly at the dealer position
                                        const xOffset = (idx - (count - 1) / 2) * -100;
                                        return (
                                            <div
                                                key={idx}
                                                className="card"
                                                style={{
                                                    transition: 'all 0.3s ease-in',
                                                    transitionDelay: (idx * (0.5 / count)) + i * (0.5 / tableState.playerIds.length) + 's',
                                                    transform: sharingCards ? 'translate(0, 0) scale(1)' : `translate(calc(${(tableCenterX - pdx) / zoom}px + ${xOffset}%), ${(tableCenterY - pdy) / zoom}px)`,
                                                }}
                                            >
                                                <img src={rever} alt="" />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: -4,
                        bottom: 0,
                        right: -4,
                        backgroundColor: winData?.winStates && winData?.winStates[i].isWinner ? '#000' : '#000',
                        border: winData?.winStates && winData?.winStates[i].isWinner ? '2px solid #000000' : '2px solid #000000',
                        borderRadius: 12,
                        overflow: 'hidden',
                        zIndex: -1,
                        boxShadow: tableState.toAct === i ? '0px 0px 12px 2px #00FF99' : 'none',
                    }}
                >
                </div>

                <div className="player-name" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minWidth: '120px' }}>
                    <div>
                        {(tableState.playerNames?.[i] ?? '').length > 10
                            ? tableState.playerNames[i].slice(0, 10) + '...'
                            : (tableState.playerNames?.[i] || '')}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        {dealer === i ? (
                            <span style={{ 
                                backgroundColor: 'white', 
                                color: 'black', 
                                borderRadius: '50%', 
                                width: '16px', 
                                height: '16px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontSize: '0.55rem', 
                                fontWeight: 'bold',
                                border: '1px solid #ccc'
                            }}>D</span>
                        ) : (
                            <>
                                {sb === i && (
                                    <span style={{ 
                                        backgroundColor: 'blue', 
                                        color: 'white', 
                                        borderRadius: '50%', 
                                        width: '16px', 
                                        height: '16px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        fontSize: '0.55rem', 
                                        fontWeight: 'bold'
                                    }}>SB</span>
                                )}
                            </>
                        )}
                        {bb === i && (
                            <span style={{ 
                                backgroundColor: 'red', 
                                color: 'white', 
                                borderRadius: '50%', 
                                width: '16px', 
                                height: '16px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontSize: '0.55rem', 
                                fontWeight: 'bold'
                            }}>BB</span>
                        )}
                    </div>
                </div>
                
                <div className="player-action-status">
                    {
                        (() => {
                            // Priorité au statut Fold persistant via le set foldedPlayers
                            if (foldedPlayers.current.has(i)) {
                                return <div className="action-badge badge-fold">Fold</div>;
                            }
                            
                            // Sinon, affichage des actions en cours (ex: raise, call)
                            const playerAction = tableState.actions?.find(item => item.playerId === i);
                            if (playerAction && playerAction.action !== 'fold') {
                                const action = playerAction.action;
                                const isAllIn = playerAction.amount > 0 && tableState.playerIds[i] && chips?.stack === 0; // Simplified all-in check
                                
                                let badgeClass = "badge-call";
                                let label = action;

                                if (action === 'raise' || action === 'bet') {
                                    badgeClass = "badge-raise";
                                    label = "Raise";
                                } else if (action === 'call') {
                                    badgeClass = "badge-call";
                                    label = "Call";
                                } else if (action === 'check') {
                                    badgeClass = "badge-call";
                                    label = "Check";
                                }

                                return (
                                    <div className={`action-badge ${badgeClass}`} key={i}>
                                        {label}
                                    </div>
                                );
                            }
                            return null;
                        })()
                    }
                </div>
                <div
                    style={{
                        height: 2,
                        width: '75%',
                        backgroundColor: '#00FF99',
                        marginTop: 2,
                        marginBottom: 2,
                        borderRadius: 2,
                        boxShadow: tableState.toAct === i ? '0px 0px 12px 4px #00FF99' : 'none',
                    }}
                ></div>
                <div className={`amount p_${i}`}>
                    {
                        (() => {
                            const playerAction = tableState.actions.find(item => item.playerId === i);
                            if (playerAction) {
                                return (
                                    <>
                                        <div key={i}
                                            style={{
                                                color: 'white',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {playerAction.action === 'check' || playerAction.action === 'fold'
                                                ? ''
                                                : `${playerAction.amount}`
                                            }
                                        </div>
                                        {playerAction.amount > 0 && (
                                            <div className="jeton">
                                                <img src={require("../../styles/image/jeton.png")} alt="" />
                                            </div>
                                        )}
                                    </>
                                );
                            }
                        })()
                    }
                </div>
                <div className="stacks">
                    {isStackHidden ? (
                        showResult ? (
                            winData?.winStates?.find(w => w.seat === i)?.isWinner ? (
                                <div className="hand-name-result" style={{ color: '#00FF99', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    {winData.winStates.find(w => w.seat === i).handName}
                                </div>
                            ) : (
                                <div className="hand-name-result lose-badge" style={{ 
                                    backgroundColor: '#888888', 
                                    color: 'white', 
                                    fontSize: '0.7rem', 
                                    fontWeight: 'bold',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    textTransform: 'uppercase'
                                }}>
                                    {foldedPlayers.current.has(i) ? 'Fold' : 'Lose'}
                                </div>
                            )
                        ) : null // Zone vide pour le suspense
                    ) : (
                        <>
                            {chips != null ? `${displayStack}` :
                            <div className="no-chips" style={{ opacity: 0.7 }}>0</div>}
                        </>
                    )}
                </div>
                
                <div
                    style={{
                        zIndex: 9999,
                        position: 'absolute',
                        top: '100%',
                        // right: i <= 3 ? '-25%' : 'auto',
                        // left: i > 3 ? '-25%' : 'auto',
                        color: 'white',
                        cursor: 'pointer',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        // paddingTop: 4,
                        // paddingBottom: 4,
                    }}
                    onClick={() => tableState.seat === i && setSmileysOpen(!smileysOpen)}
                >
                    {tableState.seat === i ? (
                        <>
                            {smiley ? (
                                <div>
                                    <img src={smiley} alt="Smiley" style={{ width: '100%', borderRadius: '4pt' }} />
                                </div>
                            ) : (
                                <div>
                                    {/* <img src={"/smileys/Tired 3D Sticker by Emoji.gif"} alt="Smiley" style={{ width: '100%', borderRadius: '4pt' }} /> */}
                                    <Smile size={32} fill='#ff9100ff' />
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {playerSmileys.find(s => s.seat === i) && (
                                <div>
                                    <img src={playerSmileys.find(s => s.seat === i).smiley} alt="Smiley" style={{ width: '100%', borderRadius: '4pt' }} />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            
            {tableState.seat === i && (
                <SmileyModal 
                    isOpen={smileysOpen} 
                    onClose={() => setSmileysOpen(false)} 
                    onSelect={(smiley) => {
                        setSmiley(smiley);
                        setSmileysOpen(false);
                        sendSmiley(smiley);
                        setTimeout(() => {
                            setSmiley(null);
                        }, 8000);
                    }}
                />
            )}
        </>
    );
};

export default Player;