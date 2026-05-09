import React from 'react';
import { Volume2, VolumeOff } from 'lucide-react';

const SoundButton = ({ soundMute, setSoundMute }) => (
    <div>
        <button
            style={{
                all: 'unset',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                cursor: 'pointer',
                borderRadius: 4,
                backgroundColor: 'black',
                border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
            onClick={() => setSoundMute(!soundMute)}
        >
            {!soundMute ? <Volume2 size={20} /> : <VolumeOff size={20} />}
        </button>
    </div>
);

export default SoundButton;