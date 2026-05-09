import { useEffect, useState } from "react";
import Nav from "../../component/nav/Nav";
import Game from "../../component/game/Game";
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import { getById } from "../../services/tableServices";
import { getSolde } from "../../services/soldeService";

import "./GameTable.scss";

const GameTable = () => {
    const { tableid } = useParams();
    const { tableSessionIdShared } = useParams();
    const [tableSessionId, setTableSessionId] = useState();
    const navigate = useNavigate();

    const [cavePlayer, setCavePlayer] = useState(0);
    const routeLocation = useLocation();

    useEffect(() => {
        const userId = sessionStorage.getItem('userId');
        
        const initGame = async () => {
            // 1. Vérifier le solde
            if (userId) {
                let currentSolde = 0;
                await getSolde(userId, (val) => currentSolde = val);
                if (Number(currentSolde) <= 0) {
                    toast.error("Solde insuffisant pour jouer !");
                    navigate('/acceuil');
                    return;
                }
            }

            // 2. Charger la cave
            if (routeLocation.state?.cave) {
                setCavePlayer(Number(routeLocation.state.cave));
            } else {
                try {
                    const minCave = await getById(tableid);
                    setCavePlayer(Number(minCave));
                } catch (e) {
                    toast.error("Erreur de chargement de la table.");
                }
            }
        };
        initGame();
    }, [routeLocation, tableid, navigate]);

    return (
        <>
            <ToastContainer />
            <div className="table-container" style={{ position: 'relative', minHeight: '100vh', backgroundImage: 'url("/table-bg.jpg")' }}> 
                <img src="/table-bg.jpg" alt="..." style={{ width: '100%', height: '100vh', objectFit: 'cover', position: 'absolute' }} />
                
                <div className="game-content" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
                    {cavePlayer > 0 && (
                        <Game
                        key={tableid}
                        tableId={tableid}
                        tableSessionIdShared={tableSessionIdShared}
                        setTableSessionId={setTableSessionId}
                        cavePlayer={cavePlayer}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default GameTable;