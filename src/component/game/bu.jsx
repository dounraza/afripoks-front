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
    0: 0, 1: 0,
    2: 90, 3: 90,
    4: 180, 5: 180,
    6: 270, 7: 270,
    8: 90,
};

const Game = ({ tableId, tableSessionIdShared, setTableSessionId, cavePlayer }) => {
    const [tableState, setTableState]             = useState({});
    const [betSize, setBetSize]                   = useState(0);
    const [winData, setWinData]                   = useState({});
    const [sb, setSb]                             = useState(-1);
    const [bb, setBb]                             = useState(-1);
    const [dealer, setDealer]                     = useState(-1);
    const [game, setGame]                         = useState(false);
    const socketRef                               = useRef(null);
    const navigate                                = useNavigate();
    const playerCave                              = cavePlayer;
    const [community, setCommunity]               = useState([]);
    const [communityShow, setCommunityShow]       = useState([]);
    const [isRevealFinished, setIsRevealFinished] = useState(false);
    const foldedPlayers                           = useRef(new Set());
    const pendingWinRef                           = useRef(null);
    const [hasPendingWin, setHasPendingWin]       = useState(false);
    const [displaySeats, setDisplaySeats]         = useState([]);
    const [showWinnerCards, setShowWinnerCards]   = useState(false);

    // ── Refs de freeze de solde ──────────────────────────────────────────────
    // frozenSeatsRef     : snapshot affiché pendant les animations
    // roundStartSeatsRef : soldes capturés AU DÉBUT de chaque main (avant toute mise)
    //                      C'est le seul snapshot utilisé pour le gel
    const frozenSeatsRef        = useRef(null);
    const roundStartSeatsRef    = useRef(null);
    const roundStartCaptured    = useRef(false); // évite d'écraser après 1er tableState
    const isAllInRef            = useRef(false);
    const allowDisplayUpdateRef = useRef(true);
    // ────────────────────────────────────────────────────────────────────────

    const isPossibleAction      = useRef(true);
    const [soundMute, setSoundMute]       = useState(false);
    const soundMuteRef                    = useRef(false);
    const [avatars, setAvatars]           = useState([]);
    const tableRef                        = useRef(null);
    const { onlineUsers }                 = useContext(OnlineUserContext);
    const [tableRotation, setTableRotation] = useState(0);
    const playerRefs = [
        useRef(null), useRef(null), useRef(null),
        useRef(null), useRef(null), useRef(null),
        useRef(null), useRef(null), useRef(null),
    ];
    const [shouldShareCards, setShouldShareCards] = useState(false);
    const [sharingCards, setSharingCards]         = useState(false);
    const [communityReversNb, setCommunityReversNb] = useState(0);
    let latestCommCard = null;
    const [moveCommCards, setMoveCommCards]     = useState(false);
    const [communityToShow, setCommunityToShow] = useState([]);
    const [allInArr, setAllInArr]               = useState([]);
    const [gameOver, setGameOver]               = useState(false);
    const [playPotAnimation, setPlayPotAnimation] = useState(false);
    const potRef                                = useRef(null);
    const [hideStack, setHideStack]             = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [lastMatchHistory, setLastMatchHistory]     = useState(null);
    const currentUserId = sessionStorage.getItem('userId');
    const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

    useEffect(() => {
        const handleResize = () => setIsLandscape(window.innerWidth > window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const orientation = (tableRotation === 90 || tableRotation === 270) ? 'horizontal' : 'vertical';

    const playSound = (type, muteOverride) => {
        const sounds = {
            fold: '/sounds/fold.mp3', raise: '/sounds/raise.mp3',
            check: '/sounds/check.mp3', call: '/sounds/call.wav',
            join: '/sounds/join.mp3', allin: '/sounds/allin.mp3',
            win: '/sounds/win.wav', shareCards: '/sounds/share-cards.mp3',
            showCard: '/sounds/show-card.wav', coinWin: '/sounds/coin-win.wav',
        };
        const muted = muteOverride !== undefined ? muteOverride : soundMuteRef.current;
        if (!muted) { const a = new Audio(sounds[type]); a.play().catch(() => {}); }
    };

    useEffect(() => {
        if (tableState.seat !== undefined && tableState.seat !== null)
            setTableRotation(SEAT_ROTATIONS[tableState.seat] ?? 0);
    }, [tableState.seat]);

    useEffect(() => { soundMuteRef.current = soundMute; }, [soundMute]);

    // ──────────────────────────────────────────────────────────────────────────
    // Révélation des cartes communes UNE PAR UNE (suspense all-in)
    // Appelé depuis socket.on('win') quand isAllInRef = true
    // ──────────────────────────────────────────────────────────────────────────
    const revealCommunityOneByOne = (cards, onDone) => {
        if (!cards || cards.length === 0) {
            setIsRevealFinished(true);
            onDone && onDone();
            return;
        }

        // Réinitialiser proprement avant de commencer
        setCommunity(cards);          // toutes les cartes connues du serveur
        setCommunityShow([]);         // affichées progressivement
        setCommunityToShow([]);
        setIsRevealFinished(false);

        let index = 0;
        const revealNext = () => {
            index++;
            const slice = cards.slice(0, index);
            setCommunityShow(slice);
            setCommunityToShow(slice);
            playSound('showCard');
            if (index < cards.length) {
                setTimeout(revealNext, 1400); // 1.4s de suspense entre chaque carte
            } else {
                // Révélation terminée → déclencher le win
                setIsRevealFinished(true);
                onDone && onDone();
            }
        };

        setTimeout(revealNext, 700); // délai avant la première carte
    };

    // ──────────────────────────────────────────────────────────────────────────
    // SOCKETS
    // ──────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        const userId   = sessionStorage.getItem('userId');
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

        // ── WIN ──────────────────────────────────────────────────────────────
        socket.on('win', (data) => {
            // Geler sur roundStartSeatsRef = soldes du DÉBUT de la main (avant toute mise)
            // C'est le seul snapshot qui reflète les vraies stacks pré-action
            frozenSeatsRef.current = roundStartSeatsRef.current
                ? JSON.parse(JSON.stringify(roundStartSeatsRef.current))
                : JSON.parse(JSON.stringify(tableState.seats || []));

            // Forcer displaySeats sur snapshot figé AVANT tout setState async
            setDisplaySeats(frozenSeatsRef.current);
            allowDisplayUpdateRef.current = false;

            setGame(false);
            setShouldShareCards(false);
            setHasPendingWin(true);
            pendingWinRef.current = data;

            const cardsToReveal = data.communityCards || [];

            if (isAllInRef.current && cardsToReveal.length > 0) {
                // All-in : révélation une par une avec suspense
                // isRevealFinished sera mis à true par revealCommunityOneByOne → useEffect win
                revealCommunityOneByOne(cardsToReveal, null);
            } else {
                // Main normale (fold/non all-in) : révélation standard
                setCommunity([]);
                setCommunityShow([]);
                setCommunityToShow([]);
                setIsRevealFinished(false);
                setTimeout(() => setCommunity(cardsToReveal), 50);
            }
        });

        // ── SHARE CARDS ───────────────────────────────────────────────────────
        socket.on('shareCards', async () => {
            setGameOver(false);
            setWinData({});
            setPlayPotAnimation(false);
            setShowWinnerCards(false);
            setHideStack(false);

            // Libérer TOUS les verrous pour la nouvelle main
            frozenSeatsRef.current        = null;
            roundStartSeatsRef.current    = null;
            roundStartCaptured.current    = false; // prêt à capturer au prochain tableState
            isAllInRef.current            = false;
            allowDisplayUpdateRef.current = true;  // ← seul endroit où on libère le verrou

            setCommunity([]);
            setCommunityShow([]);
            setCommunityToShow([]);
            setAllInArr([]);
            setShouldShareCards(true);
            setTimeout(() => { setSharingCards(true); playSound('shareCards'); }, 300);
        });

        // ── START ─────────────────────────────────────────────────────────────
        socket.on('start', () => {
            setWinData({});
            setGame(true);
            setCommunity([]);
            setCommunityShow([]);
            setAllInArr([]);
            setPlayPotAnimation(false);
            setShowWinnerCards(false);
            setHideStack(false);

            frozenSeatsRef.current        = null;
            roundStartSeatsRef.current    = null;
            roundStartCaptured.current    = false;
            isAllInRef.current            = false;
            allowDisplayUpdateRef.current = true;  // ← seul endroit où on libère le verrou

            foldedPlayers.current = new Set();
            setShouldShareCards(false);
            setSharingCards(false);
        });

        // ── TABLE STATE ───────────────────────────────────────────────────────
        socket.on('tableState', (data) => {
            const minBet = data?.legalActions?.chipRange?.min ?? 0;
            setBetSize(minBet);
            setTableState(data);
            setTableSessionId(data.tableId);
            setAvatars(data.avatars);

            // ── Capturer les soldes du début de main ─────────────────────────
            // UNE SEULE FOIS par main (roundStartCaptured = false après start/shareCards)
            // Ces soldes = stacks AVANT toute mise de la main en cours
            if (!roundStartCaptured.current && !isAllInRef.current && !hasPendingWin) {
                roundStartSeatsRef.current = JSON.parse(JSON.stringify(data.seats || []));
                roundStartCaptured.current = true;
            }

            // ── Cartes communes (mode normal, hors all-in) ───────────────────
            if (!isAllInRef.current && data.communityCards.length > 0) {
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

                // ── Détection ALL-IN ─────────────────────────────────────────
                if (lastAction.action === 'raise' && seatInfo?.stack === 0) {
                    playSound('allin');
                    isAllInRef.current            = true;
                    allowDisplayUpdateRef.current = false; // geler immédiatement

                    // Geler sur roundStartSeatsRef = soldes d'avant toutes les mises
                    frozenSeatsRef.current = roundStartSeatsRef.current
                        ? JSON.parse(JSON.stringify(roundStartSeatsRef.current))
                        : JSON.parse(JSON.stringify(data.seats || []));

                    setAllInArr(prev => [...prev, seatInfo]);
                    return; // pas de playSound doublon
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

    // ──────────────────────────────────────────────────────────────────────────
    // Révélation cartes communes — MODE NORMAL (hors all-in)
    // En all-in c'est revealCommunityOneByOne qui gère → on skip ce useEffect
    // ──────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (isAllInRef.current) return; // all-in : révélation gérée séparément

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

    // ──────────────────────────────────────────────────────────────────────────
    // Appliquer le WIN après révélation complète des cartes communes
    // ──────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isRevealFinished || !pendingWinRef.current) return;

        const data = pendingWinRef.current;

        // S'assurer que toutes les cartes sont affichées
        if (data.communityCards && data.communityCards.length > 0) {
            setCommunity(data.communityCards);
            setCommunityShow(data.communityCards);
            setCommunityToShow(data.communityCards);
        }

        setWinData(data);
        setShouldShareCards(false);
        setShowWinnerCards(true);

        const foldedPlayersArray = Array.from(foldedPlayers.current);
        setLastMatchHistory({
            communityCards: data.communityCards || [],
            allCards: data.allCards || [],
            playerNames: [],
            foldedPlayers: foldedPlayersArray
        });

        setPlayPotAnimation(false);
        setTimeout(() => {
            setGameOver(true);
            setPlayPotAnimation(true);
            playSound('win');
        }, 800);

        pendingWinRef.current = null;
        // hasPendingWin reste true → libéré dans onPotAnimationEnd
    }, [isRevealFinished]);

    // ── SB / BB / Dealer ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!game || !tableState.activeSeats) return;
        const activeSeats = tableState.activeSeats;
        const dealerSeat  = tableState.deal_btn;
        const playerCount = activeSeats.length;
        const dealerIdx   = activeSeats.indexOf(dealerSeat);
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

    // ──────────────────────────────────────────────────────────────────────────
    // SYNC displaySeats
    // Règle stricte : le solde ne se met JAMAIS à jour pendant une animation
    // ──────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        const isLocked =
            hasPendingWin            ||
            playPotAnimation         ||
            isAllInRef.current       ||
            gameOver                 ||
            !allowDisplayUpdateRef.current;

        if (isLocked) {
            if (frozenSeatsRef.current && frozenSeatsRef.current.length > 0) {
                setDisplaySeats(frozenSeatsRef.current);
            }
            return;
        }
        if (!tableState.seats) return;
        setDisplaySeats(tableState.seats);
    }, [tableState.seats, hasPendingWin, playPotAnimation, gameOver]);

    useEffect(() => {
        setSb(-1); setBb(-1); setDealer(-1);
        if (tableState.seats && allowDisplayUpdateRef.current && !hasPendingWin && !playPotAnimation) {
            frozenSeatsRef.current = null;
            setDisplaySeats(tableState.seats);
        }
    }, [game]);

    // ── Historique ────────────────────────────────────────────────────────────
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
                    let parsedAllCards    = historyData.allCards || historyData.main_joueurs || [];
                    let parsedPlayerNames = historyData.playerNames || historyData.noms_joueurs || [];
                    if (typeof parsedAllCards === 'string')    { try { parsedAllCards    = JSON.parse(parsedAllCards); }    catch (e) {} }
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

    // ── Actions joueur ────────────────────────────────────────────────────────
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

    const addRange   = () => setBetSize(Math.min(betSize + 10, tableState.legalActions.chipRange.max));
    const minusRange = () => setBetSize(Math.max(betSize - 1,  tableState.legalActions.chipRange.min));
    const toggleOrientation = () => setTableRotation(prev => prev === 0 ? 270 : 0);

    // ──────────────────────────────────────────────────────────────────────────
    // Fin animation pot
    // allowDisplayUpdateRef reste FALSE → solde figé jusqu'au prochain shareCards/start
    // ──────────────────────────────────────────────────────────────────────────
    const onPotAnimationEnd = () => {
        isAllInRef.current = false;
        setHasPendingWin(false);
        setPlayPotAnimation(false);
        setShowWinnerCards(false);
        // allowDisplayUpdateRef.current reste false intentionnellement
        // frozenSeatsRef reste intact → snapshot visible jusqu'au prochain tour
    };

    const tableReady = tableState?.seats && tableState?.playerNames && tableState?.activeSeats && tableState?.actions && tableState?.playerIds;

    return (
        <div key={tableId} className={`game-container orientation-${orientation}`}>
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
                animatePotToWinner={playPotAnimation && winData?.winStates?.some(w => w.isWinner)}
                winnerSeats={winData?.winStates?.filter(w => w.isWinner).map(w => w.seat) || []}
                playSound={playSound}
                shouldShareCards={shouldShareCards}
                onPotAnimationEnd={onPotAnimationEnd}
            />

            <div className="table" ref={tableRef} style={{ marginTop: 10 }}>
                <div
                    className="table-surface"
                    style={{ transform: `rotate(${tableRotation}deg)`, transition: 'transform 0.3s ease-in-out' }}
                >
                    <img
                        src={tableRotation === 270 ? tableTextureLandscape : tableTexture}
                        alt=""
                        style={{
                            width: '408px', height: '650px',
                            objectFit: 'contain', padding: '1rem',
                            mixBlendMode: 'multiply', filter: 'contrast(1.1)'
                        }}
                    />
                </div>

                {tableReady && (displaySeats.length > 0 ? displaySeats : tableState.seats).map((chips, i) => (
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
                        tableRotation={tableRotation}
                        currentUserId={currentUserId}
                        showWinnerCards={showWinnerCards}
                        hasPendingWin={hasPendingWin}
                        playPotAnimation={playPotAnimation}
                        communityLength={community.length}
                    />
                ))}
            </div>

            <div
                className="exit"
                onClick={() => quitter()}
                style={{ padding: '4px 8px', background: '#ff3030ff', color: '#FFF' }}
            >
                <ArrowBigLeft size={24} />
                Quitter
            </div>

            <div style={{
                position: 'absolute', top: '2%', right: '5%',
                display: 'flex', gap: '8px', zIndex: 9999, alignItems: 'center',
            }}>
                <div style={{ display: 'flex' }}><TableTabs /></div>
                <SoundButton soundMute={soundMute} setSoundMute={setSoundMute} />

                <button
                    onClick={toggleOrientation}
                    title={orientation === 'vertical' ? 'Passer en horizontal' : 'Passer en vertical'}
                    style={{
                        cursor: 'pointer', borderRadius: 4, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        width: 32, height: 32, border: '2px solid #FFD700',
                        color: '#FFD700', fontSize: 18, fontWeight: 'bold',
                        userSelect: 'none', backgroundColor: 'rgba(0,0,0,0.7)',
                        padding: 0, flexShrink: 0, outline: 'none',
                    }}
                >
                    {orientation === 'vertical' ? '⇔' : '⇕'}
                </button>

                <button
                    onClick={() => setIsHistoryModalOpen(true)}
                    style={{
                        color: '#FFD700', cursor: 'pointer', borderRadius: 4,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 32, height: 32, border: '2px solid #FFD700',
                        backgroundColor: 'rgba(0,0,0,0.7)', padding: 0,
                        outline: 'none', flexShrink: 0,
                    }}
                >
                    <History size={20} />
                </button>
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
    );
};

export default Game;