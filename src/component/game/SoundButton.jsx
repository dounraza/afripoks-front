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
                paddingTop: 4,
                paddingBottom: 4,
                cursor: 'pointer',
                borderRadius: 4,
                border: '2px solid white',
            }}
            onClick={() => setSoundMute(!soundMute)}
        >
            {!soundMute ? <Volume2 size={20} /> : <VolumeOff size={20} />}
        </button>
    </div>
);

export default SoundButton;