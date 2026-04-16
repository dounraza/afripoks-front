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
    community,
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

        // CAS 1 : Phase de jeu normale ou Nouvelle Main (isWinPhase est false)
        if (!isWinPhase) {
            // Si on détecte une augmentation de jetons alors qu'on n'est pas encore en phase de victoire,
            // on verrouille temporairement pour créer le suspense de la future victoire.
            if (isIncreasing && !isLocked.current) {
                isLocked.current = true;
                return;
            }

            // Si le jeu continue normalement ou qu'une nouvelle main commence,
            // on libère tout et on affiche le solde réel immédiatement.
            isLocked.current = false;
            lastSafeStack.current = actualStack;
            setDisplayStack(actualStack);
            setIsStackHidden(false);
            setShowResult(false);
            return;
        }

        // CAS 2 : Phase de victoire confirmée (isWinPhase est true)
        const winner = winData?.winStates?.find(w => Number(w.seat) === Number(i));
        const isWinner = winner?.isWinner;
        
        // Un joueur a foldé s'il est dans foldedPlayers OU s'il n'a pas de cartes à l'abattage alors que le jeu est fini
        const hasFinalCards = winData?.allCards && winData.allCards[i] && winData.allCards[i].length > 0;
        const isFoldedAtEnd = (gameOver || winData?.winStates) && (
            foldedPlayers.current.has(i) || 
            foldedPlayers.current.has(String(i)) ||
            (winData?.winStates && !hasFinalCards)
        );
        
        const isLoser = winner && !winner.isWinner && !isFoldedAtEnd;

        if (isWinner || isLoser || isFoldedAtEnd) {
            isLocked.current = true;
            const hasShowdown = winData?.allCards && Object.values(winData.allCards).some(hand => Array.isArray(hand) && hand.length > 0);

            // SI PAS DE SHOWDOWN (All Fold / No showdown win)
            if (!hasShowdown) {
                if (!isStackHidden) {
                    setIsStackHidden(true);
                    setShowResult(true);

                    const timer = setTimeout(() => {
                        setDisplayStack(actualStack);
                        lastSafeStack.current = actualStack;
                        setIsStackHidden(false);
                        setShowResult(false);
                        isLocked.current = false;
                    }, 4000); // 4 secondes d'affichage
                    
                    return () => clearTimeout(timer);
                }
            }

            // SI SHOWDOWN (Suspense complet)
            else if (!isRevealFinished) {
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

    const avatarJson = avatars?.find(avt => avt.userId === tableState.playerIds[i]);
    const avatar = avatarJson?.avatar;
    const avatarSrc = `/avatars/${avatar}`;

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

    // Détection de l'abattage (si quelqu'un a montré ses cartes)
    // On vérifie si winData.allCards contient des mains non vides
    const hasShowdown = winData?.allCards && Object.values(winData.allCards).some(hand => Array.isArray(hand) && hand.length > 0);

    // Variables de statut du joueur pour le rendu
    const winner = winData?.winStates?.find(w => Number(w.seat) === Number(i));
    const isWinner = winner?.isWinner;

    // Un joueur a foldé s'il est dans foldedPlayers OU s'il n'a pas de cartes à l'abattage alors que le jeu est fini
    const hasFinalCards = winData?.allCards && winData.allCards[i] && winData.allCards[i].length > 0;
    const isFoldedAtEnd = (gameOver || winData?.winStates) && (
        foldedPlayers.current.has(i) || 
        foldedPlayers.current.has(String(i)) ||
        (winData?.winStates && !hasFinalCards)
    );

    const isLoser = winner && !winner.isWinner && !isFoldedAtEnd;

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
                style={{ borderRadius: 6 }}
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
                        }}
                    >
                        <img
                            src={avatarSrc}
                            alt="avatar"
                            style={{
                                objectFit: 'cover',
                                width: '100%',
                                height: '100%',
                            }}
                        />
                    </div>
                </div>
                {sb === i && (
                    <div className={`btn-action sb-btn ${(i > 3 && i < 7) ? '' : 'right'}`}>Sb</div>
                )}
                {dealer === i && (
                    <div className={`btn-action deal-btn ${(i > 3 && i < 7) ? '' : 'right'}`}>d</div>
                )}
                {bb === i && (
                    <div className={`btn-action bb-btn ${(i > 3 && i < 7) ? '' : 'right'}`}>Bb</div>
                )}

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
                        backgroundColor: winData?.winStates && winData?.winStates[i].isWinner ? '#0008' : '#0008',
                        border: winData?.winStates && winData?.winStates[i].isWinner ? '2px solid #00FF99' : '2px solid #00FF99',
                        borderRadius: 4,
                        overflow: 'hidden',
                        zIndex: -1,
                        boxShadow: tableState.toAct === i ? '0px 0px 12px 2px #00FF99' : 'none',
                    }}
                >
                    {tableState.toAct === i && (
                        <div
                            style={{
                                backgroundColor: '#00915C',
                                width: '100%',
                                height: '100%',
                                animation: 'shrinkToLeft 12s linear forwards',
                            }}
                        ></div>
                    )}
                </div>

                <div className="player-name">
                    {
                        (() => {
                            // Si la main est terminée (gameOver est false et aucune main en cours), on affiche le nom
                            // Cela permet de nettoyer l'affichage dès que winData est réinitialisé ou gameOver passe à false
                            if (!gameOver && !tableState.handInProgress) {
                                return <div>
                                    {(tableState.playerNames?.[i] ?? '').length > 10
                                        ? tableState.playerNames[i].slice(0, 10) + '...'
                                        : (tableState.playerNames?.[i] || '')}
                                </div>;
                            }

                            // Priorité au statut Fold persistant via le set foldedPlayers
                            if (foldedPlayers.current.has(i) || foldedPlayers.current.has(String(i))) {
                                return <div className="action" style={{ color: '#00FF99' }}>Fold</div>;
                            }
                            
                            // Sinon, affichage des actions en cours (ex: raise, call)
                            const playerAction = tableState.actions?.find(item => item.playerId === i);
                            if (playerAction && playerAction.action !== 'fold') {
                                return (
                                    <div className={`action`} style={{ color: '#00FF99' }} key={i}>
                                        {playerAction.action}
                                    </div>
                                );
                            }
                            
                            // Sinon, affichage du nom
                            return <div>
                                {(tableState.playerNames?.[i] ?? '').length > 10
                                    ? tableState.playerNames[i].slice(0, 10) + '...'
                                    : (tableState.playerNames?.[i] || '')}
                            </div>;
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
                            winData?.winStates?.find(w => Number(w.seat) === Number(i))?.isWinner ? (
                                // Winner logic: Show hand name or "All Fold"
                                <div className="hand-name-result" style={{ color: '#00FF99', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    {!hasShowdown ? 'All Fold' : winData.winStates.find(w => Number(w.seat) === Number(i)).handName}
                                </div>
                            ) : isLoser ? ( // Player lost by showdown, not folded
                                <div className="hand-name-result lose-badge" style={{ 
                                    color: '#00FF99', // Green color for Lose
                                    fontSize: '0.7rem', 
                                    fontWeight: 'bold',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    textTransform: 'uppercase'
                                }}>
                                    Lose
                                </div>
                            ) : (
                                // Not winner and not loser (e.g., folded, or other cases): Show balance
                                chips != null ? `${displayStack}` : <div className="no-chips" style={{ opacity: 0.7 }}>0</div>
                            )
                        ) : null // Suspense phase: show nothing in stacks if stack is hidden and result is not yet shown
                    ) : (
                        // Stack not hidden: Show balance
                        chips != null ? `${displayStack}` : <div className="no-chips" style={{ opacity: 0.7 }}>0</div>
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