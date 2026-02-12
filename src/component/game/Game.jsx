import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { toast, ToastContainer } from "react-toastify";
import {useNavigate} from 'react-router-dom';
import { ArrowBigLeft, History, Smile } from 'lucide-react';
import { getLastHistory } from '../../services/tableServices';

import "./Game.scss";
import rever from "../../styles/image/rever.png";
import jeton from "../../styles/image/jeton.png";
import jetonMany from "../../styles/image/jetonMany.png";
import tableTexture from "../../styles/image/vert_table.png";

import PlayerActions from './PlayerActions';
import Player from './Player';
import CommunityCards from './CommunityCards';
import Pots from './Pots';
import SoundButton from './SoundButton';
import GameHistoryModal from './GameHistoryModal';
import { onlineUsersSocket } from '../../engine/socket';

import TableTabs from './TableTabs';
import TableChat from './TableChat';
const Game = ({tableId, tableSessionIdShared, setTableSessionId, cavePlayer }) => {
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
    const [avatars, setAvatars] = useState([]);
    const tableRef = useRef(null);
    const playerRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
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
    const [hideStack, setHideStack] = useState(false)
    const [winAllIn, setWinAllIn] = useState(false)
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
    const [lastMatchHistory, setLastMatchHistory] = useState(null)

    /**
     * Plays sound
     * 
     * @param {string} type 
     * @param {bool} soundMute 
     */
    const playSound = (type, soundMute) => {
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
      
      if (!soundMute) {
        const audio = new Audio(sounds[type]);
        audio.play().catch(() => {});
      }
    }
    // Dans le composant Game, ajoutez avant le return :
    const currentUserId = sessionStorage.getItem('userId');
    
    /**
     * rand just utils function to get random number
     */
    function rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    useEffect(() => {
        const diff = community.length - communityShow.length;
        setIsRevealFinished(false);   

        if (diff <= 0){
            setIsRevealFinished(true); 
            return;
        }

        if (diff === 3){
            setCommunityShow(community);
            setTimeout(() => {
                setCommunityToShow(community);
            }, 100);
            setIsRevealFinished(true);
            return;
        }

        setIsRevealFinished(false);

        if (diff === 1) {
            setCommunityShow(community);
            setTimeout(() => {
                setCommunityToShow(community);
            }, 100);
            setIsRevealFinished(true);
            return;
        }

        const timeouts = [];
        if (diff > 1) {
            let timeindex = 0;
            for(let i = communityShow.length; i < community.length; i++) {
                const newShowCards = community.slice(0, i + 1);
                
                const timeout = setTimeout(() => {
                    console.log('Community show', newShowCards);
                    console.log(i);
                    setTimeout(() => {
                        setCommunityShow(newShowCards);
                        setTimeout(() => {
                            setCommunityToShow(prev => [...prev, newShowCards[i]]);
                        }, 100);
                    }, 500);
                    if (i + 1 === community.length) {
                        setIsRevealFinished(true);
                    }
                }, (timeindex * 1000));

                timeouts.push(timeout);
                timeindex ++;
            }
        }
        return () => {
            timeouts.forEach(t => clearTimeout(t));
        };
    }, [community]);

    useEffect(() => {
        const userId = sessionStorage.getItem('userId');
        if(!tableId) return;

        socketRef.current = io(process.env.REACT_APP_BASE_URL, {
            auth: {
                token: sessionStorage.getItem("accessToken"),
            },
        });

        socketRef.current.on('connect', () => {
            if(!tableSessionIdShared) {
                playSound('join', soundMute);
                socketRef.current.emit('joinAnyTable', { tableId, userId, playerCave });

                onlineUsersSocket.emit('joined-tables:join', { uid: parseInt(userId), tid: parseInt(tableId) });
            }else {           
                socketRef.current.emit('joinTableSession',{ tableId, tableSessionId: tableSessionIdShared, userId, playerCave });
            }
        });

        socketRef.current.on('playerActionError', (data) => {
            toast.error(data.message || "Une erreur est survenue.");
        });


        socketRef.current.on('joinError', (data) => {
            toast.error(data.message);
            onlineUsersSocket.emit('joined-tables:leave', { uid: userId, tid: tableId });
        });

        socketRef.current.on('win', (data) => {
            setGameOver(true);
            
            setGame(false);
            setCommunity(data.communityCards);
            
            setShouldShareCards(false);
            
            setWinData(data);
            
            // Sauvegarder l'historique du dernier match
            // Convertir le Set en Array pour la sérialisation
            const foldedPlayersArray = Array.from(foldedPlayers.current);
            
            setLastMatchHistory({
                communityCards: data.communityCards || [],
                allCards: data.allCards || [],
                playerNames: [],
                foldedPlayers: foldedPlayersArray
            });
            
            playSound('win', soundMute);
        });

        async function shareCardsHandler() {
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            console.log('Share cards')
            setGameOver(false);
            setWinData({});
            setCommunity([]);
            setCommunityShow([]);
            setCommunityToShow([]);
            setAllInArr([]);
            
            setShouldShareCards(true);
            setTimeout(async () => {
                setSharingCards(true);
                const playerIds = tableState.playerIds?.filter(id => id !== null);
                playSound('shareCards');
            }, 300);
        }
        socketRef.current.on('shareCards', shareCardsHandler);

        socketRef.current.on('start', () => {
            setWinData({});
            setGame(true);
            setCommunity([]);
            setCommunityShow([]);
            setAllInArr([]);
            foldedPlayers.current = new Set();

            console.log("Start");
            setShouldShareCards(false);
            setSharingCards(false);
        });

        socketRef.current.on('tableState', (data) => {
            const minBet = data?.legalActions?.chipRange?.min ?? 0;
            setBetSize(minBet);
            setTableState(data);
            setTableSessionId(data.tableId);
            
            setAvatars(data.avatars);

            if(data.communityCards.length > 0) {
                console.log(data.communityCards);
                console.log('latest comm card', latestCommCard);
                if (latestCommCard !== data.communityCards[data.communityCards.length -1]) {
                    if (data.communityCards.length === 3) {
                        setCommunityReversNb(3);
                    } else {
                        setCommunityReversNb(1);
                    }
                    setTimeout(() => {
                        setMoveCommCards(true);
                    }, 100);
                }
                setTimeout(() => {
                    setMoveCommCards(false);
                    setCommunity(data.communityCards);
                    setCommunityReversNb(0);
                    latestCommCard = data.communityCards[data.communityCards.length -1];
                }, 500);
            }

            if(data.toAct == data.seat) {
                isPossibleAction.current=true;
            }

            for(const item of (data?.actions ?? [])) {
                if(item.action === 'fold') {
                    foldedPlayers.current.add(item.playerId)
                }
            }
            
            const lastAction = data?.actions[data?.actions.length - 1];
            
            if (lastAction) {
                const playerId = lastAction?.playerId;
                const seatInfo = data?.seats[playerId];
                
                if (lastAction.action === 'raise' && seatInfo.stack === 0) {
                  playSound('allin', soundMute);
                  setAllInArr(prev => [...prev, seatInfo]);
                  return;
                }
                playSound(lastAction.action, soundMute);
            }
        });

        socketRef.current.on('quitsuccess', () => {
            onlineUsersSocket.emit('joined-tables:leave', { uid: parseInt(userId), tid: parseInt(tableId) });
            navigate('/table');
        });

        socketRef.current.on('quiterror', () => {
            quitter();
        });

        socketRef.current.on('timeerror', (data) => {
            toast.info(`Vous ne pouvez pas quitter. Temps restant : ${data.formatted}`, {
                autoClose: 10000
            });
        });


        return () => {
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableId, soundMute, winAllIn]);

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

        // Ne set que si pas déjà définis
        if (sb === -1) setSb(sbSeat);
        if (bb === -1) setBb(bbSeat);
        if (dealer === -1) setDealer(dealerSeat);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game, tableState]);

    useEffect(() => {
        setSb(-1);
        setBb(-1);
        setDealer(-1);    
    }, [game]);

    // Récupérer le dernier historique depuis l'API
    useEffect(() => {
        const fetchLastHistory = async () => {
            if (!tableId) return;
            
            try {
                const historyData = await getLastHistory(tableId);
                
                // Adapter les données de l'API au format attendu
                if (historyData) {
                    // Convertir les joueurs qui ont foldé en Array si nécessaire
                    let foldedPlayersArray = [];
                    if (historyData.foldedPlayers) {
                        foldedPlayersArray = Array.isArray(historyData.foldedPlayers) 
                            ? historyData.foldedPlayers 
                            : Array.from(historyData.foldedPlayers);
                    } else if (historyData.foldes) {
                        // Si l'API retourne 'foldes' au lieu de 'foldedPlayers'
                        foldedPlayersArray = Array.isArray(historyData.foldes) 
                            ? historyData.foldes 
                            : (typeof historyData.foldes === 'string' 
                                ? JSON.parse(historyData.foldes) 
                                : []);
                    }
                    
                    // Parser les données si elles sont en string JSON
                    let parsedAllCards = historyData.allCards || historyData.main_joueurs || [];
                    let parsedPlayerNames = historyData.playerNames || historyData.noms_joueurs || [];
                    
                    // Si les données sont en string JSON, les parser
                    if (typeof parsedAllCards === 'string') {
                        try {
                            parsedAllCards = JSON.parse(parsedAllCards);
                        } catch (e) {
                            console.error('Error parsing allCards:', e);
                        }
                    }
                    
                    if (typeof parsedPlayerNames === 'string') {
                        try {
                            parsedPlayerNames = JSON.parse(parsedPlayerNames);
                        } catch (e) {
                            console.error('Error parsing playerNames:', e);
                        }
                    }
                    
                    setLastMatchHistory({
                        communityCards: historyData.communityCards || historyData.cartes_communes || [],
                        allCards: parsedAllCards,
                        playerNames: parsedPlayerNames,
                        foldedPlayers: foldedPlayersArray,
                        // Garder aussi les données brutes au cas où le format serait différent
                        playerNamesMap: historyData.playerNamesMap || historyData.noms_joueurs_map || null
                    });
                }
            } catch (error) {
                console.error('Error fetching last history:', error);
                // En cas d'erreur, on ne fait rien (pas de données fictives)
            }
        };

        fetchLastHistory();
    }, [tableId]);

    const emitPlayerAction = (action, betSizeParam = undefined) => {
        if (!isPossibleAction.current) return;

        isPossibleAction.current = false;

        const betSizeSend = betSizeParam ? betSizeParam : betSize;
        const { min, max } = tableState.legalActions.chipRange;
        const clampedBet = Math.max(min, Math.min(betSizeSend, max));
        
        let actionTrue = action;
        socketRef.current.emit('playerAction', {
            tableId: tableId,
            tableSessionId: tableState.tableId, 
            playerSeats: tableState.seat, 
            action: actionTrue, 
            bet: clampedBet
        });
    }

    const quitter = () => {
        socketRef.current.emit("quit", {
            tableId: tableId,
            tableSessionId: tableState.tableId,
            playerSeats: tableState.seat,
        });
    };

    const getSrcCard = (card_id) => {
        const final_id_card = card_id.replace('T', 0).toUpperCase();
        return require(`../../image/card2/${final_id_card}.svg`);  
    };

    const actionLabels = {
        fold: 'Se coucher',
        check: 'Parole',
        call: 'Suivre',
    };

    const addRange = () => {
        setBetSize(Math.min((betSize + 10 ), tableState.legalActions.chipRange.max));
    }

    const minusRange = () => {
        setBetSize(Math.max((betSize - 1 ), tableState.legalActions.chipRange.min));
    }

    return (
        <div key={tableId} className="game-container">
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
            />

            <div 
                className="table"
                ref={tableRef}
                style={{
                  marginTop: 10,
                }}
            >
                <div 
                    className="table-surface"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <img 
                        src={tableTexture} 
                        alt=""
                        style={{
                            width: 'calc(408px)',
                            height: 'calc(650px)',
                            objectFit: 'contain',
                            padding: '1rem',
                            mixBlendMode: 'multiply', // Retire le blanc
                            filter: 'contrast(1.1)' // Améliore le contraste
                        
                        }}
                    />
                    
                    
                </div>
                {tableState.seats && (tableState.seats).map((chips, i) => {
                    return (
                        <Player
                            key={i}
                            i={i}
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
                        />
                    );
                })}
            </div>

            {/* {!tableState.handInProgress && ( */}
                <div 
                    className="exit" 
                    onClick={() => quitter()}
                    style={{
                      padding: '4px 8px 4px 8px', 
                      background: '#ff3030ff',
                      color: '#FFF',
                    }}
                >
                    <ArrowBigLeft size={24} style={{ marginRight: 0 }} />
                    Quitter
                </div>
            {/* )} */}

            <div
                style={{
                    position: 'absolute',
                    top: '2%',
                    right: '5%',
                    display: 'flex',
                    gap: '12px',
                    zIndex: 999,
                }}
            >
                <div style={{
                    display: 'flex'
                }}>
                    <TableTabs />
                </div>

                <SoundButton soundMute={soundMute} setSoundMute={setSoundMute} />
                
                <div 
                    className="" 
                    onClick={() => setIsHistoryModalOpen(true)}
                    style={{
                        color: '#FFD700',
                        cursor: 'pointer',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        paddingTop: 4,
                        paddingBottom: 4,
                        border: '2px solid #FFD700',
                    }}
                >
                    <History size={20} />
                    {/* <span>Historique</span> */}
                </div>
            </div>

            <GameHistoryModal 
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                lastMatchData={lastMatchHistory}
                getSrcCard={getSrcCard}
                playerNames={tableState.playerNames || []}
            />
            {/* Ajoutez le chat ici */}
                <TableChat 
                    socketRef={socketRef}
                    tableId={tableId}
                    tableState={tableState} // Ajoutez ceci
                    currentUserId={currentUserId}
                    playerNames={tableState.playerNames || []}
                />
        </div>
    );
};

export default Game;