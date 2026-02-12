import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Minimize2 } from 'lucide-react';
import './TableChat.scss';

const TableChat = ({ socketRef, tableId, tableState, currentUserId, playerNames }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Auto-scroll vers le bas
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // ✅ FIX : Le username vient directement du serveur (résolu via pokerTables)
    // On garde resolveUsername uniquement comme fallback pour l'historique
    const resolveUsername = (data) => {
        // Priorité 1 : username envoyé directement par le serveur
        if (data.username && data.username !== 'Inconnu') {
            return { username: data.username, foundSeat: data.seat ?? -1 };
        }

        // Priorité 2 : chercher via tableState
        let username = data.username || 'Anonyme';
        let foundSeat = data.seat !== undefined ? data.seat : -1;

        if (data.userId && tableState) {
            if (tableState.seats) {
                const seatIndex = tableState.seats.findIndex(seat => seat?.playerId === data.userId);
                if (seatIndex !== -1 && tableState.playerNames) {
                    username = tableState.playerNames[seatIndex] || username;
                    foundSeat = seatIndex;
                }
            }
            if (username === 'Anonyme' && tableState.playerIds) {
                const seatIndex = tableState.playerIds.findIndex(id => id === data.userId);
                if (seatIndex !== -1 && tableState.playerNames) {
                    username = tableState.playerNames[seatIndex] || username;
                    foundSeat = seatIndex;
                }
            }
        }
        
        return { username, foundSeat };
    };

    // Écouter l'historique des messages (reçu après joinAnyTable)
    useEffect(() => {
        if (!socketRef?.current) return;

        const handleChatHistory = (data) => {
            console.log('📚 Historique de chat reçu:', data);
            if (data.messages && Array.isArray(data.messages)) {
                const formattedMessages = data.messages.map((msg, index) => {
                    const { username, foundSeat } = resolveUsername(msg);
                    return {
                        id: `history-${index}-${msg.timestamp}`,
                        userId: msg.userId,
                        username: username,
                        message: msg.message,
                        timestamp: new Date(msg.timestamp),
                        seat: foundSeat,
                    };
                });
                console.log('✅ Messages formatés:', formattedMessages);
                setMessages(formattedMessages);
            }
        };

        socketRef.current.on('chatHistory', handleChatHistory);
        return () => { socketRef.current?.off('chatHistory', handleChatHistory); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socketRef, tableState]);

    // Écouter les nouveaux messages en temps réel
    useEffect(() => {
        if (!socketRef?.current) return;

        const handleChatMessage = (data) => {
            console.log('📨 Message reçu du serveur:', data);
            
            // ✅ FIX : Le serveur envoie maintenant username directement
            // resolveUsername sert de fallback
            const { username, foundSeat } = resolveUsername(data);
            console.log('👤 Username final:', username, '| Seat:', foundSeat);

            const newMessage = {
                id: `${Date.now()}-${Math.random()}`,
                userId: data.userId,
                username: username,
                message: data.message,
                timestamp: new Date(data.timestamp || Date.now()),
                seat: foundSeat,
            };

            setMessages(prev => [...prev, newMessage]);

            if (!isOpen || isMinimized) {
                setUnreadCount(prev => prev + 1);
            }
        };

        socketRef.current.on('chatMessage', handleChatMessage);
        return () => { socketRef.current?.off('chatMessage', handleChatMessage); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socketRef, isOpen, isMinimized, tableState]);

    // Envoyer un message
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !socketRef?.current) return;

        socketRef.current.emit('sendChatMessage', {
            tableId: tableId,
            tableSessionId: tableState?.tableId,
            message: inputMessage.trim(),
        });

        setInputMessage('');
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setUnreadCount(0);
            setIsMinimized(false);
        }
    };

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
        if (isMinimized) {
            setUnreadCount(0);
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <>
            {/* Bouton flottant pour ouvrir le chat */}
            {!isOpen && (
                <div className="chat-toggle-button" onClick={toggleChat}>
                    <MessageCircle size={24} />
                    {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount}</span>
                    )}
                </div>
            )}

            {/* Fenêtre de chat */}
            {isOpen && (
                <div className={`chat-container ${isMinimized ? 'minimized' : ''}`}>
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-title">
                            <MessageCircle size={18} />
                            <span>Chat entre Joueurs</span>
                            {unreadCount > 0 && isMinimized && (
                                <span className="unread-badge-header">{unreadCount}</span>
                            )}
                        </div>
                        <div className="chat-controls">
                            <button onClick={toggleMinimize} className="chat-control-btn">
                                <Minimize2 size={16} />
                            </button>
                            <button onClick={toggleChat} className="chat-control-btn">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    {!isMinimized && (
                        <>
                            <div className="chat-messages" ref={chatContainerRef}>
                                {messages.length === 0 ? (
                                    <div className="chat-empty">
                                        <MessageCircle size={32} opacity={0.3} />
                                        <p>Aucun message pour le moment</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isOwnMessage = String(msg.userId) === String(currentUserId);
                                        return (
                                            <div 
                                                key={msg.id} 
                                                className={`chat-message ${isOwnMessage ? 'own-message' : ''}`}
                                            >
                                                <div className="message-header">
                                                    <span className="message-username">
                                                        {msg.username}
                                                    </span>
                                                    <span className="message-time">
                                                        {formatTime(msg.timestamp)}
                                                    </span>
                                                </div>
                                                <div className="message-content">
                                                    {msg.message}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form className="chat-input-form" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Tapez votre message..."
                                    maxLength={200}
                                    className="chat-input"
                                />
                                <button 
                                    type="submit" 
                                    className="chat-send-button"
                                    disabled={!inputMessage.trim()}
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default TableChat;