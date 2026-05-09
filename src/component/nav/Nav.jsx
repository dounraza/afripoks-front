import React, { useState, useEffect } from "react";
import {
    FaWallet,
    FaEye,
    FaEyeSlash,
    FaUserCircle,
    FaChevronDown
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { logout, isAuthenticated } from "../../services/authService";
import { getSolde } from "../../services/soldeService";
import logo from "../../styles/image/logo.jpeg";
import "./Nav.scss";

const Nav = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showSoldeDropdown, setShowSoldeDropdown] = useState(false);
    const [solde, setSolde] = useState("0.00");
    const [showSolde, setShowSolde] = useState(true);
    const navigate = useNavigate();
    
    const userId = sessionStorage.getItem('userId');
    const userName = sessionStorage.getItem('userName') || 'Joueur';

    useEffect(() => {
        if (userId && isAuthenticated()) {
            getSolde(userId, setSolde);
        }
    }, [userId]);

    const navigateNav = (url) => {
        navigate(url);
        setShowDropdown(false);
        setShowSoldeDropdown(false);
    };

    const handleLogout = () => {
        sessionStorage.clear();
        logout();
        navigate("/login");
    };

    return (
        <header className="header-nav-premium">
            <div className="title-logo" onClick={() => navigateNav("/acceuil")}>
                <img src="/logo192.png" alt="Logo" style={{width: '40px', height: '40px'}} />
                <div className="brand-name"><span className="white">AFRI</span><span className="yellow">POKs</span></div>
            </div>
            
            <div className="user-profile">
                {/* SECTION SOLDE */}
                <div className="user-solde-wrapper">
                    <div className="user-solde-container" onClick={() => setShowSoldeDropdown(!showSoldeDropdown)}>
                        <FaWallet className="wallet-icon" />
                        <div className="user-solde">
                            {showSolde ? `${solde} Ar` : "**** Ar"}
                        </div>
                        <div className="eye-toggle" onClick={(e) => { e.stopPropagation(); setShowSolde(!showSolde); }}>
                            {showSolde ? <FaEyeSlash /> : <FaEye />}
                        </div>
                    </div>
                    {showSoldeDropdown && (
                        <div className="dropdown-menu solde-dropdown">
                            <div onClick={() => navigateNav('/depot')}>Dépôt</div>
                            <div onClick={() => navigateNav('/retrait')}>Retrait</div>
                            <div onClick={() => navigateNav('/history')}>Historique</div>
                        </div>
                    )}
                </div>
                
                {/* SECTION AVATAR */}
                <div className="user-avatar-wrapper">
                    <div className="user-info-trigger" onClick={() => setShowDropdown(!showDropdown)}>
                        <FaUserCircle className="avatar-icon" size={36} color="#FFD700" />
                        <FaChevronDown className="chevron" color="#FFD700" size={12} />
                    </div>
                    {showDropdown && (
                        <div className="dropdown-menu avatar-dropdown">
                            <div className="user-name-display">{userName}</div>
                            <div onClick={() => navigateNav('/profile')}>Mon profil</div>
                            <div onClick={handleLogout} className="logout-item">Déconnexion</div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Nav;