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
        setPlayerSmileys(prev => [...prev, { seat, smiley }]);
        setTimeout(() => {
            setPlayerSmileys(prev => prev.filter(s => s.seat !== seat));
        }, 5000);
    }

    useEffect(() => {
        smileySocket.emit('join', tableId);
        smileySocket.on('receive-smiley', onReceiveSmiley);
        return () => {
            smileySocket.off('receive-smiley', onReceiveSmiley);
        }
    }, [tableId]);

    const [displayStack, setDisplayStack] = useState(chips?.stack ?? 0);
    const [isStackHidden, setIsStackHidden] = useState(false);
    const [showResult, setShowResult] = useState(false);
    
    const lastSafeStack = useRef(chips?.stack ?? 0);
    const isLocked = useRef(false);

    useEffect(() => {
        if (chips?.stack === undefined) return;

        const actualStack = chips.stack;
        const isWinPhase = gameOver || (winData?.winStates?.length > 0);
        const isIncreasing = actualStack > lastSafeStack.current;

        if (!isWinPhase) {
            if (isIncreasing && !isLocked.current) {
                isLocked.current = true;
                return;
            }
            isLocked.current = false;
            lastSafeStack.current = actualStack;
            setDisplayStack(actualStack);
            setIsStackHidden(false);
            setShowResult(false);
            return;
        }

        const winner = winData?.winStates?.find(w => Number(w.seat) === Number(i));
        const isWinner = winner?.isWinner;
        const hasFinalCards = winData?.allCards?.[i] && winData.allCards[i].length > 0;
        const isFoldedAtEnd = (gameOver || winData?.winStates) && (
            foldedPlayers.current.has(i) || 
            foldedPlayers.current.has(String(i)) ||
            (winData?.winStates && !hasFinalCards)
        );
        const isLoser = winner && !winner.isWinner && !isFoldedAtEnd;

        if (isWinner || isLoser || isFoldedAtEnd) {
            isLocked.current = true;
            const hasShowdown = winData?.allCards && Object.values(winData.allCards).some(hand => Array.isArray(hand) && hand.length > 0);

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
                    }, 4000);
                    return () => clearTimeout(timer);
                }
            } else if (!isRevealFinished) {
                setDisplayStack(lastSafeStack.current);
                setShowResult(true);
            } else {
                if (!isStackHidden && !showResult) {
                    setIsStackHidden(true);
                    const timerResult = setTimeout(() => setShowResult(true), 1200);
                    const timerStack = setTimeout(() => {
                        setDisplayStack(actualStack);
                        setIsStackHidden(false);
                        setShowResult(false);
                        lastSafeStack.current = actualStack;
                    }, 4500);
                    return () => {
                        clearTimeout(timerResult);
                        clearTimeout(timerStack);
                    };
                }
            }
        } else {
            setDisplayStack(actualStack);
            lastSafeStack.current = actualStack;
            setShowResult(false);
        }
    }, [chips?.stack, gameOver, isRevealFinished, winData, i]);

    if (!tableState.playerNames[i]) return null;

    const avatarJson = avatars?.find(avt => avt.userId === tableState.playerIds[i]);
    const avatarSrc = `/avatars/${avatarJson?.avatar || '0.png'}`;

    const getCardCount = () => {
        if (tableState.playerCards && tableState.playerCards.length > 0) return tableState.playerCards.length;
        if (winData.allCards) {
            const firstHand = winData.allCards.find(hand => hand && hand.length > 0);
            if (firstHand) return firstHand.length;
        }
        return 2;
    };

    const cardCount = getCardCount();
    const hasShowdown = winData?.allCards && Object.values(winData.allCards).some(hand => Array.isArray(hand) && hand.length > 0);
    const winner = winData?.winStates?.find(w => Number(w.seat) === Number(i));
    const isWinner = winner?.isWinner;
    const hasFinalCards = winData?.allCards?.[i] && winData.allCards[i].length > 0;
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
                className={`player seat${i} ${isWinner && isRevealFinished ? 'win' : ''} ${tableState.toAct === i ? 'active' : ''}`}
                style={{ borderRadius: 6 }}
                key={i}
            >
                <div style={{ position: 'absolute', bottom: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: -1 }}>
                    <div style={{ width: '40pt', height: '40pt', backgroundColor: '#579', borderRadius: '100%', fontSize: '1.2rem', fontWeight: 'bold', border: '2px solid #EEE', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={avatarSrc} alt="avatar" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                    </div>
                </div>
                {sb === i && <div className={`btn-action sb-btn ${(i > 3 && i < 7) ? '' : 'right'}`}>Sb</div>}
                {dealer === i && <div className={`btn-action deal-btn ${(i > 3 && i < 7) ? '' : 'right'}`}>d</div>}
                {bb === i && <div className={`btn-action bb-btn ${(i > 3 && i < 7) ? '' : 'right'}`}>Bb</div>}

                <div className={`player-cards ${cardCount > 2 ? 'omaha' : ''}`}>
                    {winData?.allCards?.[i] && winData.allCards[i].length > 0 && !foldedPlayers.current.has(i) ? (
                        <div className={`card-containers ${cardCount > 2 ? 'omaha' : ''}`}>
                            {winData.allCards[i].map((card, idx) => (
                                <div className="card" key={idx}><img src={getSrcCard(card)} alt="" /></div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {tableState.activeSeats.includes(i) && (
                                i === tableState.seat && tableState.playerCards != null ? (
                                    <div className={`card-containers ${cardCount > 2 ? 'omaha' : ''}`} style={{ transform: 'translateY(50%)', zIndex: -1 }}>
                                        {tableState.playerCards.map((card, idx) => (
                                            <div className="card" key={idx}><img src={getSrcCard(card)} alt="" /></div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`card-containers ${cardCount > 2 ? 'omaha' : ''}`} style={{ transform: 'translateY(50%)', zIndex: -1 }}>
                                        {[...Array(cardCount)].map((_, idx) => (
                                            <div className="card" key={idx}><img src={rever} alt="" /></div>
                                        ))}
                                    </div>
                                )
                            )}
                        </>
                    )}
                </div>

                <div style={{ position: 'absolute', top: 0, left: -4, bottom: 0, right: -4, backgroundColor: '#0008', border: '2px solid #00FF99', borderRadius: 4, overflow: 'hidden', zIndex: -1, boxShadow: tableState.toAct === i ? '0px 0px 12px 2px #00FF99' : 'none' }}>
                    {tableState.toAct === i && <div style={{ backgroundColor: '#00915C', width: '100%', height: '100%', animation: 'shrinkToLeft 12s linear forwards' }}></div>}
                </div>

                <div className="player-name">
                    {(() => {
                        if (!gameOver && !tableState.handInProgress) {
                            return <div>{(tableState.playerNames[i] || '').length > 10 ? tableState.playerNames[i].slice(0, 10) + '...' : (tableState.playerNames[i] || '')}</div>;
                        }
                        if (foldedPlayers.current.has(i) || foldedPlayers.current.has(String(i))) {
                            return <div className="action" style={{ color: '#00FF99' }}>Fold</div>;
                        }
                        const playerAction = tableState.actions?.find(item => item.playerId === i);
                        if (playerAction && playerAction.action !== 'fold') {
                            return <div className="action" style={{ color: '#00FF99' }}>{playerAction.action}</div>;
                        }
                        return <div>{(tableState.playerNames[i] || '').length > 10 ? tableState.playerNames[i].slice(0, 10) + '...' : (tableState.playerNames[i] || '')}</div>;
                    })()}
                </div>
                <div style={{ height: 2, width: '75%', backgroundColor: '#00FF99', marginTop: 2, marginBottom: 2, borderRadius: 2, boxShadow: tableState.toAct === i ? '0px 0px 12px 4px #00FF99' : 'none' }}></div>
                
                <div className={`amount p_${i}`}>
                    {(() => {
                        const playerAction = tableState.actions.find(item => item.playerId === i);
                        if (playerAction && playerAction.action !== 'check' && playerAction.action !== 'fold') {
                            return <><div style={{ color: 'white', fontWeight: 600 }}>{playerAction.amount}</div><div className="jeton"><img src={require("../../styles/image/jeton.png")} alt="" /></div></>;
                        }
                    })()}
                </div>

                <div className="stacks">
                    {isStackHidden && showResult ? (
                        isWinner ? (
                            <div className="hand-name-result" style={{ color: '#00FF99', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                {!hasShowdown ? 'All Fold' : (winner?.handName || '')}
                            </div>
                        ) : isLoser ? (
                            <div className="hand-name-result" style={{ color: '#00FF99', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Lose</div>
                        ) : (
                            chips != null ? `${displayStack}` : '0'
                        )
                    ) : (
                        chips != null ? `${displayStack}` : '0'
                    )}
                </div>
                
                <div style={{ zIndex: 9999, position: 'absolute', top: '100%', color: 'white', cursor: 'pointer', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40 }} onClick={() => tableState.seat === i && setSmileysOpen(!smileysOpen)}>
                    {tableState.seat === i ? (
                        smiley ? <img src={smiley} alt="Smiley" style={{ width: '100%', borderRadius: '4pt' }} /> : <Smile size={32} fill='#ff9100ff' />
                    ) : (
                        playerSmileys.find(s => s.seat === i) && <img src={playerSmileys.find(s => s.seat === i).smiley} alt="Smiley" style={{ width: '100%', borderRadius: '4pt' }} />
                    )}
                </div>
            </div>
            
            {tableState.seat === i && (
                <SmileyModal isOpen={smileysOpen} onClose={() => setSmileysOpen(false)} onSelect={(s) => { setSmiley(s); setSmileysOpen(false); sendSmiley(s); setTimeout(() => setSmiley(null), 8000); }} />
            )}
        </>
    );
};

export default Player;
