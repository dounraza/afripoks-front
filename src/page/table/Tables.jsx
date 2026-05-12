// src/pages/Tables/Tables.jsx
import { useContext, useEffect, useState, useRef } from "react";
import Nav from "../../component/nav/Nav";
import { useNavigate, useLocation } from "react-router-dom";
import { getAll, getById } from "../../services/tableServices";
import { getSolde } from "../../services/soldeService";
import { getConnectedUsers } from "../../services/api";
import { toast, ToastContainer } from "react-toastify";
import pokerBackground from '../../image/bg.jpg';
import "./Tables.scss";
import { OnlineUserContext } from "../../contexts/OnlineUserContext";
import { Users, Wallet, Dices, Clock, RotateCcw, RefreshCw } from "lucide-react";
import { JoinedTableContext } from "../../contexts/JoinedTableContext";
import PokerCardImage from '../../component/PockerCardImage';

const Tables = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [tables, setTables] = useState([]);
    const [sitCounts, setSitCounts] = useState(new Map());
    const [showModalCave, setShowModalCave] = useState(false);
    const [selectedTableId, setSelectedTableId] = useState(null);
    const [cave, setCave] = useState("");
    const [solde, setSolde] = useState(0);
    const [loading, setLoading] = useState(true);
    const isNavigatingRef = useRef(false);
    
    // ✅ ÉTATS POUR LES STATS DE CONNEXION
    const [tableUsersCount, setTableUsersCount] = useState({});

    const [lastTableId, setLastTableId] = useState(() => {
        const saved = sessionStorage.getItem('lastTableId');
        return saved ? Number(saved) : null;
    });

    const { onlineUsers } = useContext(OnlineUserContext);
    const { joinedTables } = useContext(JoinedTableContext);
    
    useEffect(() => {
        console.log("Tables.jsx [joinedTables updated]:", joinedTables);
    }, [joinedTables]);
    
    // ✅ Utiliser la longueur du contexte OnlineUserContext au lieu du hook
    const connectedCount = onlineUsers?.length || 0;

    const loadData = async () => {
        setLoading(true);
        try {
            console.log('📥 [Tables] Début du chargement des données');
            
            console.log('📥 [Tables] Appel getAll...');
            await getAll(setTables, setSitCounts);
            console.log('✅ [Tables] getAll terminé');
            
            const userId = sessionStorage.getItem('userId');
            if (userId) {
                console.log('📥 [Tables] Appel getSolde pour userId:', userId);
                // await getSolde(userId, setSolde);
                await getSolde(userId, setSolde);
                console.log('✅ [Tables] getSolde terminé');
            }
            
            console.log('✅ [Tables] Tous les chargements terminés!');
        } catch (error) {
            console.error('❌ [Tables] Erreur chargement:', error);
            toast.error("Erreur lors du chargement des tables");
        } finally {
            console.log('🏁 [Tables] setLoading(false)');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isNavigatingRef.current) {
            loadData();
        }
        isNavigatingRef.current = false;
    }, [location.key]);

    useEffect(() => {
        const handleFocus = () => {
            if (!isNavigatingRef.current) {
                loadData();
            }
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    // ✅ Émettre "join_table" quand l'utilisateur navigue vers une table
    const goToTable = (tableId, caveValue, isRejoin = false) => {
        const userId = sessionStorage.getItem('userId');
        const username = sessionStorage.getItem('userName');
        
        // Note: Le socket gérant les utilisateurs connectés est dans useConnectedUsers
        console.log('📤 Navigation vers table:', { tableId, userId, username });

        isNavigatingRef.current = true;
        sessionStorage.setItem('lastTableId', String(tableId));
        setLastTableId(tableId);
        navigate(`/game/${tableId}`, { state: { cave: caveValue, isRejoin } });
    };

    const verifyCave = async (id) => {
        const caveMin = await getById(id);

        if (cave === '') {
            goToTable(selectedTableId, caveMin);
        } else if (Number(cave) >= Number(caveMin)) {
            if (solde >= Number(cave)) {
                goToTable(selectedTableId, cave);
            } else {
                toast.error("Votre solde est insuffisant !");
                return;
            }
        } else {
            toast.error(`La cave minimale est ${caveMin.toLocaleString()} Ar`);
            return;
        }

        setShowModalCave(false);
        setSelectedTableId(null);
        setCave('');
    };

    const playGame = () => verifyCave(selectedTableId);

    const lastTable = lastTableId
        ? tables.find(t => Number(t.id) === Number(lastTableId))
        : null;

    const waitingTables = tables.filter(t => Number(t.id) !== Number(lastTableId));

    const pokerImages = [
        "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=300&fit=crop&q=80",
        "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300&fit=crop&q=80",
        "https://images.unsplash.com/photo-1594996792525-d4e9ff6d8f28?w=400&h=300&fit=crop&q=80",
        "https://images.unsplash.com/photo-1529688499411-262f191fe29e?w=400&h=300&fit=crop&q=80",
        "https://images.unsplash.com/photo-1603889136234-b5160d9a6fb0?w=400&h=300&fit=crop&q=80",
        "https://images.unsplash.com/photo-1628497403823-4f9e2e465bbb?w=400&h=300&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop&q=80",
        "https://images.unsplash.com/photo-1606502281004-f86cf1bfa1ca?w=400&h=300&fit=crop&q=80",
        "https://images.unsplash.com/photo-1587837073080-448bc6a2329b?w=400&h=300&fit=crop&q=80",
        "https://images.unsplash.com/photo-1610241851702-445c2f7bfdaa?w=400&h=300&fit=crop&q=80",
        "https://images.unsplash.com/photo-1577583113753-3d6b8e37d885?w=400&h=300&fit=crop&q=80",
        "https://images.unsplash.com/photo-1617438589126-08f30c0230a1?w=400&h=300&fit=crop&q=80",
        "https://images.unsplash.com/photo-1606502280003-946b84ad2386?w=400&h=300&fit=crop&q=80",
        "https://images.unsplash.com/photo-1606502280456-c2c58f9df6e7?w=400&h=300&fit=crop&q=80",
        "https://images.unsplash.com/photo-1606502280291-e0e16e85a803?w=400&h=300&fit=crop&q=80",
        "https://images.unsplash.com/photo-1606503153255-59d440165935?w=400&h=300&fit=crop&q=80",
    ];

    return (
        <>
            <ToastContainer />
            <Nav />

            <div className="tables-container" style={{ backgroundImage: `url(${pokerBackground})` }}>
                <div className="overlay"></div>

                {/* ✅ Header Stats avec le compteur */}
                <div className="header-stats">
                    <div className="stat-item">
                        <Users size={18} />
                        <span className="stat-label">En ligne:</span>
                        <span className="stat-value" style={{ 
                            color: connectedCount > 0 ? '#4CAF50' : '#999',
                            fontWeight: 'bold'
                        }}>
                            {connectedCount}
                        </span>
                    </div>
                    <div className="stat-item">
                        <Dices size={18} />
                        <span className="stat-label">Tables:</span>
                        <span className="stat-value">{joinedTables?.length || 0}</span>
                    </div>
                    <div className="stat-item wallet">
                        <Wallet size={18} />
                        <span className="stat-value">{Number(solde).toLocaleString('fr-FR')} Ar</span>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Chargement des tables...</p>
                    </div>
                ) : (
                    <>
                        {lastTable && (
                            <div className="section-container rejoin-section">
                                <div className="section-header">
                                    <h3 className="section-title">
                                        <RotateCcw size={16} />
                                        &nbsp;Reprendre la partie
                                    </h3>
                                </div>

                                <div className="rejoin-banner">
                                    <div className="rejoin-banner-left">
                                        <div className="rejoin-table-name">{lastTable.name}</div>
                                        <div className="rejoin-meta">
                                            <span><Users size={13} /> {sitCounts.get(String(lastTable.id)) || 0} joueurs</span>
                                            <span>SB {(lastTable?.smallBlind ?? 0).toLocaleString()} / BB {(lastTable?.bigBlind ?? 0).toLocaleString()} Ar</span>
                                            <span><Wallet size={13} /> {(lastTable?.cave ?? 0).toLocaleString()} Ar</span>
                                        </div>
                                    </div>
                                    <div className="rejoin-banner-right">
                                        <button
                                            className="rejoin-main-btn"
                                            onClick={() => {
                                                const isRejoin = joinedTables.includes(parseInt(lastTable.id));
                                                if (isRejoin) {
                                                    goToTable(lastTable.id, null, true);
                                                } else {
                                                    setSelectedTableId(lastTable.id);
                                                    setShowModalCave(true);
                                                }
                                            }}
                                        >
                                            <RotateCcw size={15} />
                                            Rejoindre
                                        </button>
                                        <button
                                            className="rejoin-dismiss-btn"
                                            onClick={() => {
                                                sessionStorage.removeItem('lastTableId');
                                                setLastTableId(null);
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="section-container">
                            <div className="section-header">
                                <h3 className="section-title">Sélection du LOBBY</h3>
                            </div>
                        </div>

                        {tables.length > 0 && (
                            <div className="featured-section">
                                <div
                                    className="featured-card"
                                    style={{
                                        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url(${pokerImages[0]})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                >
                                    <h2 className="featured-title">{tables[0].name}</h2>
                                    <div className="featured-info">
                                        {(tables[0]?.cave ?? 0).toLocaleString()} Ar{" "}
                                        <span className="range-text">
                                            (SB: {(tables[0]?.smallBlind ?? 0).toLocaleString()} - BB: {(tables[0]?.bigBlind ?? 0).toLocaleString()})
                                        </span>
                                    </div>
                                    <button
                                        className="featured-play-btn"
                                        onClick={() => {
                                            const isRejoin = joinedTables.includes(parseInt(tables[0].id));
                                            if (isRejoin) {
                                                goToTable(tables[0].id, null, true);
                                            } else {
                                                setSelectedTableId(tables[0].id);
                                                setShowModalCave(true);
                                            }
                                        }}
                                    >
                                        {joinedTables.includes(parseInt(tables[0].id)) ? 'Rejoindre' : 'Jouer'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="section-container">
                            <div className="lobby-grid">
                                {waitingTables.map((table, i) => (
                                    <div key={i} className="lobby-card">
                                        <div className="lobby-card-image">
                                            <PokerCardImage
                                                index={i}
                                                src={pokerImages[i % pokerImages.length]}
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
                                                    <span>
                                                        {tableUsersCount[table.id] || sitCounts.get(String(table?.id)) || 0}/9
                                                    </span>
                                                </div>
                                            </div>
                                            {joinedTables.includes(parseInt(table.id)) ? (
                                                <button
                                                    className="lobby-play-btn"
                                                    style={{ backgroundColor: '#4CAF50' }}
                                                    onClick={() => goToTable(table.id, null, true)}
                                                >
                                                    Rejoindre
                                                </button>
                                            ) : (
                                                <button
                                                    className="lobby-play-btn"
                                                    onClick={() => {
                                                        setSelectedTableId(table.id);
                                                        setShowModalCave(true);
                                                    }}
                                                >
                                                    Jouer
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

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