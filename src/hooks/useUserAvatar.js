import { useState, useEffect } from 'react';
import { getUserAvatar, getFullAvatarUrl } from '../services/api';

const useUserAvatar = (userId) => {
    // Initialisation avec le cache pour éviter le clignotement
    const [avatarUrl, setAvatarUrl] = useState(() => {
        if (!userId) return null;
        const cached = sessionStorage.getItem(`avatar_${userId}`);
        return cached ? getFullAvatarUrl(cached) : null;
    });
    const [loading, setLoading] = useState(!avatarUrl);

    useEffect(() => {
        const fetchAvatar = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const data = await getUserAvatar(userId);
                if (data.success && data.avatar_url) {
                    const fullUrl = getFullAvatarUrl(data.avatar_url);
                    setAvatarUrl(fullUrl);
                    // On met à jour le cache pour les prochains composants/chargements
                    sessionStorage.setItem(`avatar_${userId}`, data.avatar_url);
                } else if (!avatarUrl) {
                    setAvatarUrl('/avatars/0.png');
                }
            } catch (error) {
                console.error("Erreur hook useUserAvatar:", error);
                if (!avatarUrl) setAvatarUrl('/avatars/0.png');
            } finally {
                setLoading(false);
            }
        };

        fetchAvatar();
    }, [userId]);

    return { avatarUrl, loading };
};

export default useUserAvatar;
