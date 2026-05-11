import React, { useState } from 'react';
import Nav from '../../component/nav/Nav';
import './Profile.scss';
import { updateProfile, uploadAvatar } from '../../services/authService';

const avatars = Array.from({ length: 19 }, (_, i) => `/avatars/${i}.png`);

const Profile = () => {
    const [pseudo, setPseudo] = useState(sessionStorage.getItem('userName') || '');
    const [selectedAvatar, setSelectedAvatar] = useState(sessionStorage.getItem('avatar') || '/avatars/0.png');
    const [selectedFile, setSelectedFile] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const avatarUrl = URL.createObjectURL(file);
            setSelectedAvatar(avatarUrl);
        }
    };

    const handleDefaultAvatarClick = (avatar) => {
        setSelectedAvatar(avatar);
        setSelectedFile(null);
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        const userId = sessionStorage.getItem('userId');
        try {
            let avatarUrl = selectedAvatar;
            
            // Si un fichier local est sélectionné, on l'uploade d'abord
            if (selectedFile) {
                avatarUrl = await uploadAvatar(selectedFile);
            }

            await updateProfile(userId, pseudo, avatarUrl);
            sessionStorage.setItem('userName', pseudo);
            sessionStorage.setItem('avatar', avatarUrl);
            alert('Profil mis à jour !');
            setShowModal(false);
        } catch (error) {
            console.error(error);
            alert('Erreur lors de la mise à jour.');
        } finally {
            setLoading(false);
        }
    };

    const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

    const getAvatarSrc = (avatar) => {
        if (!avatar) return '/avatars/0.png';
        if (avatar.startsWith('http') || avatar.startsWith('blob:')) return avatar;
        if (avatar.startsWith('/uploads')) return `${BASE_URL}${avatar}`;
        return avatar; // Cas pour les avatars par défaut /avatars/x.png
    };

    return (
        <div className="profile-container">
            <Nav />
            <div className="profile-content">
                <h2>Mon Profil</h2>
                <div className="profile-card">
                    <img 
                        src={getAvatarSrc(selectedAvatar)} 
                        alt="Avatar" 
                        className="profile-avatar" 
                    />
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
                        <div className="avatar-upload">
                            <label>Ajouter un avatar perso :</label>
                            <input type="file" accept="image/*" onChange={handleFileChange} />
                        </div>
                        <div className="avatar-selector" style={{ display: 'none' }}>
                            {avatars.map(avatar => (
                                <img 
                                    key={avatar} 
                                    src={avatar} 
                                    alt="Avatar" 
                                    className={selectedAvatar === avatar ? 'active' : ''}
                                    onClick={() => handleDefaultAvatarClick(avatar)}
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