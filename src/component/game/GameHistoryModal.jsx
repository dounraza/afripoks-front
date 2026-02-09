import React from 'react';
import { X } from 'lucide-react';
import './GameHistoryModal.scss';

const GameHistoryModal = ({ isOpen, onClose, lastMatchData, getSrcCard, playerNames }) => {
    if (!isOpen) return null;

    const communityCards = lastMatchData?.communityCards || [];
    const allCards = lastMatchData?.allCards || [];
    // const playerNames = lastMatchData?.playerNames || [];
    // Convertir le Set en Set si c'est un Array, sinon utiliser directement
    const foldedPlayers = lastMatchData?.foldedPlayers 
        ? (Array.isArray(lastMatchData.foldedPlayers) 
            ? new Set(lastMatchData.foldedPlayers) 
            : lastMatchData.foldedPlayers)
        : new Set();

    const getSrcCardLocal = (card_id) => {
        if (!card_id) return null;
        const final_id_card = card_id.replace('T', '0').toUpperCase();
        try {
            return require(`../../image/card2/${final_id_card}.svg`);
        } catch (e) {
            console.error('Card not found:', final_id_card);
            return null;
        }
    };

    // Fonction pour obtenir le nom exact du joueur à partir de l'index
    const getPlayerName = (index) => {
        // Essayer différentes sources pour le nom du joueur
        if (playerNames && playerNames[index]) {
            return playerNames[index];
        }

        // Si les noms sont dans un format différent (objet avec mapping)
        if (lastMatchData?.joueurs && lastMatchData[index]) {
            return lastMatchData.playerNamesMap[index];
        }
        // Fallback
        return `Joueur ${index + 1}`;
    };

    // Filtrer les joueurs qui n'ont pas foldé et inclure leur nom exact
    const activePlayers = allCards
        .map((cards, index) => ({ 
            cards, 
            index, 
            playerName: getPlayerName(index) 
        }))
        .filter(({ cards, index }) => cards && cards.length > 0 && !foldedPlayers.has(index));

    return (
        <div className="game-history-modal-overlay" onClick={onClose}>
            <div className="game-history-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="game-history-modal-header">
                    <h2>Historique du dernier match</h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="game-history-modal-body">
                    {communityCards.length === 0 && activePlayers.length === 0 ? (
                        <div className="no-history">
                            <p>Aucune donnée disponible pour le moment.</p>
                        </div>
                    ) : (
                        <>
                            {/* Cartes communes */}
                            {communityCards.length > 0 && (
                                <div className="history-section">
                                    <h3 className="section-title">Cartes communes</h3>
                                    <div className="cards-container">
                                        {communityCards.map((card, index) => {
                                            const cardImageSrc = getSrcCard ? getSrcCard(card) : getSrcCardLocal(card);
                                            return cardImageSrc ? (
                                                <div key={index} className="card-wrapper">
                                                    <img src={cardImageSrc} alt={`Carte ${index + 1}`} className="card-image" />
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Mains des joueurs */}
                            {activePlayers.length > 0 && (
                                <div className="history-section">
                                    <h3 className="section-title">Mains des joueurs</h3>
                                    <div className="players-hands">
                                        {activePlayers.map(({ cards, index, playerName }) => {
                                            return (
                                                <div key={index} className="player-hand">
                                                    <div className="player-hand-name">{playerName}</div>
                                                    <div className="cards-container">
                                                        {cards.map((card, cardIndex) => {
                                                            const cardImageSrc = getSrcCard ? getSrcCard(card) : getSrcCardLocal(card);
                                                            return cardImageSrc ? (
                                                                <div key={cardIndex} className="card-wrapper">
                                                                    <img src={cardImageSrc} alt={`Carte ${cardIndex + 1}`} className="card-image" />
                                                                </div>
                                                            ) : null;
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameHistoryModal;

