import React, { useEffect, useState, useRef } from 'react';
import { Smile } from "lucide-react";
import SmileyModal from './SmileyModal';
import { smileySocket } from '../../engine/socket';

import PlayerHandOmaha from './PlayerHandOmaha';
import PlayerHandHoldem from './PlayerHandHoldem';

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
    
    // Références pour verrouiller le solde et la séquence
    const lastSafeStack = useRef(chips?.stack ?? 0);
    const isLocked = useRef(false);
    const sequenceStarted = useRef(false);
    
    // NOUVEAU : Référence pour toujours avoir le solde le plus récent du serveur
    const actualStack = chips?.stack ?? 0;
    const latestStackRef = useRef(actualStack);
    useEffect(() => {
        latestStackRef.current = actualStack;
    }, [actualStack]);

    // Déterminer l'état actuel
    const isWinPhase = gameOver || (winData?.winStates?.length > 0);
    const isPlayerAtSeat = tableState.playerNames[i] != null;
    const winnerInfo = winData?.winStates?.find(w => w.seat === i);
    const isWinner = !!winnerInfo?.isWinner;
    const isPlayerInHand = isPlayerAtSeat && !foldedPlayers.current.has(i);
    const isPlayerAllIn = tableState.handInProgress && !isWinPhase && actualStack === 0 && isPlayerInHand;

    // Déterminer s'il y a eu un Showdown (ouverture des cartes)
    const hasShowdown = winData?.allCards && Object.keys(winData.allCards).length > 0 && Object.values(winData.allCards).some(hand => hand && hand.length > 0);
    
    // MASQUAGE : On cache tout pendant la phase de victoire, sauf si la séquence est finie (isLocked est redevenu false)
    const shouldBeHidden = isWinPhase 
        ? (isLocked.current || !sequenceStarted.current || showResult || isStackHidden)
        : (isPlayerAllIn || isStackHidden);

    // Reset complet de la séquence et du masquage quand on quitte la phase de victoire
    useEffect(() => {
        if (!isWinPhase) {
            sequenceStarted.current = false;
            isLocked.current = false;
            setIsStackHidden(false);
            setShowResult(false);
            setDisplayStack(latestStackRef.current);
            lastSafeStack.current = latestStackRef.current;
        }
    }, [isWinPhase]);

    // Persister le dernier solde valide et gérer les animations
    useEffect(() => {
        const isIncreasing = actualStack > lastSafeStack.current;

        // 1. PHASE DE VICTOIRE
        if (isWinPhase && isPlayerAtSeat) {
            const isLoser = !isWinner;

            // DÉMARRAGE DE LA SÉQUENCE
            if (!sequenceStarted.current) {
                sequenceStarted.current = true;
                isLocked.current = true;
                setIsStackHidden(true);
                setShowResult(false);
            }

            // GESTION DE L'AFFICHAGE DU RÉSULTAT
            if (sequenceStarted.current && isLocked.current && !showResult) {
                
                // CAS 1 : Pas de showdown (Tout le monde a foldé)
                if (!hasShowdown) {
                    const tResult = setTimeout(() => {
                        setShowResult(true); 
                        const tFinal = setTimeout(() => {
                            const finalAmount = latestStackRef.current;
                            setDisplayStack(finalAmount);
                            setIsStackHidden(false);
                            setShowResult(false);
                            lastSafeStack.current = finalAmount;
                            isLocked.current = false;
                        }, 3000);
                        return () => clearTimeout(tFinal);
                    }, 500); 
                    return () => clearTimeout(tResult);
                } 
                
                // CAS 2 : Showdown (On attend que isRevealFinished soit vrai)
                if (hasShowdown && isRevealFinished) {
                    const t1 = setTimeout(() => {
                        setShowResult(true); // ICI affichage de "PAIR 5", etc.
                        
                        const t2 = setTimeout(() => {
                            const finalAmount = latestStackRef.current;
                            setDisplayStack(finalAmount);
                            setIsStackHidden(false);
                            setShowResult(false);
                            lastSafeStack.current = finalAmount;
                            isLocked.current = false;
                        }, 2500);
                        return () => clearTimeout(t2);
                    }, 1000);
                    return () => clearTimeout(t1);
                }
            }
        }

        // 2. PHASE DE JEU NORMALE
        if (!isWinPhase) {
            if (isPlayerAllIn) {
                setIsStackHidden(true);
                isLocked.current = true;
            } else if (!isIncreasing && !isLocked.current) {
                setDisplayStack(actualStack);
                setIsStackHidden(false);
                setShowResult(false);
                lastSafeStack.current = actualStack;
            } else if (isIncreasing && !isLocked.current) {
                isLocked.current = true;
                setIsStackHidden(true); 
            } else if (!isIncreasing && isLocked.current && !isPlayerAllIn) {
                isLocked.current = false;
            }
        }
    }, [actualStack, gameOver, isRevealFinished, winData, i, tableState, isPlayerAllIn, isWinPhase, hasShowdown, isPlayerAtSeat, isWinner]);

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

                {tableState.gameType === 'omaha' ? (
                    <PlayerHandOmaha 
                        i={i}
                        tableState={tableState}
                        winData={winData}
                        getSrcCard={getSrcCard}
                        rever={rever}
                        foldedPlayers={foldedPlayers}
                        shouldShareCards={shouldShareCards}
                        sharingCards={sharingCards}
                        tableCenterX={tableCenterX}
                        tableCenterY={tableCenterY}
                        pdx={pdx}
                        pdy={pdy}
                        zoom={zoom}
                    />
                ) : (
                    <PlayerHandHoldem 
                        i={i}
                        tableState={tableState}
                        winData={winData}
                        getSrcCard={getSrcCard}
                        rever={rever}
                        foldedPlayers={foldedPlayers}
                        shouldShareCards={shouldShareCards}
                        sharingCards={sharingCards}
                        tableCenterX={tableCenterX}
                        tableCenterY={tableCenterY}
                        pdx={pdx}
                        pdy={pdy}
                        zoom={zoom}
                    />
                )}

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
                            // Priorité au statut Fold persistant via le set foldedPlayers
                            if (foldedPlayers.current.has(i)) {
                                return <div className="action" style={{ color: '#ff4444' }}>Fold</div>;
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
                    {shouldBeHidden ? (
                        showResult ? (
                            winData?.winStates?.find(w => w.seat === i)?.isWinner ? (
                                <div className="hand-name-result" style={{ color: '#00FF99', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    {winData.winStates.find(w => w.seat === i).handName || 'GAGNANT'}
                                </div>
                            ) : (
                                <div className="hand-name-badge" style={{ 
                                    fontSize: '0.7rem', 
                                    fontWeight: 'bold',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    textTransform: 'uppercase',
                                    display: 'block', 
                                    margin: '0 auto',
                                    color: '#ff4444',
                                    border: '1px solid #ff4444'
                                }}>
                                    {hasShowdown ? 'Lose' : 'ALL FOLD'}
                                </div>
                            )
                        ) : null 
                    ) : (
                        <>
                            {chips != null ? `${displayStack}` :
                            <div className="no-chips" style={{ opacity: 0.7 }}>0</div>}
                        </>
                    )}
                </div>
                
                <div
                    style={{
                        zIndex: 5, /* Réduit pour ne pas bloquer les boutons d'action global */
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