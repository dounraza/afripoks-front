import { useState, useEffect } from "react";
import {
    HandCoins,
    BanknoteArrowUp,
    BanknoteArrowDown,
    Menu,
    History,
    LogOut
} from "lucide-react";
import { useNavigate  } from "react-router-dom";
import { logout, isAuthenticated } from "../../services/authService";
import logo from "../../styles/image/logo.jpeg";
import "./Nav.scss";

const Nav = () => {
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();

    const navigateNav = (url) => {
        navigate(url);
        setShowMenu(false);
    };

    const disconnect = () => {
        if (isAuthenticated) logout();
        navigate("/login");
    };


    return (
        <div className="nav-container">
            <div className="nav-logo" onClick={() => navigateNav("/table")}>
                <img src={logo} alt="logo" />
            </div>

            <div className="nav-solde">
                {sessionStorage.getItem('userName')}
            </div>

            <div className="nav-menu">
                <Menu size={28} onClick={() => setShowMenu(!showMenu)} className="menu-icon"  style={{ "color" : "white" }} />
                {showMenu && (
                    <div className="menu-container">
                        <div className="menu-content" style={{ "color" : "white" }} onClick={() => navigateNav("/history")}>
                            <History size={20} /> Historique
                        </div>
                        <div className="menu-content" style={{ "color" : "white" }} onClick={() => navigateNav("/depot")}>
                            <BanknoteArrowDown size={20} /> Dépôt
                        </div>
                        <div className="menu-content" style={{ "color" : "white" }} onClick={() => navigateNav("/retrait")}>
                            <BanknoteArrowUp size={20} /> Retrait
                        </div>
                        <div className="menu-content logout" onClick={disconnect}>
                            <LogOut size={20} /> Déconnexion
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Nav;