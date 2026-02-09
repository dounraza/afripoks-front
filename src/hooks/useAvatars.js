import { useState, useEffect } from 'react';

const useAvatars = () => {
    let avatars = []
    
    for (let i = 0; i < 11; i++) {
      avatars.push(`/avatars/${i}.png`);
    }
    
    return avatars;
}

export default useAvatars;