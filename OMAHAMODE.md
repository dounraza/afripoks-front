# Implémentation du Mode Omaha (Front-end)

Ce document détaille les étapes d'intégration du mode Omaha dans l'interface de jeu existante, en assurant une isolation totale du mode Texas Hold'em.

## 1. Architecture des composants
L'objectif est d'utiliser une approche par composants adaptatifs :

*   **Wrapper `TableGame` :** Le composant principal détecte `tableState.gameType`.
*   **Composants spécialisés :** 
    *   Ne pas modifier `PlayerHand.jsx`.
    *   Créer `PlayerHandOmaha.jsx` pour gérer l'affichage des **4 cartes**.
*   **Switching conditionnel :**
    ```jsx
    {tableState.gameType === 'omaha' ? (
        <PlayerHandOmaha cards={player.cards} />
    ) : (
        <PlayerHandHoldem cards={player.cards} />
    )}
    ```

## 2. Spécifications pour `PlayerHandOmaha.jsx`
*   **Affichage :** Le conteneur doit supporter 4 slots de cartes au lieu de 2.
*   **Style :** Prévoir un léger chevauchement ou un espacement réduit pour que les 4 cartes restent lisibles sur mobile.
*   **Données :** Le backend enverra un tableau de 4 chaînes (ex: `['Ac', 'Kd', 'Th', '2s']`).

## 3. Gestion du Showdown (Résultats)
*   La logique de calcul des mains gagnantes diffère. 
*   **Attention :** Assurez-vous que le composant de résultat (`ResultDisplay`) accepte les 4 cartes pour la comparaison des mains.
*   Le serveur gère le `solveOmahaHand`, le front doit simplement afficher le résultat final (la main qualifiée).

## 4. Points de vigilance (Non-Régression Holdem)
1.  **CSS :** Ne pas appliquer de styles globaux sur `.card` qui pourraient déformer l'affichage des cartes Hold'em. Utiliser des classes spécifiques : `.card-omaha` vs `.card-holdem`.
2.  **State :** Vérifier que la réception des cartes (`playerCards`) dans `tableState` est bien traitée comme un tableau, qu'il soit de taille 2 (Holdem) ou 4 (Omaha).
3.  **Actions :** Les boutons d'action (Fold/Call/Raise) restent identiques, les règles de mise étant les mêmes entre les deux variantes.

## 5. Checklist d'implémentation
- [ ] Créer `PlayerHandOmaha.jsx` en reprenant les assets du composant actuel.
- [ ] Implémenter le switch dans `TableGame.jsx`.
- [ ] Vérifier l'affichage des 4 cartes avec les données mockées.
- [ ] Valider avec le backend que `tableState.playerCards` contient bien 4 éléments en mode Omaha.
