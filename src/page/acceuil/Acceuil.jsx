import React, { useState, useEffect, useMemo } from 'react';
import './acceuil.scss';
import { FaHome, FaGamepad, FaTrophy, FaPlay } from 'react-icons/fa';
import { getAll } from '../../services/tableServices';
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import Nav from "../../component/nav/Nav";

const Acceuil = () => {
    const [activeTab, setActiveTab] = useState('cash'); 
    const [gameFilter, setGameFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [tables, setTables] = useState([]);
    const [sitCounts, setSitCounts] = useState(new Map());
    const [showCaveModal, setShowCaveModal] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [caveAmount, setCaveAmount] = useState(0);
    const navigate = useNavigate();
    
    const userId = sessionStorage.getItem('userId');

    const openCaveModal = (table) => {
        setSelectedTable(table);
        setCaveAmount(table.cave || 0);
        setShowCaveModal(true);
    };

    const confirmJoinTable = () => {
        if (selectedTable) {
            const amount = Number(caveAmount);
            if (amount < selectedTable.cave) {
                alert(`Le montant minimum requis est de ${selectedTable.cave.toLocaleString()} Ar.`);
                return;
            }
            navigate(`/game/${selectedTable.id}?cave=${amount}`);
            setShowCaveModal(false);
        }
    };

    const tableImages = [
        "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400",
        "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400",
        "https://images.unsplash.com/photo-1594996792525-d4e9ff6d8f28?w=400"
    ];

    useEffect(() => {
        getAll(setTables, setSitCounts);
    }, [userId]);

    const filteredTables = useMemo(() => {
        return tables.filter(t => {
            const matchesGame = gameFilter === 'all' || t.gameType === gameFilter;
            const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesGame && matchesSearch;
        });
    }, [tables, gameFilter, searchTerm]);

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
                    {filteredTables.map((table) => (
                        <div key={table.id} className="lobby-card" style={{ backgroundImage: `url(${tableImages[table.id % tableImages.length]})` }}>
                            <h4 className="lobby-card-title">{table.name}</h4>
                            
                            <div className="play-button-container">
                                <button className="lobby-play-btn-circle" onClick={() => openCaveModal(table)}>
                                    <FaPlay color="black" size={18} />
                                </button>
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
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className='dashboard-container'>
            <Nav />

            {showCaveModal && (
                <div className="modal-overlay">
                    <div className="cave-modal">
                        <h3>Sélectionnez votre cave</h3>
                        <p>Table: {selectedTable?.name}</p>
                        <input 
                            type="number" 
                            value={caveAmount} 
                            onChange={(e) => setCaveAmount(e.target.value)}
                        />
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowCaveModal(false)}>Annuler</button>
                            <button className="confirm-btn" onClick={confirmJoinTable}>Rejoindre</button>
                        </div>
                    </div>
                </div>
            )}

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
        </div>
    );
}

export default Acceuil;