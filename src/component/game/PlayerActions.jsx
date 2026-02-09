import React from 'react';
import { Plus, Minus, Smile } from 'lucide-react';

const actionLabels = {
    fold: 'Se coucher',
    check: 'Parole',
    call: 'Suivre',
};

const PlayerActions = ({
    tableState, betSize, setBetSize, emitPlayerAction, addRange, minusRange
}) => {
    if (!tableState.handInProgress || tableState.toAct !== tableState.seat) return null;
    return (
        <div className="player-action-container">
            <div className="action-container">
                {tableState.legalActions.actions.map((action) => (
                    (action !== 'raise' && action !== 'bet') ? (
                        <div key={action} className="gold-button" onClick={() => emitPlayerAction(action)}>
                            {actionLabels[action] || action.charAt(0).toUpperCase() + action.slice(1)}
                        </div>
                    ) : null
                ))}
                {(tableState.legalActions.actions.includes('raise') || tableState.legalActions.actions.includes('bet')) && (
                    <div className="gold-button" onClick={() => emitPlayerAction('raise', Number(tableState.legalActions.chipRange.max))}>
                        Tapis
                    </div>
                )}
            </div>
            {(tableState.legalActions.actions.includes('raise') || tableState.legalActions.actions.includes('bet')) && (
                <div className="input-group">
                    <div className="input gold-button">
                        <div className="" onClick={minusRange}><Minus /></div>
                        <input
                            type="number"
                            min={tableState.legalActions.chipRange.min}
                            max={tableState.legalActions.chipRange.max}
                            value={betSize}
                            onChange={(e) => setBetSize(Number(e.target.value))}
                        />
                        <div className="" onClick={addRange}><Plus /></div>
                    </div>
                    <div className="gold-button" onClick={() => emitPlayerAction('raise')}>Miser / Relancer</div>
                </div>
            )}
        </div>
    );
};

export default PlayerActions;