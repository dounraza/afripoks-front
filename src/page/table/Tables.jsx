import { useContext, useEffect, useState } from "react";
import Nav from "../../component/nav/Nav";
import { useNavigate } from "react-router-dom";
import { getAll, getTablesInfos, getById } from "../../services/tableServices";
import { getSolde } from "../../services/soldeService";
import { toast, ToastContainer } from "react-toastify";
import pokerBackground from '../../image/bg.jpg'; 
import "./Tables.scss";
import { OnlineUserContext } from "../../contexts/OnlineUserContext";
import { Users, Wallet, Dices, Clock, Play } from "lucide-react";
import { JoinedTableContext } from "../../contexts/JoinedTableContext";

const Tables = () => {
    const navigate = useNavigate();
    const [tables, setTables] = useState([]);
    const [sitCounts, setSitCounts] = useState(new Map())
    const [showModalCave, setShowModalCave] = useState(false);
    const [selectedTableId, setSelectedTableId] = useState(null);
    const [cave, setCave] = useState("");
    const [solde, setSolde] = useState(0);
    const { onlineUsers } = useContext(OnlineUserContext);
    const { joinedTables } = useContext(JoinedTableContext);

    const verifyCave = async (id) => {
        const caveMin = await getById(id);

        if (cave === '') {
            navigate(`/game/${selectedTableId}`, {
                state: { cave: caveMin }
            });
        } else if (Number(cave) >= Number(caveMin)) {
            if (solde >= Number(cave)) {
                navigate(`/game/${selectedTableId}`, {
                    state: { cave }
                });
            } else {
                toast.error("Votre solde est insuffisant !");
            }
        } else if (Number(cave) < Number(caveMin)) {
            toast.error(`La cave minimale est ${caveMin.toLocaleString()} Ar`);
        }

        setShowModalCave(false);
        setSelectedTableId(null);
        setCave('');
    };

    const playGame = () => verifyCave(selectedTableId);

    // Séparer les tables actives et en attente
    const activeTables = tables.filter(table => sitCounts.get(String(table?.id)) > 0);
    const waitingTables = tables.filter(table => !sitCounts.get(String(table?.id)) || sitCounts.get(String(table?.id)) === 0);

    useEffect(() => {
        getAll(setTables, setSitCounts);
        const userId = sessionStorage.getItem('userId');
        if (userId) getSolde(userId, setSolde);
    }, []);

    return (
        <>
            <ToastContainer />
            <Nav />

            <div className="tables-container" style={{ backgroundImage: `url(${pokerBackground})` }}>
                <div className="overlay"></div>
                
                {/* Header Stats */}
                <div className="header-stats">
                    <div className="stat-item">
                        <Users size={18} />
                        <span className="stat-label">En ligne:</span>
                        <span className="stat-value">{onlineUsers.length}</span>
                    </div>
                    <div className="stat-item">
                        <Dices size={18} />
                        <span className="stat-label">Tables:</span>
                        <span className="stat-value">{joinedTables.length}</span>
                    </div>
                    <div className="stat-item wallet">
                        <Wallet size={18} />
                        <span className="stat-value">{Number(solde).toLocaleString('fr-FR')} Ar</span>
                    </div>
                </div>

                {/* Featured Table - First table with special highlight */}
                {tables.length > 0 && (
                    <div className="featured-section">
                        <div 
                            className="featured-card"
                            style={{ 
                                backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url(${pokerBackground})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            <h2 className="featured-title">{tables[0].name}</h2>
                            <div className="featured-info">
                                {(tables[0]?.cave ?? 0).toLocaleString()} Ar <span className="range-text">(SB: {(tables[0]?.smallBlind ?? 0).toLocaleString()} - BB: {(tables[0]?.bigBlind ?? 0).toLocaleString()})</span>
                            </div>
                            <button 
                                className="featured-play-btn"
                                onClick={() => {
                                    setSelectedTableId(tables[0].id);
                                    setShowModalCave(true);
                                }}
                            >
                                Jouer
                            </button>
                        </div>
                    </div>
                )}

                {/* Active Tables Section */}
                {activeTables.length > 0 && (
                    <div className="section-container">
                        <div className="section-header">
                            <h3 className="section-title">Prochains Départs <span className="live-badge">LIVE</span></h3>
                        </div>

                        <div className="active-tables-list">
                            {activeTables.slice(1).map((table, i) => (
                                <div key={i} className="active-table-item">
                                    <div className="active-table-left">
                                        <div className="table-name-small">{table.name} <span className="cave-text">({(table?.cave ?? 0).toLocaleString()} Ar/carton)</span></div>
                                        <div className="active-table-meta">
                                            <span className="meta-icon"><Users size={14} /> {sitCounts.get(String(table?.id))}</span>
                                            <span className="meta-icon"><Wallet size={14} /> {(table?.bigBlind ?? 0).toLocaleString()} Ar</span>
                                        </div>
                                    </div>
                                    <div className="active-table-right">
                                        <div className="timer-badge">
                                            <Clock size={12} />
                                            <span>00:0{i}:{30 + i * 10}</span>
                                        </div>
                                        <button 
                                            className="rejoin-btn"
                                            onClick={() => {
                                                setSelectedTableId(table.id);
                                                setShowModalCave(true);
                                            }}
                                        >
                                            Rejoindre
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Lobby Selection */}
                <div className="section-container">
                    <div className="section-header">
                        <h3 className="section-title">Sélection du LOBBY</h3>
                    </div>

                    <div className="lobby-grid">
                        {waitingTables.map((table, i) => {
                            // Collection d'images de cartes de poker uniquement
                            const pokerImages = [
                                "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=300&fit=crop&q=80", // Cartes sur table verte
                                "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300&fit=crop&q=80", // Cartes à jouer étalées
                                "https://images.unsplash.com/photo-1594996792525-d4e9ff6d8f28?w=400&h=300&fit=crop&q=80", // Quinte flush royale
                                "https://images.unsplash.com/photo-1529688499411-262f191fe29e?w=400&h=300&fit=crop&q=80", // Cartes étalées
                                "https://images.unsplash.com/photo-1603889136234-b5160d9a6fb0?w=400&h=300&fit=crop&q=80", // Cartes poker fond noir
                                "https://images.unsplash.com/photo-1628497403823-4f9e2e465bbb?w=400&h=300&fit=crop&q=80", // As de pique gros plan
                                "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop&q=80", // Cartes sur table poker
                                "https://images.unsplash.com/photo-1606502281004-f86cf1bfa1ca?w=400&h=300&fit=crop&q=80", // Full house
                                "https://images.unsplash.com/photo-1587837073080-448bc6a2329b?w=400&h=300&fit=crop&q=80", // Cartes royales
                                "https://images.unsplash.com/photo-1610241851702-445c2f7bfdaa?w=400&h=300&fit=crop&q=80", // As coeurs et piques
                                "https://images.unsplash.com/photo-1577583113753-3d6b8e37d885?w=400&h=300&fit=crop&q=80", // Brelan de rois
                                "https://images.unsplash.com/photo-1617438589126-08f30c0230a1?w=400&h=300&fit=crop&q=80", // Paire d'as
                                "https://images.unsplash.com/photo-1606502280003-946b84ad2386?w=400&h=300&fit=crop&q=80", // Cartes couleur
                                "https://images.unsplash.com/photo-1606502280456-c2c58f9df6e7?w=400&h=300&fit=crop&q=80", // Straight flush
                                "https://images.unsplash.com/photo-1606502280291-e0e16e85a803?w=400&h=300&fit=crop&q=80", // Quatre cartes
                                "https://images.unsplash.com/photo-1606503153255-59d440165935?w=400&h=300&fit=crop&q=80", // Cartes mélangées
                            ];
                            
                            return (
                                <div 
                                    key={i} 
                                    className="lobby-card"
                                >
                                    <div className="lobby-card-image">
                                        <img 
                                            src={pokerImages[i % pokerImages.length]} 
                                            alt="Poker cards"
                                            onError={(e) => {
                                                e.target.src = pokerBackground;
                                            }}
                                        />
                                        <div className="image-overlay"></div>
                                    </div>
                                    <div className="lobby-card-content">
                                        <h4 className="lobby-card-title">{table.name}</h4>
                                        <div className="lobby-card-details">
                                            <div className="detail-item">
                                                <span className="detail-label">Petite Blinde</span>
                                                <span className="detail-value">{(table?.smallBlind ?? 0).toLocaleString()} Ar</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Grosse Blinde</span>
                                                <span className="detail-value">{(table?.bigBlind ?? 0).toLocaleString()} Ar</span>
                                            </div>
                                        </div>
                                        <div className="lobby-card-info">
                                            <div className="info-chip">
                                                <Wallet size={12} />
                                                <span>{(table?.cave ?? 0).toLocaleString()} Ar</span>
                                            </div>
                                            <div className="info-chip">
                                                <Users size={12} />
                                                <span>{sitCounts.get(String(table?.id)) || 0}/9</span>
                                            </div>
                                        </div>
                                        <button 
                                            className="lobby-play-btn"
                                            onClick={() => {
                                                setSelectedTableId(table.id);
                                                setShowModalCave(true);
                                            }}
                                        >
                                            Jouer
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Modal Cave */}
                {showModalCave && (
                    <div className="modal-overlay" onClick={() => setShowModalCave(false)}>
                        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Entrez votre cave</h3>
                            </div>
                            <div className="modal-body">
                                <input
                                    type="number"
                                    value={cave}
                                    onChange={(e) => setCave(e.target.value)}
                                    placeholder="Montant en Ar"
                                    className="cave-input"
                                />
                            </div>
                            <div className="modal-actions">
                                <button className="modal-btn cancel" onClick={() => setShowModalCave(false)}>
                                    Annuler
                                </button>
                                <button className="modal-btn confirm" onClick={playGame}>
                                    Confirmer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Tables;