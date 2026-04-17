import React from 'react';

const PlayerHandHoldem = ({
    i,
    tableState,
    winData,
    getSrcCard,
    rever,
    foldedPlayers,
    shouldShareCards,
    sharingCards,
    tableCenterX,
    tableCenterY,
    pdx,
    pdy,
    zoom
}) => {
    const cardCount = 2;

    return (
        <div className="player-cards holdem">
            {(winData?.allCards ?? []).length > 0 ? (
                <div className="card-containers holdem">
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
                            <div className="card-containers holdem"
                                style={{
                                    transform: 'translateY(50%)',
                                    zIndex: -1,
                                }}
                            >
                                {tableState.playerCards.slice(0, 2).map((card, idx) => (
                                    <div className="card" key={idx}>
                                        <img src={getSrcCard(card)} alt="" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div
                                className="card-containers holdem"
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
                            className="card-containers holdem"
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
    );
};

export default PlayerHandHoldem;
