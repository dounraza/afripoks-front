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
                <div 
                    key={action} 
                    className={`poker-button ${
                        action === 'fold' ? 'button-green' : 
                        action === 'check' ? 'button-teal' : 
                        action === 'call' ? 'button-green' :
                        'button-teal'
                    }`}
                    onClick={() => emitPlayerAction(action)}
                >
                    {actionLabels[action] || action.charAt(0).toUpperCase() + action.slice(1)}
                </div>
            ) : null
        ))}
        {(tableState.legalActions.actions.includes('raise') || tableState.legalActions.actions.includes('bet')) && (
            <div className="poker-button button-red" onClick={() => emitPlayerAction('raise', Number(tableState.legalActions.chipRange.max))}>
                Tapis
            </div>
        )}
    </div>
    {(tableState.legalActions.actions.includes('raise') || tableState.legalActions.actions.includes('bet')) && (
        <div className="input-group">
            <div className="bet-input-container">
                <div className="bet-control button-minus" onClick={minusRange}>
                    <Minus />
                </div>
                <div className="bet-amount">
                    {betSize}
                </div>
                <div className="bet-control button-plus" onClick={addRange}>
                    <Plus />
                </div>
            </div>
            <div className="poker-button button-teal" onClick={() => emitPlayerAction('raise')}>Miser / Relancer</div>
        </div>
    )}
</div>
        
    );
};

export default PlayerActions;