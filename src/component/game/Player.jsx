import React, { useEffect, useState } from 'react';
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
    tableRotation,
    currentUserId,
    showWinnerCards,
    hasPendingWin,
    playPotAnimation,
    communityLength,
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

    if (!tableState.playerNames[i]) return null;

    const avatarJson = avatars?.find(avt => avt.userId === tableState.playerIds[i]);
    const avatar = avatarJson?.avatar;
    const avatarSrc = `/avatars/${avatar}`;

    const isCurrentPlayer = i === tableState.seat;
    const currentSeat = tableState.seat ?? 0;
    const totalSeats = (tableState.seats && tableState.seats.length) ? tableState.seats.length : 9;
    const visualSeat = ((i - currentSeat + totalSeats) % totalSeats);

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

    // ─────────────────────────────────────────────────────────────────────────
    // Déterminer si ce joueur est all-in
    const isPlayerAllIn = allInArr && allInArr.some(a => a && a.playerId === i);

    // Cartes visibles si : actif OU all-in OU la main est en cours (hasPendingWin)
    // Une fois les cartes distribuées, elles restent visibles jusqu'à la fin
    const hasCards = (i === tableState.seat && tableState.playerCards != null)
        || tableState.activeSeats.includes(i)
        || isPlayerAllIn
        || hasPendingWin
        || playPotAnimation
        || gameOver;

    const isActiveOrAllIn = hasCards;

    // ─────────────────────────────────────────────────────────────────────────
    // Affichage du solde :
    // - null  → rien (joueur all-in pendant l'animation)
    // - 0     → rien également (on masque le 0 pendant animation)
    // - valeur normale → afficher
    const stackValue = chips?.stack;
    const isAnimationOngoing = hasPendingWin || playPotAnimation || gameOver;
    const shouldHideStack =
        hideStack ||
        (isRevealFinished && winData?.winStates?.find(w => w.seat === i)?.handName) ||
        communityLength === 5;
    const shouldHideZeroStack = false; // on affiche toujours le 0

    return (
        <>
            <div
                ref={playerRefs[i]}
                className={`
                    player 
                    seat${visualSeat} 
                    ${(winData?.winStates ?? []).length > 0 && winData.winStates.find(w => w.seat === i)?.isWinner && isRevealFinished ? 'win' : ''}
                    ${tableState.toAct === i ? 'active' : ''}`
                }
                style={{ 
                    borderRadius: 6,
                    opacity: (() => {
                        const isFolded = foldedPlayers && foldedPlayers.current && foldedPlayers.current.has(i);
                        if (!isFolded) return 1;
                        const playerAction = tableState.actions?.find(item => item.playerId === i);
                        const actionKeepsActive = playerAction && ['call', 'allin', 'raise'].includes(playerAction.action);
                        const isActiveSeat = tableState.activeSeats?.includes(i);
                        const hasShownCards = (winData?.allCards && (winData.allCards[i] ?? []).length > 0 && showWinnerCards) || shouldShareCards || sharingCards;
                        return (actionKeepsActive || isActiveSeat || hasShownCards) ? 1 : 0.5;
                    })(),
                    border: isCurrentPlayer ? '3px solid #00FF00' : '1px solid transparent'
                }}
                key={i}
            >
                
                <div
                    style={{
                        position: 'absolute',
                        bottom: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40pt',
                        height: '40pt',
                        backgroundColor: '#579',
                        borderRadius: '100%',
                        zIndex: -1,
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        border: '2px solid #EEE',
                        overflow: 'hidden',
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

                {sb === i && (
                    <div className={`btn-action sb-btn ${(i > 3 && i < 7) ? '' : 'right'}`}>Sb</div>
                )}
                {dealer === i && (
                    <div className={`btn-action deal-btn ${(i > 3 && i < 7) ? '' : 'right'}`}>d</div>
                )}
                {bb === i && (
                    <div className={`btn-action bb-btn ${(i > 3 && i < 7) ? '' : 'right'}`}>Bb</div>
                )}

                <div className="player-cards" style={{ zIndex: 10 }}>
                    {(() => {
                        // ── Priorité d'affichage (UN SEUL bloc à la fois) ──────────────
                        // 1. Distribution en cours → animation des cartes dos depuis le centre
                        if (shouldShareCards) {
                            return (
                                <div className="card-containers" style={{ transform: 'translateY(50%)', zIndex: 10 }}>
                                    <div
                                        className="card"
                                        style={{
                                            transition: 'all 0.3s ease-in',
                                            transitionDelay: i * (0.5 / tableState.playerIds.length) + 's',
                                            transform: sharingCards
                                                ? 'translate(0, 0) scale(1)'
                                                : `translate(calc(${(tableCenterX - pdx) / zoom}px + 50%), ${(tableCenterY - pdy) / zoom}px)`,
                                        }}
                                    >
                                        <img src={rever} alt="" />
                                    </div>
                                    <div
                                        className="card"
                                        style={{
                                            transition: 'all 0.3s ease-in',
                                            transitionDelay: (tableState.playerIds.length * (0.5 / tableState.playerIds.length)) + i * (0.5 / tableState.playerIds.length) + 's',
                                            transform: sharingCards
                                                ? 'translate(0, 0) scale(1)'
                                                : `translate(calc(${(tableCenterX - pdx) / zoom}px - 50%), ${(tableCenterY - pdy) / zoom}px)`,
                                        }}
                                    >
                                        <img src={rever} alt="" />
                                    </div>
                                </div>
                            );
                        }

                        // 2. Showdown → cartes retournées du vainqueur
                        if ((winData?.allCards ?? []).length > 0 && isRevealFinished && showWinnerCards) {
                            return (
                                <div className="card-containers">
                                    {(winData.allCards[i] ?? []).length > 0 && !foldedPlayers.current.has(i) && (
                                        (winData.allCards[i] ?? []).map((card, idx) => (
                                            <div className="card" key={idx}>
                                                <img src={getSrcCard(card)} alt="" />
                                            </div>
                                        ))
                                    )}
                                </div>
                            );
                        }

                        // 3. Pendant la main → cartes normales (face ou dos)
                        if (isActiveOrAllIn) {
                            return (
                                <div className="card-containers" style={{ transform: 'translateY(50%)', zIndex: 10 }}>
                                    {(i === tableState.seat) && tableState.playerCards != null
                                        ? tableState.playerCards.map((card, idx) => (
                                            <div className="card" key={idx}>
                                                <img src={getSrcCard(card)} alt="" />
                                            </div>
                                        ))
                                        : (tableState.playerCards ?? ['', '']).map((_, idx) => (
                                            <div className="card" key={idx}>
                                                <img src={rever} alt="" />
                                            </div>
                                        ))
                                    }
                                </div>
                            );
                        }

                        return null;
                    })()}
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
                    {(() => {
                        const playerAction = tableState.actions.find(item => item.playerId === i);
                        const playerNameDisplay = tableState.playerNames[i];
                        if (playerAction) {
                            return (
                                <div className="action" style={{ color: '#00FF99' }} key={i}>
                                    {playerAction.action === 'check' || playerAction.action === 'fold'
                                        ? playerAction.action
                                        : `${playerAction.action}`
                                    }
                                </div>
                            );
                        } else {
                            return (
                                <div style={{ fontWeight: isCurrentPlayer ? 'bold' : 'normal', color: isCurrentPlayer ? '#00FF00' : '#FFF' }}>
                                    {(playerNameDisplay ?? '').length > 10
                                        ? playerNameDisplay.slice(0, 10) + '...'
                                        : playerNameDisplay}
                                    {isCurrentPlayer && ' (Vous)'}
                                </div>
                            );
                        }
                    })()}
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
                    {(() => {
                        const playerAction = tableState.actions.find(item => item.playerId === i);
                        if (playerAction) {
                            return (
                                <>
                                    <div key={i} style={{ color: 'white', fontWeight: 600 }}>
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
                    })()}
                </div>

                {/* ── Solde du joueur ─────────────────────────────────────────────
                 *  - Masqué si hideStack ou handName visible ou 5 cartes communes
                 *  - Masqué si stack=0 ou null pendant une animation (all-in/win)
                 *    → affiche rien au lieu de "0"
                 *  - Sinon affiche le solde normalement
                 */}
                <div
                    className="stacks"
                    style={{
                        opacity: shouldHideStack ? 0 : 1,
                        transition: 'opacity 0.3s ease-in-out'
                    }}
                >
                    {shouldHideZeroStack
                        ? null
                        : chips != null
                            ? `${chips.stack}`
                            : <div className="no-chips" style={{ opacity: 0.7 }}>0</div>
                    }
                </div>

                {isRevealFinished && winData?.winStates?.find(w => w.seat === i)?.handName ? (
                    <div className="chips" style={{ position: 'absolute', bottom: '0.5rem', color: '#00FF99', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        {winData.winStates.find(w => w.seat === i)?.handName}
                    </div>
                ) : null}
                
                <div
                    style={{
                        zIndex: 9999,
                        position: 'absolute',
                        top: '100%',
                        color: 'white',
                        cursor: 'pointer',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
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