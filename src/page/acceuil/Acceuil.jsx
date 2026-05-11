import React, { useState, useEffect, useMemo, useContext } from 'react';
import './acceuil.scss';
import { FaHome, FaGamepad, FaTrophy, FaPlay, FaSignInAlt } from 'react-icons/fa';
import { getAll } from '../../services/tableServices';
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import Nav from "../../component/nav/Nav";
import { JoinedTableContext } from '../../contexts/JoinedTableContext';
import tableImg1 from '../../styles/image/table/1.jpg';
import tableImg2 from '../../styles/image/table/2.jpg';
import tableImg3 from '../../styles/image/table/3.jpg';
import tableImg4 from '../../styles/image/table/4.jpg';
import tableImg5 from '../../styles/image/table/5.jpg';
import tableImg6 from '../../styles/image/table/6.png';

const Acceuil = () => {
    const { joinedTables } = useContext(JoinedTableContext);
    const [activeTab, setActiveTab] = useState('cash'); 
    const [gameFilter, setGameFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [tables, setTables] = useState([]);
    const [sitCounts, setSitCounts] = useState(new Map());
    const [showModalCave, setShowModalCave] = useState(false);
    const [selectedTableId, setSelectedTableId] = useState(null);
    const [cave, setCave] = useState("");
    const [solde, setSolde] = useState(0);
    const navigate = useNavigate();
    
    const userId = sessionStorage.getItem('userId');

    const isTableJoined = (tableId) => {
        return joinedTables.includes(parseInt(tableId));
    };

    const tableImages = useMemo(() => [
        tableImg1, tableImg2, tableImg3, tableImg4, tableImg5, tableImg6
    ], []);

    useEffect(() => {
        getAll(setTables, setSitCounts);
        if (userId) {
            import('../../services/soldeService').then(module => {
                module.getSolde(userId, setSolde);
            });
        }
    }, [userId]);

    const handleJoinClick = (tableId) => {
        setSelectedTableId(tableId);
        setShowModalCave(true);
    };

    const verifyCave = async (id) => {
        const table = tables.find(t => t.id === id);
        const caveMin = table?.cave || 0;

        if (cave === '') {
            goToTable(selectedTableId, caveMin);
        } else if (Number(cave) >= Number(caveMin)) {
            if (solde >= Number(cave)) {
                goToTable(selectedTableId, cave);
            } else {
                alert("Votre solde est insuffisant !");
                return;
            }
        } else {
            alert(`La cave minimale est ${caveMin.toLocaleString()} Ar`);
            return;
        }

        setShowModalCave(false);
        setSelectedTableId(null);
        setCave('');
    };

    const playGame = () => verifyCave(selectedTableId);

    const filteredTables = useMemo(() => {
        return tables.filter(t => {
            const matchesGame = gameFilter === 'all' || t.gameType === gameFilter;
            const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesGame && matchesSearch;
        });
    }, [tables, gameFilter, searchTerm]);

    const goToTable = (tableId, caveValue) => {
        navigate(`/game/${tableId}`, { state: { cave: caveValue } });
    };

    const renderContent = () => {
        if (activeTab === 'home') {
            return (
                <div className="welcome-section">
                    <div className="hero-banner">
                        <h1>L'expérience Poker <span className="gold-text">Premium</span></h1>
                        <p>Plongez dans l'univers du poker haut de gamme. Tables exclusives, tournois prestigieux et ambiance casino garantie.</p>
                        <button className="cta-button" onClick={() => setActiveTab('cash')}>Commencer à jouer</button>
                    </div>
                    <div className="features-grid">
                        <div className="feature-item">
                            <FaGamepad className="icon" />
                            <h3>Cash Games</h3>
                            <p>Des tables Hold'em et Omaha disponibles 24h/24 pour tous les niveaux.</p>
                        </div>
                        <div className="feature-item">
                            <FaTrophy className="icon" />
                            <h3>Tournois</h3>
                            <p>Participez à nos événements hebdomadaires et remportez des prix incroyables.</p>
                        </div>
                        <div className="feature-item">
                            <Users className="icon" />
                            <h3>Communauté</h3>
                            <p>Rejoignez des milliers de joueurs passionnés à travers toute l'Afrique.</p>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'tournaments') {
            return (
                <div className="coming-soon">
                    <FaTrophy size={80} className="gold-text" />
                    <h2>Tournois à venir</h2>
                    <p>Nous préparons des événements exceptionnels pour vous. Restez connectés !</p>
                </div>
            );
        }

        return (
            <div className="cash-section">
                <div className="filter-controls">
                    <input 
                        type="text" 
                        placeholder="Rechercher une table..." 
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="filter-nav">
                        {['all', 'holdem', 'omaha'].map(type => (
                            <button 
                                key={type} 
                                className={`tab-item ${gameFilter === type ? 'active' : ''}`} 
                                onClick={() => setGameFilter(type)}
                            >
                                {type.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="lobby-grid">
                    {filteredTables.map((table) => {
                        const joined = isTableJoined(table.id);
                        return (
                        <div key={table.id} 
                             className="lobby-card" 
                             style={{ backgroundImage: `url(${tableImages[table.id % tableImages.length]})` }}
                             onClick={() => joined ? goToTable(table.id, null) : handleJoinClick(table.id)}>
                            
                            <h4 className="lobby-card-title"><i>{table.name}</i></h4>
                            
                            <div className="play-button-container">
                                {joined ? (
                                    <button className="lobby-play-btn-circle" title="Rejoindre">
                                        <FaSignInAlt color="black" size={18} />
                                    </button>
                                ) : (
                                    <button className="lobby-play-btn-circle" title="Jouer">
                                        <FaPlay color="black" size={18} />
                                    </button>
                                )}
                            </div>

                            <div className="lobby-card-info-bottom">
                                <div className="info-row">
                                    <span className="game-type-badge">{table.gameType === 'holdem' ? "Texas Hold'em" : "Omaha"}</span>
                                    <span className="player-count"><Users size={14}/> {sitCounts.get(String(table?.id)) || 0}/9</span>
                                </div>
                                <div className="info-row main-stats">
                                    <div className="stat"><span>Cave</span> <b>{(table?.cave ?? 0).toLocaleString()} Ar</b></div>
                                    <div className="stat"><span>Blinds</span> <b>{(table?.smallBlind ?? 0).toLocaleString()} / {(table?.bigBlind ?? 0).toLocaleString()}</b></div>
                                </div>
                            </div>
                        </div>
                    )})}
                </div>
            </div>
        );
    };

    return (
        <div className='dashboard-container'>
            <Nav />

            <nav className="tabs-nav" style={{ marginTop: '80px' }}>
                <button className={`tab-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}><FaHome /> Home</button>
                <button className={`tab-item ${activeTab === 'cash' ? 'active' : ''}`} onClick={() => setActiveTab('cash')}><FaGamepad /> Cash Games</button>
                <button className={`tab-item ${activeTab === 'tournaments' ? 'active' : ''}`} onClick={() => setActiveTab('tournaments')}>
                    <FaTrophy /> Tournaments
                    <span className="new-badge">NEW</span>
                </button>
            </nav>

            <main className="main-content">
                {renderContent()}
            </main>

            {/* Modal Cave */}
            {showModalCave && (() => {
                const selectedTable = tables.find(t => t.id === selectedTableId);
                const minCave = selectedTable?.cave || 0;
                const maxCave = solde; // Limite par le solde du joueur
                
                // Si la cave n'est pas encore définie, on commence au minimum
                const currentCaveValue = cave === "" ? minCave : parseInt(cave);

                return (
                    <div className="modal-overlay" onClick={() => setShowModalCave(false)}>
                        <div className="modal-card cave-modal-premium" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-glow"></div>
                            <div className="modal-header">
                                <div className="table-icon">♠</div>
                                <h3>Rejoindre {selectedTable?.name}</h3>
                                <div className="header-divider"></div>
                            </div>
                            
                            <div className="modal-body">
                                <div className="cave-display">
                                    <span className="label">VOTRE CAVE</span>
                                    <div className="amount-wrapper">
                                        <input
                                            type="number"
                                            value={cave === "" ? minCave : cave}
                                            onChange={(e) => setCave(e.target.value)}
                                            onBlur={() => {
                                                // Optionnel : valider les bornes au focus out
                                                const val = parseInt(cave);
                                                if (val < minCave) setCave(minCave.toString());
                                                if (val > maxCave) setCave(maxCave.toString());
                                            }}
                                            className="cave-input-premium"
                                            autoFocus
                                        />
                                        <span className="currency">Ar</span>
                                    </div>
                                </div>

                                <div className="slider-container">
                                    <input 
                                        type="range" 
                                        min={minCave} 
                                        max={Math.max(minCave, maxCave)} 
                                        value={currentCaveValue}
                                        onChange={(e) => setCave(e.target.value)}
                                        className="cave-slider"
                                    />
                                    <div className="slider-labels">
                                        <span>Min: {minCave.toLocaleString()}</span>
                                        <span>Max: {maxCave.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">SOLDE DISPONIBLE</span>
                                        <span className="info-value gold">{solde.toLocaleString()} Ar</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">BLINDS</span>
                                        <span className="info-value">{selectedTable?.smallBlind}/{selectedTable?.bigBlind} Ar</span>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button className="modal-btn cancel" onClick={() => setShowModalCave(false)}>
                                    ANNULER
                                </button>
                                <button 
                                    className="modal-btn confirm-premium" 
                                    onClick={playGame}
                                    disabled={currentCaveValue < minCave || currentCaveValue > solde}
                                >
                                    C'EST PARTI !
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

export default Acceuil;