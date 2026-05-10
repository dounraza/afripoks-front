import React, { useState } from 'react';
import Nav from '../../component/nav/Nav';
import './Profile.scss';
import { updateProfile } from '../../services/authService';

const avatars = Array.from({ length: 19 }, (_, i) => `/avatars/${i}.png`);

const Profile = () => {
    const [pseudo, setPseudo] = useState(sessionStorage.getItem('userName') || '');
    const [selectedAvatar, setSelectedAvatar] = useState(sessionStorage.getItem('avatar') || '/avatars/0.png');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async () => {
        setLoading(true);
        const userId = sessionStorage.getItem('userId');
        try {
            await updateProfile(userId, pseudo, selectedAvatar);
            sessionStorage.setItem('userName', pseudo);
            sessionStorage.setItem('avatar', selectedAvatar);
            alert('Profil mis à jour !');
            setShowModal(false);
        } catch (error) {
            alert('Erreur lors de la mise à jour.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <Nav />
            <div className="profile-content">
                <h2>Mon Profil</h2>
                <div className="profile-card">
                    <img src={selectedAvatar} alt="Avatar" className="profile-avatar" />
                    <div className="profile-info">
                        <h3>{pseudo}</h3>
                        <button className="edit-btn" onClick={() => setShowModal(true)}>Modifier Profil</button>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="profile-modal">
                        <h3>Modifier Profil</h3>
                        <input 
                            type="text" 
                            value={pseudo} 
                            onChange={(e) => setPseudo(e.target.value)} 
                            placeholder="Nouveau pseudo"
                        />
                        <div className="avatar-selector">
                            {avatars.map(avatar => (
                                <img 
                                    key={avatar} 
                                    src={avatar} 
                                    alt="Avatar" 
                                    className={selectedAvatar === avatar ? 'active' : ''}
                                    onClick={() => setSelectedAvatar(avatar)}
                                />
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowModal(false)} disabled={loading}>Annuler</button>
                            <button className="confirm-btn" onClick={handleUpdateProfile} disabled={loading}>
                                {loading ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;