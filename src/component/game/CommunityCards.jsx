import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CommunityCards = ({
    community, communityShow, communityToShow, communityReversNb, moveCommCards,
    gameOver, allInArr, winData, getSrcCard, playSound, soundMute, isRevealFinished, tableId
}) => {
    return (
        <div className="community-cards" key={tableId}>
            <div
                style={{
                    position: 'absolute',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                {Array.from({ length: 5 }).map((_, i) => {
                    let translateX = 0;
                    let opacity = 0;
                    if (communityReversNb === 3) {
                        if (i < 3) opacity = 1;
                    }
                    if (communityReversNb === 1) {
                        if (community[i - 1] === community[community.length - 1]) opacity = 1;
                    }
                    if (i === 0) translateX = 200;
                    if (i === 1) translateX = 100;
                    if (i === 2) translateX = 0;
                    if (i === 3) translateX = -100;
                    if (i === 4) translateX = -200;
                    return (
                        <div key={i}
                            style={{
                                opacity: opacity,
                                transition: 'transform 0.25s ease-in',
                                transform: moveCommCards ? 'translate(0, 0) rotateY(0deg)' : `translate(${translateX}%, -200%) rotateY(90deg)`,
                                padding: 4,
                            }}
                            onTransitionStart={() => {
                                if (moveCommCards) {
                                    playSound('showCard', soundMute);
                                }
                            }}
                            onTransitionEnd={(e) => {
                                setTimeout(() => {
                                    e.target.style.opacity = 0;
                                }, 500);
                            }}
                        >
                            <img src={require("../../styles/image/rever.png")} alt="" />
                        </div>
                    )
                })}
            </div>
            {(gameOver && allInArr.length > 0) && (
                <div
                    style={{
                        position: 'absolute',
                        display: 'flex',
                        zIndex: -1,
                    }}
                >
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div className="card-community" key={i}
                            style={{
                                opacity: communityShow[i] ? 0 : 1,
                                transition: 'all .2s ease-in',
                                transform: communityShow[i] ? 'rotateY(90deg)' : 'rotateY(0)',
                                marginRight: 8,
                            }}
                            onTransitionStart={() => {
                                playSound('showCard');
                            }}
                        >
                            <img src={require("../../styles/image/rever.png")} alt="" />
                        </div>
                    ))}
                </div>
            )}
            {communityShow.map((card, i) => (
                <React.Fragment key={i}>
                    {allInArr.length > 0 ? (
                        <div className="card-community"
                            style={{
                                transition: 'all .2s ease-in',
                                transform: communityToShow[i] === card ? 'rotateY(0deg)' : 'rotateY(90deg)',
                            }}
                        >
                            <img src={getSrcCard(card)} alt="" />
                        </div>
                    ) : (
                        <div className="card-community">
                            <img src={getSrcCard(card)} alt="" />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );

}

export default CommunityCards;