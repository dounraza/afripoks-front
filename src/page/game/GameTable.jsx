import { useEffect, useState } from "react";
import Nav from "../../component/nav/Nav";
import Game from "../../component/game/Game";
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import { useLocation } from 'react-router-dom';

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
            .then(() => toast.success("ID session copiée !"))
            .catch(() => toast.error("Erreur lors de la copie :"));
    };

    return (
        <>
            <ToastContainer />

            <div
                className="table-container"
                style={{
                    backgroundImage: `url(${process.env.PUBLIC_URL}/table-bg.jpg)`,
                }}
            >
                <div className="game-content">
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