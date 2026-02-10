// PokerCardImage.jsx
// Composant autonome — affiche toujours une image de carte poker
// sans dépendance réseau (SVG inline + gradient CSS)

const CARD_THEMES = [
    { bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", card: "♠", color: "#c084fc", label: "Spades" },
    { bg: "linear-gradient(135deg, #1c1c1c 0%, #2d1515 100%)", card: "♥", color: "#f87171", label: "Hearts" },
    { bg: "linear-gradient(135deg, #0f2027 0%, #203a43 100%)", card: "♣", color: "#4ade80", label: "Clubs"  },
    { bg: "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)", card: "♦", color: "#fbbf24", label: "Diamonds" },
    { bg: "linear-gradient(135deg, #000000 0%, #434343 100%)", card: "A", color: "#e2e8f0", label: "Ace"   },
    { bg: "linear-gradient(135deg, #360033 0%, #0b8793 100%)", card: "K", color: "#fde68a", label: "King"  },
    { bg: "linear-gradient(135deg, #1a1a1a 0%, #4a1942 100%)", card: "Q", color: "#f9a8d4", label: "Queen" },
    { bg: "linear-gradient(135deg, #0d0d0d 0%, #1a3a1a 100%)", card: "J", color: "#86efac", label: "Jack"  },
];

const PokerCardImage = ({ index, src, fallback }) => {
    const theme = CARD_THEMES[index % CARD_THEMES.length];

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                background: theme.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Cercles décoratifs en arrière-plan */}
            <div style={{
                position: "absolute",
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                border: `2px solid ${theme.color}22`,
                top: "-20px",
                right: "-20px",
            }} />
            <div style={{
                position: "absolute",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                border: `2px solid ${theme.color}22`,
                bottom: "-10px",
                left: "-10px",
            }} />

            {/* Carte centrale */}
            <div style={{
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${theme.color}44`,
                borderRadius: "10px",
                width: "60px",
                height: "80px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 20px ${theme.color}33`,
                gap: "2px",
            }}>
                <span style={{
                    fontSize: "28px",
                    color: theme.color,
                    lineHeight: 1,
                    fontFamily: "serif",
                    filter: `drop-shadow(0 0 6px ${theme.color}88)`,
                }}>
                    {theme.card}
                </span>
            </div>

            {/* Overlay image réelle si disponible */}
            {src && (
                <img
                    src={src}
                    alt="Poker cards"
                    onError={(e) => { e.target.style.display = 'none'; }} // ← cache l'img si erreur, le fond reste visible
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        opacity: 0.85,
                    }}
                />
            )}
        </div>
    );
};

export default PokerCardImage;