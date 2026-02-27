import React, { useEffect, useRef, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { toast, ToastContainer } from "react-toastify";
import {useNavigate} from 'react-router-dom';
import { ArrowBigLeft, History } from 'lucide-react';
import { getLastHistory } from '../../services/tableServices';
import { OnlineUserContext } from '../../contexts/OnlineUserContext';

import "./Game.scss";
import rever from "../../styles/image/rever.png";
import jeton from "../../styles/image/jeton.png";
import jetonMany from "../../styles/image/jetonMany.png";
import tableTexture from "../../styles/image/table_vert_p.png";
import tableTextureLandscape from "../../styles/image/vert_led.png";
import PlayerActions from './PlayerActions';
import Player from './Player';
import CommunityCards from './CommunityCards';
import Pots from './Pots';
import SoundButton from './SoundButton';
import GameHistoryModal from './GameHistoryModal';
import { onlineUsersSocket } from '../../engine/socket';
import TableTabs from './TableTabs';
import TableChat from './TableChat';

const SEAT_ROTATIONS = {
    0: 0, 1: 0, 2: 90, 3: 90, 4: 180,
    5: 180, 6: 270, 7: 270, 8: 90,
};

const BOTTOM_SEAT = 0;

const Game = ({ tableId, tableSessionIdShared, setTableSessionId, cavePlayer }) => {
    const [tableState, setTableState] = useState({});
    const [betSize, setBetSize] = useState(0);
    const [winData, setWinData] = useState({});
    const [sb, setSb] = useState(-1);
    const [bb, setBb] = useState(-1);
    const [dealer, setDealer] = useState(-1);
    const [game, setGame] = useState(false);
    const socketRef = useRef(null);
    const navigate = useNavigate();
    const playerCave = cavePlayer;
    const [community, setCommunity] = useState([]);
    const [communityShow, setCommunityShow] = useState([]);
    const [isRevealFinished, setIsRevealFinished] = useState(false);
    const foldedPlayers = useRef(new Set());
    const isPossibleAction = useRef(true);
    const [soundMute, setSoundMute] = useState(false);
    const soundMuteRef = useRef(false);
    const [avatars, setAvatars] = useState([]);
    const tableRef = useRef(null);
    const { onlineUsers } = useContext(OnlineUserContext);
    const [tableRotation, setTableRotation] = useState(0);
    const playerRefs = [
        useRef(null), useRef(null), useRef(null),
        useRef(null), useRef(null), useRef(null),
        useRef(null), useRef(null), useRef(null),
    ];
    const [shouldShareCards, setShouldShareCards] = useState(false);
    const [sharingCards, setSharingCards] = useState(false);
    const [communityReversNb, setCommunityReversNb] = useState(0);
    let latestCommCard = null;
    const [moveCommCards, setMoveCommCards] = useState(false);
    const [communityToShow, setCommunityToShow] = useState([]);
    const [allInArr, setAllInArr] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const potRef = useRef(null);
    const [hideStack, setHideStack] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [lastMatchHistory, setLastMatchHistory] = useState(null);

    const currentUserId = sessionStorage.getItem('userId');
    const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

    useEffect(() => {
        const handleResize = () => setIsLandscape(window.innerWidth > window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const orientation = (tableRotation === 90 || tableRotation === 270) ? 'horizontal' : 'vertical';

    const mySeat = tableState.seat;
    const totalSeats = tableState.seats?.length ?? 9;

    const getRealSeat = (visualSeat) => (mySeat + visualSeat - BOTTOM_SEAT + totalSeats) % totalSeats;
    const getVisualSeat = (realSeat) => (realSeat - mySeat + BOTTOM_SEAT + totalSeats) % totalSeats;

    const playSound = (type, muteOverride) => {
        const sounds = {
            fold: '/sounds/fold.mp3',
            raise: '/sounds/raise.mp3',
            check: '/sounds/check.mp3',
            call: '/sounds/call.wav',
            join: '/sounds/join.mp3',
            allin: '/sounds/allin.mp3',
            win: '/sounds/win.wav',
            shareCards: '/sounds/share-cards.mp3',
            showCard: '/sounds/show-card.wav',
            coinWin: '/sounds/coin-win.wav',
        };
        const muted = muteOverride !== undefined ? muteOverride : soundMuteRef.current;
        if (!muted) {
            const audio = new Audio(sounds[type]);
            audio.play().catch(() => {});
        }
    };

    useEffect(() => {
        if (tableState.seat !== undefined && tableState.seat !== null) {
            const rotation = SEAT_ROTATIONS[tableState.seat] ?? 0;
            setTableRotation(rotation);
        }
    }, [tableState.seat]);

    useEffect(() => { soundMuteRef.current = soundMute; }, [soundMute]);

    useEffect(() => {
        const userId = sessionStorage.getItem('userId');
        const username = sessionStorage.getItem('userName');
        if (!tableId) return;

        const socket = io(process.env.REACT_APP_BASE_URL, {
            auth: { token: sessionStorage.getItem("accessToken") },
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join_table', { tableId, userId, username });
            if (!tableSessionIdShared) {
                playSound('join');
                socket.emit('joinAnyTable', { tableId, userId, playerCave });
                onlineUsersSocket.emit('joined-tables:join', { uid: parseInt(userId), tid: parseInt(tableId) });
            } else {
                socket.emit('joinTableSession', { tableId, tableSessionId: tableSessionIdShared, userId, playerCave });
            }
        });

        socket.on('playerActionError', (data) => toast.error(data.message || "Une erreur est survenue."));
        socket.on('joinError', (data) => {
            toast.error(data.message);
            onlineUsersSocket.emit('joined-tables:leave', { uid: userId, tid: tableId });
        });

        socket.on('win', (data) => {
            setGameOver(true);
            setGame(false);
            setCommunity(data.communityCards);
            setShouldShareCards(false);
            setWinData(data);
            const foldedPlayersArray = Array.from(foldedPlayers.current);
            setLastMatchHistory({
                communityCards: data.communityCards || [],
                allCards: data.allCards || [],
                playerNames: [],
                foldedPlayers: foldedPlayersArray
            });
            playSound('win');
        });

        socket.on('shareCards', async () => {
            setGameOver(false);
            setWinData({});
            setCommunity([]);
            setCommunityShow([]);
            setCommunityToShow([]);
            setAllInArr([]);
            setHideStack(false);
            foldedPlayers.current = new Set();
            setShouldShareCards(true);
            setTimeout(() => { setSharingCards(true); playSound('shareCards'); }, 300);
        });

        socket.on('start', () => {
            setWinData({});
            setGame(true);
            setCommunity([]);
            setCommunityShow([]);
            setAllInArr([]);
            setHideStack(false);
            foldedPlayers.current = new Set();
            setShouldShareCards(false);
            setSharingCards(false);
        });

        socket.on('tableState', (data) => {
            const minBet = data?.legalActions?.chipRange?.min ?? 0;
            setBetSize(minBet);
            setTableState(data);
            setTableSessionId(data.tableId);
            setAvatars(data.avatars);

            if (data.communityCards.length > 0) {
                if (latestCommCard !== data.communityCards[data.communityCards.length - 1]) {
                    setCommunityReversNb(data.communityCards.length === 3 ? 3 : 1);
                    setTimeout(() => setMoveCommCards(true), 100);
                }
                setTimeout(() => {
                    setMoveCommCards(false);
                    setCommunity(data.communityCards);
                    setCommunityReversNb(0);
                    latestCommCard = data.communityCards[data.communityCards.length - 1];
                }, 500);
            }

            if (data.toAct == data.seat) isPossibleAction.current = true;

            for (const item of (data?.actions ?? [])) {
                if (item.action === 'fold') foldedPlayers.current.add(item.playerId);
            }

            const lastAction = data?.actions[data?.actions.length - 1];
            if (lastAction) {
                const seatInfo = data?.seats[lastAction?.playerId];
                if (lastAction.action === 'raise' && seatInfo?.stack === 0) {
                    playSound('allin');
                    setHideStack(true);
                    setAllInArr(prev => [...prev, seatInfo]);
                    return;
                }
                playSound(lastAction.action);
            }
        });

        socket.on('quitsuccess', () => {
            onlineUsersSocket.emit('joined-tables:leave', { uid: parseInt(userId), tid: parseInt(tableId) });
            navigate('/table');
        });
        socket.on('quiterror', () => quitter());
        socket.on('timeerror', (data) => {
            toast.info(`Vous ne pouvez pas quitter. Temps restant : ${data.formatted}`, { autoClose: 10000 });
        });

        return () => {
            socket.emit('leave_table', { tableId, userId });
            socket.disconnect();
            socketRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableId]);

    useEffect(() => {
        if (community.length > 0) setHideStack(true);
    }, [community.length]);

    useEffect(() => {
        const diff = community.length - communityShow.length;
        setIsRevealFinished(false);
        if (diff <= 0) { setIsRevealFinished(true); return; }
        if (diff === 3 || diff === 1) {
            setCommunityShow(community);
            setTimeout(() => setCommunityToShow(community), 100);
            setIsRevealFinished(true);
            return;
        }
        const timeouts = [];
        let timeindex = 0;
        for (let i = communityShow.length; i < community.length; i++) {
            const newShowCards = community.slice(0, i + 1);
            const timeout = setTimeout(() => {
                setTimeout(() => {
                    setCommunityShow(newShowCards);
                    setTimeout(() => setCommunityToShow(prev => [...prev, newShowCards[i]]), 100);
                }, 500);
                if (i + 1 === community.length) setIsRevealFinished(true);
            }, timeindex * 1000);
            timeouts.push(timeout);
            timeindex++;
        }
        return () => timeouts.forEach(t => clearTimeout(t));
    }, [community]);

    useEffect(() => {
        if (!game || !tableState.activeSeats) return;
        const activeSeats = tableState.activeSeats;
        const dealerSeat = tableState.deal_btn;
        const playerCount = activeSeats.length;
        const dealerIdx = activeSeats.indexOf(dealerSeat);
        if (dealerIdx === -1) return;
        let sbSeat, bbSeat;
        if (playerCount === 2) {
            sbSeat = dealerSeat;
            bbSeat = activeSeats[(dealerIdx + 1) % playerCount];
        } else {
            sbSeat = activeSeats[(dealerIdx + 1) % playerCount];
            bbSeat = activeSeats[(dealerIdx + 2) % playerCount];
        }
        if (sb === -1) setSb(sbSeat);
        if (bb === -1) setBb(bbSeat);
        if (dealer === -1) setDealer(dealerSeat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game, tableState]);

    useEffect(() => { setSb(-1); setBb(-1); setDealer(-1); }, [game]);

    useEffect(() => {
        const fetchLastHistory = async () => {
            if (!tableId) return;
            try {
                const historyData = await getLastHistory(tableId);
                if (historyData) {
                    let foldedPlayersArray = [];
                    if (historyData.foldedPlayers) {
                        foldedPlayersArray = Array.isArray(historyData.foldedPlayers)
                            ? historyData.foldedPlayers : Array.from(historyData.foldedPlayers);
                    } else if (historyData.foldes) {
                        foldedPlayersArray = Array.isArray(historyData.foldes)
                            ? historyData.foldes
                            : (typeof historyData.foldes === 'string' ? JSON.parse(historyData.foldes) : []);
                    }
                    let parsedAllCards = historyData.allCards || historyData.main_joueurs || [];
                    let parsedPlayerNames = historyData.playerNames || historyData.noms_joueurs || [];
                    if (typeof parsedAllCards === 'string') { try { parsedAllCards = JSON.parse(parsedAllCards); } catch (e) {} }
                    if (typeof parsedPlayerNames === 'string') { try { parsedPlayerNames = JSON.parse(parsedPlayerNames); } catch (e) {} }
                    setLastMatchHistory({
                        communityCards: historyData.communityCards || historyData.cartes_communes || [],
                        allCards: parsedAllCards,
                        playerNames: parsedPlayerNames,
                        foldedPlayers: foldedPlayersArray,
                        playerNamesMap: historyData.playerNamesMap || historyData.noms_joueurs_map || null
                    });
                }
            } catch (error) {
                console.error('Error fetching last history:', error);
            }
        };
        fetchLastHistory();
    }, [tableId]);

    const emitPlayerAction = (action, betSizeParam = undefined) => {
        if (!isPossibleAction.current) return;
        isPossibleAction.current = false;
        const betSizeSend = betSizeParam ?? betSize;
        const { min, max } = tableState.legalActions.chipRange;
        const clampedBet = Math.max(min, Math.min(betSizeSend, max));
        socketRef.current.emit('playerAction', {
            tableId,
            tableSessionId: tableState.tableId,
            playerSeats: tableState.seat,
            action,
            bet: clampedBet
        });
    };

    const quitter = () => {
        socketRef.current.emit("quit", {
            tableId,
            tableSessionId: tableState.tableId,
            playerSeats: tableState.seat,
        });
    };

    const getSrcCard = (card_id) => {
        const final_id_card = card_id.replace('T', 0).toUpperCase();
        return require(`../../image/card2/${final_id_card}.svg`);
    };

    const addRange = () => setBetSize(Math.min(betSize + 10, tableState.legalActions.chipRange.max));
    const minusRange = () => setBetSize(Math.max(betSize - 1, tableState.legalActions.chipRange.min));

    const toggleOrientation = () => setTableRotation(prev => prev === 0 ? 270 : 0);

    const tableReady = tableState?.seats && tableState?.playerNames && tableState?.activeSeats && tableState?.actions && tableState?.playerIds;
  //modification

    return (
        <div
            className="game-wrapper"
            style={{
                width: '100',
                minHeight: '100vh',
                height: 'auto',
                backgroundColor: '#000',
                backgroundImage: `url(${!isLandscape ? '/table-bg-mobile.jpg' : '/table-bg.jpg'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                overflowX: 'hidden',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                margin: 0,
                padding: 0,
            }}
        >
            {/* ✅ BARRE DU HAUT — directement dans game-wrapper, PAS dans game-container
                Ainsi overflow:hidden du game-container ne la coupe plus jamais */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                padding: '6px 10px',
                background: 'rgba(0,0,0,0.85)',
                boxSizing: 'border-box',
                minHeight: '46px',
            }}>
                {/* Bouton Quitter */}
                <button
                    onClick={() => quitter()}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 12px',
                        background: 'linear-gradient(135deg, #cc0000, #ff4444)',
                        color: '#FFF',
                        border: '2px solid #ff6666',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                        outline: 'none',
                        flexShrink: 0,
                    }}
                >
                    <ArrowBigLeft size={16} />
                    Quitter
                </button>

                {/* Boutons droite */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex' }}><TableTabs /></div>
                    <SoundButton soundMute={soundMute} setSoundMute={setSoundMute} />
                    {/* <button
                        onClick={toggleOrientation}
                        title={orientation === 'vertical' ? 'Passer en horizontal' : 'Passer en vertical'}
                        style={{
                            cursor: 'pointer',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            border: '2px solid #FFD700',
                            color: '#FFD700',
                            fontSize: 18,
                            fontWeight: 'bold',
                            userSelect: 'none',
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            padding: 0,
                            flexShrink: 0,
                            outline: 'none',
                        }}
                    >
                        {orientation === 'vertical' ? '⇔' : '⇕'}
                    </button> */}
                    <button
                        onClick={() => setIsHistoryModalOpen(true)}
                        style={{
                            color: '#FFD700',
                            cursor: 'pointer',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            border: '2px solid #FFD700',
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            padding: 0,
                            outline: 'none',
                            flexShrink: 0,
                        }}
                    >
                        <History size={20} />
                    </button>
                </div>
            </div>

            {/* game-container avec paddingTop pour ne pas être caché sous la barre fixe */}
            <div key={tableId} className={`game-container orientation-${orientation}`} style={{ paddingTop: '50px' }}>
                <ToastContainer />

                {tableState.handInProgress && tableState.toAct === tableState.seat && (
                    <PlayerActions
                        tableState={tableState}
                        betSize={betSize}
                        setBetSize={setBetSize}
                        emitPlayerAction={emitPlayerAction}
                        addRange={addRange}
                        minusRange={minusRange}
                    />
                )}

                <CommunityCards
                    key={tableId}
                    community={community}
                    communityShow={communityShow}
                    communityToShow={communityToShow}
                    communityReversNb={communityReversNb}
                    moveCommCards={moveCommCards}
                    gameOver={gameOver}
                    allInArr={allInArr}
                    winData={winData}
                    getSrcCard={getSrcCard}
                    playSound={playSound}
                    soundMute={soundMute}
                    isRevealFinished={isRevealFinished}
                    tableId={tableId}
                />

                <Pots
                    tableState={tableState}
                    jetonMany={jetonMany}
                    jeton={jeton}
                    potRef={potRef}
                    playerRefs={playerRefs}
                    animatePotToWinner={isRevealFinished && winData?.winStates?.some(w => w.isWinner)}
                    winnerSeats={winData?.winStates?.filter(w => w.isWinner).map(w => w.seat) || []}
                    playSound={playSound}
                    shouldShareCards={shouldShareCards}
                    getVisualSeat={getVisualSeat}
                    onPotAnimationEnd={() => { setTimeout(() => setHideStack(false), 50); }}
                />

                <div className="table" ref={tableRef} style={{ marginTop: 10 }}>
                    <div
                        className="table-surface"
                        style={{
                            transform: `rotate(${tableRotation}deg)`,
                            transition: 'transform 0.3s ease-in-out',
                        }}
                    >
                        <img
                            src={tableRotation === 0 ? tableTexture : tableRotation === 270 ? tableTextureLandscape : tableTexture}
                            alt=""
                            style={{
                                width: '408px',
                                height: '650px',
                                objectFit: 'contain',
                                padding: '1rem',
                                mixBlendMode: 'multiply',
                                filter: 'contrast(1.1)'
                            }}
                        />
                    </div>

                    {tableReady && Array.from({ length: totalSeats }).map((_, visualSeat) => {
                        const realSeat = getRealSeat(visualSeat);
                        const chips = tableState.seats[realSeat];
                        return (
                            <Player
                                key={visualSeat}
                                i={realSeat}
                                visualSeat={visualSeat}
                                chips={chips}
                                tableState={tableState}
                                winData={winData}
                                sb={sb}
                                bb={bb}
                                dealer={dealer}
                                avatars={avatars}
                                playerRefs={playerRefs}
                                tableRef={tableRef}
                                getSrcCard={getSrcCard}
                                rever={rever}
                                foldedPlayers={foldedPlayers}
                                shouldShareCards={shouldShareCards}
                                sharingCards={sharingCards}
                                allInArr={allInArr}
                                isRevealFinished={isRevealFinished}
                                gameOver={gameOver}
                                hideStack={hideStack}
                                tableId={tableId}
                                tableRotation={tableRotation}
                                currentUserId={currentUserId}
                            />
                        );
                    })}
                </div>

                <GameHistoryModal
                    isOpen={isHistoryModalOpen}
                    onClose={() => setIsHistoryModalOpen(false)}
                    lastMatchData={lastMatchHistory}
                    getSrcCard={getSrcCard}
                    playerNames={tableState.playerNames || []}
                />

                <TableChat
                    socketRef={socketRef}
                    tableId={tableId}
                    tableState={tableState}
                    currentUserId={currentUserId}
                    playerNames={tableState.playerNames || []}
                />
            </div>
        </div>
    );
};

export default Game;