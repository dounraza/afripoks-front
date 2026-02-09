import { useEffect, useState } from "react";
import Nav from "../../component/nav/Nav";
import Game from "../../component/game/Game";
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import {useLocation} from 'react-router-dom';

import "./GameTable.scss";

const GameTable = () => {
    const { tableid } = useParams();
    const { tableSessionIdShared } = useParams();
    const [tableSessionId, setTableSessionId] = useState();

    const [cavePlayer, setCavePlayer] = useState(0);
        const routeLocation = useLocation();
        useEffect(() => {
            if (routeLocation.state?.cave) {
                setCavePlayer(Number(routeLocation.state.cave));
            }
        }, [routeLocation]);

    const handleCopy = () => {
        navigator.clipboard.writeText(tableSessionId)
            .then(() => {
                toast.success("ID session copiée !");
            })
            .catch(() => {
                toast.error("Erreur lors de la copie :");
            });
    };

    return (
        <>
            <ToastContainer />
             
            <div className="table-container" 
               style={{ 
                   position: 'relative',
                   minHeight: window.innerHeight,
                   height: '45rem',
                   backgroundImage: 'url("/table-bg.jpg")'
               }} 
            > 
                <img src="/table-bg.jpg" alt="..." 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }} 
                />
                
                {/* Overlay vert sur la table */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(26, 77, 46, 0.85) 0%, rgba(45, 95, 63, 0.85) 50%, rgba(26, 77, 46, 0.85) 100%)',
                    mixBlendMode: 'multiply',
                    pointerEvents: 'none'
                }} />
                
                <div className="game-content"
                   style={{
                     position: 'absolute',
                     top: 0,
                     bottom: 0,
                     left: 0,
                     right: 0,
                   }}
                >
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