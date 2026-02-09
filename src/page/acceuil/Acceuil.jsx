import React from 'react';
import './acceuil.scss';
import image from '../../image/bg.jpg';
import logo from '../../styles/image/logo.jpeg';
import carte from '../../image/carte.png';
import jetons from '../../image/jetons.png';
import cashGame from "../../image/cashGame.png";
import mm from "../../image/mm.png";
import crypto from "../../image/crypto.png";

import { useNavigate } from 'react-router-dom';

const Acceuil = () => {
    const navigate = useNavigate();
    
    const login = () => navigate("/login");
    const register = () => navigate("/register");

    const pokerTable = 'https://i.imgur.com/mW4FfzJ.jpg'; // Fond de table poker optionnel

    return (
        <div className='bg-acceuil' style={{ backgroundImage: `url(${image || pokerTable})` }}>
            <div className="overlay"></div>
            
            {/* Éléments décoratifs */}
            <img src={jetons} alt="jeton poker" className="deco-chip chip-1" />
            <img src={jetons} alt="jeton poker" className="deco-chip chip-2" />
            <img src={carte} alt="carte poker" className="deco-card card-1" />
            <img src={carte} alt="carte poker" className="deco-card card-2" />
            
            <div className="content-acceuil">
                <div className="header">
                    <h1 className="title">
                        <img src={logo} alt="logo AFRIPOKS" className='logo' />
                        <span>AFRIPOKS</span>
                    </h1>
                    <p className="subtitle">Le bluff est un art... Maîtrisez-le en ligne.</p>
                </div>

                <div className="main-content">
                    <div className="features">
                        <div className="feature-item">
                            <div className="icon-container">
                                <img src={cashGame} alt="Poker chips" className="feature-icon" />
                            </div>
                            <h3>Cash Game</h3>
                        </div>
                        <div className="feature-item">
                            <div className="icon-container">
                                <img src={mm} alt="Trophy" className="feature-icon" />
                            </div>
                            <h3>Mobile Money</h3>
                        </div>
                        <div className="feature-item">
                            <div className="icon-container">
                                <img src={crypto} alt="Shield" className="feature-icon" />
                            </div>
                            <h3>Crypto-monnaie</h3>
                        </div>
                    </div>

                    <div className="cta-section">
                        <div className="cta-buttons">
                            <button className="btn-primary" onClick={login}>
                                Se connecter
                            </button>
                            <button className="btn-secondary" onClick={register}>
                                s'inscrire
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Acceuil;