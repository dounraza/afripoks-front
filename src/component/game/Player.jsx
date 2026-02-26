import React, { useEffect, useState } from 'react';
import { Smile } from "lucide-react";
import SmileyModal from './SmileyModal';
import { smileySocket } from '../../engine/socket';

const Player = ({
    i,              // seat RÉEL  → toutes les données du jeu
    visualSeat,     // seat VISUEL → CSS uniquement (seat0, seat1...) — fallback sur i
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
    // Si visualSeat n'est pas fourni (ancien code), on fallback sur i
    const vs = visualSeat !== undefined ? visualSeat : i;

    const [smileysOpen, setSmileysOpen] = useState(false);
    const [smiley, setSmiley] = useState(null);
    const [playerSmileys, setPlayerSmileys] = useState([]);

    const sendSmiley = (smiley) => {
        const seat = tableState.seat;
        smileySocket.emit('send-smiley', { tableId, seat, smiley });
    };

    const onReceiveSmiley = (seat, smiley) => {
        console.log('Receive smiley', smiley);
        setPlayerSmileys(prev => [...prev, { seat, smiley }]);
        setTimeout(() => {
            setPlayerSmileys(prev => prev.filter(s => s.seat !== seat));
        }, 5000);
    };

    smileySocket.emit('join', tableId);

    const onConnect = () => {
        console.log('Smiley socket connected !');
    };

    useEffect(() => {
        console.log('Bonjour');
        smileySocket.on('connect', onConnect);
        smileySocket.on('receive-smiley', onReceiveSmiley);
        return () => {
            smileySocket.off('connect', onConnect);
            smileySocket.off('receive-smiley', onReceiveSmiley);
        };
    }, []);

    // ✅ Guard : pas de joueur à ce seat réel
    if (!tableState.playerNames[i]) return null;

    // ── Données avatar (seat réel = i) ──────────────────────────────────────
    const avatarJson = avatars?.find(avt => avt.userId === tableState.playerIds[i]);
    const avatar = avatarJson?.avatar;
    const avatarSrc = `/avatars/${avatar}`;

    // ── Refs DOM (seat visuel = vs) ─────────────────────────────────────────
    const playerRef = playerRefs[vs];
    const playerRect = playerRef?.current?.getBoundingClientRect();

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

    return (
        <>
            <div
                ref={playerRefs[vs]}    // ← seat VISUEL pour le DOM
                className={`
                    player 
                    seat${vs}           
                    ${(winData?.winStates ?? []).length > 0 && winData.winStates.find(w => w.seat === i)?.isWinner && isRevealFinished ? 'win' : ''}
                    ${tableState.toAct === i ? 'active' : ''}
                `}
                style={{
                    borderRadius: 6,
                    opacity: foldedPlayers.current.has(i) ? 0.6 : 1,
                    transition: 'opacity 0.3s ease-in-out'
                }}
                key={vs}
            >
                {/* ── Avatar ───────────────────────────────────────────── */}
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
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                </div>

                {/* ── SB / Dealer / BB (seat réel = i) ─────────────────── */}
                {sb === i && (
                    <div className={`btn-action sb-btn ${(vs > 3 && vs < 7) ? '' : 'right'}`}>Sb</div>
                )}
                {dealer === i && (
                    <div className={`btn-action deal-btn ${(vs > 3 && vs < 7) ? '' : 'right'}`}>d</div>
                )}
                {bb === i && (
                    <div className={`btn-action bb-btn ${(vs > 3 && vs < 7) ? '' : 'right'}`}>Bb</div>
                )}

                {/* ── Cartes ───────────────────────────────────────────── */}
                <div className="player-cards">
                    {(winData?.allCards ?? []).length > 0 ? (
                        // Fin de partie : révélation (seat réel = i)
                        <div className="card-containers">
                            {(winData.allCards[i] ?? []).length > 0 && !foldedPlayers.current.has(i) && (
                                <>
                                    <div className="card">
                                        <img src={getSrcCard(winData.allCards[i][0])} alt="" />
                                    </div>
                                    <div className="card">
                                        <img src={getSrcCard(winData.allCards[i][1])} alt="" />
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Cartes pendant la partie (seat réel = i) */}
                            {tableState.activeSeats.includes(i) && (
                                i === tableState.seat && tableState.playerCards != null ? (
                                    // Mes cartes : faces visibles
                                    <div
                                        className="card-containers"
                                        style={{ transform: 'translateY(50%)', zIndex: -1 }}
                                    >
                                        <div className="card">
                                            <img src={getSrcCard(tableState.playerCards[0])} alt="" />
                                        </div>
                                        <div className="card">
                                            <img src={getSrcCard(tableState.playerCards[1])} alt="" />
                                        </div>
                                    </div>
                                ) : (
                                    // Cartes des autres : dos
                                    <div
                                        className="card-containers"
                                        style={{ transform: 'translateY(50%)', zIndex: -1 }}
                                    >
                                        <div className="card"><img src={rever} alt="" /></div>
                                        <div className="card"><img src={rever} alt="" /></div>
                                    </div>
                                )
                            )}

                            {/* Animation distribution (seat visuel = vs pour timing) */}
                            {shouldShareCards && (
                                <div
                                    className="card-containers"
                                    style={{ transform: 'translateY(50%)', zIndex: -1 }}
                                >
                                    <div
                                        className="card"
                                        style={{
                                            transition: 'all 0.3s ease-in',
                                            transitionDelay: vs * (0.5 / tableState.playerIds.length) + 's',
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
                                            transitionDelay: (tableState.playerIds.length * (0.5 / tableState.playerIds.length)) + vs * (0.5 / tableState.playerIds.length) + 's',
                                            transform: sharingCards
                                                ? 'translate(0, 0) scale(1)'
                                                : `translate(calc(${(tableCenterX - pdx) / zoom}px - 50%), ${(tableCenterY - pdy) / zoom}px)`,
                                        }}
                                    >
                                        <img src={rever} alt="" />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── Background / Timer (seat réel = i) ───────────────── */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: -4,
                        bottom: 0,
                        right: -4,
                        backgroundColor: '#0008',
                        border: '2px solid #00FF99',
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
                        />
                    )}
                </div>

                {/* ── Nom / Action (seat réel = i) ──────────────────────── */}
                <div className="player-name">
                    {(() => {
                        const playerAction = tableState.actions.find(item => item.playerId === i);
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
                                <div>
                                    {(tableState.playerNames[i] ?? '').length > 10
                                        ? tableState.playerNames[i].slice(0, 10) + '...'
                                        : tableState.playerNames[i]}
                                </div>
                            );
                        }
                    })()}
                </div>

                {/* ── Séparateur ────────────────────────────────────────── */}
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
                />

                {/* ── Montant misé (seat réel = i) ──────────────────────── */}
                <div className={`amount p_${vs}`}>
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

                {/* ── Stack / Hand name (seat réel = i) ─────────────────── */}
                <div className="stacks">
                    <>
                        {isRevealFinished && winData?.winStates?.find(w => w.seat === i) ? (
                            (() => {
                                const playerResult = winData.winStates.find(w => w.seat === i);
                                const isWinner = playerResult?.isWinner;
                                const displayText = isWinner ? playerResult?.handName : 'LOSE';
                                const textColor = isWinner ? '#00FF99' : '#FF4444';
                                const textShadow = isWinner 
                                    ? '0 0 10px rgba(0, 255, 153, 0.8), 0 0 20px rgba(0, 255, 153, 0.5)' 
                                    : '0 0 10px rgba(255, 68, 68, 0.8), 0 0 20px rgba(255, 68, 68, 0.5)';
                                
                                return (
                                    <div className="chips" style={{ 
                                        color: textColor,
                                        textShadow: textShadow,
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem'
                                    }}>
                                        {displayText}
                                    </div>
                                );
                            })()
                        ) : (
                            chips != null
                                ? `${chips.stack}`
                                : <div className="no-chips" style={{ opacity: 0.7 }}>0</div>
                        )}
                    </>
                </div>

                {/* ── Smiley (seat réel = i) ────────────────────────────── */}
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
                                    <img
                                        src={playerSmileys.find(s => s.seat === i).smiley}
                                        alt="Smiley"
                                        style={{ width: '100%', borderRadius: '4pt' }}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── Modal smiley (seat réel = i) ───────────────────────────── */}
            {tableState.seat === i && (
                <SmileyModal
                    isOpen={smileysOpen}
                    onClose={() => setSmileysOpen(false)}
                    onSelect={(smiley) => {
                        setSmiley(smiley);
                        setSmileysOpen(false);
                        sendSmiley(smiley);
                        setTimeout(() => setSmiley(null), 8000);
                    }}
                />
            )}
        </>
    );
};

export default Player;