# Vérification du Process de Gel de Solde

## Timeline d'Exécution

### **ÉTAPE 1 : All-in Detected (T+0ms) - ✅ À VÉRIFIER**

**Moment :** Serveur détecte raise avec stack = 0

**Actions qui se font :**
```javascript
// Dans tableState handler
preActionSeatsRef.current = JSON.parse(JSON.stringify(data.seats)) // Balance AVANT all-in
isAllInRef.current = true  // Queue tous les freezes
frozenSeatsRef.current = preActionSeatsRef.current  // Gèle balance ancien
```

**État du solde gagnant :**
- ❌ `displaySeats` = prendre la balance du preActionSeatsRef (ancien) 
- ✅ `displaySeats` est sync via useEffect parce que isAllInRef.current = true
- **Résultat attendu :** Ancien solde VISIBLE sur le gagnant

**Vérification :** 
- [ ] Solde du gagnant reste l'ancien solde (pas le nouveau)
- [ ] Pas d'update affichée

---

### **ÉTAPE 2 : Win Event Arrives (T+50ms environ) - ✅ À VÉRIFIER**

**Actions :**
```javascript
socket.on('win', (data) => {
    frozenSeatsRef.current = lastStableSeatsRef.current || preActionSeatsRef
    setDisplaySeats(frozenSeatsRef.current)  // ← Gèle displaySeats IMMÉDIATEMENT
    setHasPendingWin(true)                   // ← Freeze supplémentaire
    // Cartes se révèlent pendant 3-5 secondes
})
```

**État du solde gagnant :**
- ✅ `displaySeats` = ancien solde (gelé)
- ✅ `hasPendingWin` = true
- ✅ Cards révélées, cartes du gagnant affichées
- **Résultat attendu :** Ancien solde + cartes gagnantes VISIBLES

**Vérification :**
- [ ] Cartes se révèlent progressivement
- [ ] Ancien solde DE GAGNANT resto VISIBLE ET N'AFFICHE PAS LE NOUVEAU
- [ ] Pas de flash du nouveau solde

---

### **ÉTAPE 3 : Animation Jetons et Appel onPotAnimationEnd (T+1000-1050ms)**

**Timeline animation :**
```
T+800ms  : setPlayPotAnimation(true)
T+820ms  : Animation jetons commence (setAnimate(true))
T+1520ms : Animation jetons finit (0.7s ease-in-out)
T+2000ms : Dans Pots.jsx, setTimeout(..., 1000) → onPotAnimationEnd() appelée
```

**Actions dans onPotAnimationEnd :**
```javascript
const onPotAnimationEnd = () => {
    allowDisplayUpdateRef.current = false  // 🔒 LOCK complet - no sync after this
    frozenSeatsRef.current = null
    isAllInRef.current = false
    setHasPendingWin(false)                // React batches ces state updates
    setPlayPotAnimation(false)
    
    // À ce moment React re-render avec:
    // - hasPendingWin=false, playPotAnimation=false, isAllInRef=false
    // - MAIS allowDisplayUpdateRef.current = false
    // - DONC useEffect displaySeats voit: !allowDisplayUpdateRef.current=true → RETURN
    // - displaySeats ne change pas (reste ancien solde)
    
    setTimeout(() => {
        setDisplaySeats(JSON.parse(JSON.stringify(tableState.seats)))  // → NOUVEAU SOLDE
        allowDisplayUpdateRef.current = true  // Re-allow syncing
    }, 50);
}
```

**État du solde gagnant :**
- ✅ Animation jetons joue (ancien solde TOUJOURS visible behind)
- ✅ Après animation, ancien solde reste 50ms
- ✅ PUIS nouveau solde s'affiche (mise à jour + 50ms)
- **Résultat attendu :** Ancien solde → animation → nouveau solde

**Vérification :**
- [ ] Animation jetons démarre et court jusqu'au bout (1000ms)
- [ ] Ancien solde VIS SEIBLE pendant l'animation
- [ ] Après animation : délai imperceptible (50ms)
- [ ] Nouveau solde s'affiche avec le GAIN
- [ ] Aucun moment où le nouveau solde apparaît avant la fin de l'animation

---

## Cas Edge à Vérifier

### Cas 1 : Si tableState arrive PENDANT l'animation
**À T+900ms, server envoie tableState avec nouveau solde**
- useEffect condition: `if (hasPendingWin || playPotAnimation || isAllInRef.current || !allowDisplayUpdateRef.current)`
- À T+900ms: playPotAnimation=true → condition=true → RETURN (pas de sync)
- ✅ Ancien solde reste visible

### Cas 2 : Si tableState arrive APRÈS animation fin mais AVANT setTimeout 50ms
**À T+2020ms, server envoie tableState avec nouveau solde**
- allowDisplayUpdateRef.current = false
- useEffect condition: !allowDisplayUpdateRef.current = true → RETURN
- ✅ Ancien solde conservé jusqu'au setTimeout

### Cas 3 : Si le serveur ne renvoie jamais les nouveaux soldes
**tableState.seats n'a pas de nouvelles données à T+2050ms**
- setDisplaySeats(tableState.seats) affichera les anciennes valeurs
- ❌ **PROBLÈME POTENTIEL** - à tester avec le serveur

---

## Résumé de Protection Triple

| Moment | Freeze 1 | Freeze 2 | Freeze 3 | Résultat |
|--------|----------|----------|----------|----------|
| **All-in** | `isAllInRef.current=true` | - | - | Ancien solde affiché |
| **Reveal** | `isAllInRef.current=true` | `hasPendingWin=true` | - | Ancien solde visible |
| **Animation** | `isAllInRef.current=true` | `hasPendingWin=true` | `playPotAnimation=true` | Ancien solde gelé |
| **Après animation** | `allowDisplayUpdateRef=false` | - | - | Ancien solde 50ms |
| **Nouveau solde** | `allowDisplayUpdateRef=true` | - | - | Nouveau solde affiché |

---

## ✅ À Tester

1. **Jouez un all-in**
2. **Observez le solde du gagnant :**
   - [ ] Reste l'ancien solde TOUT pendant la révélation
   - [ ] Reste l'ancien solde TOUT pendant l'animation jetons
   - [ ] Change vers le nouveau solde SEULEMENT après animation
   - [ ] Pas même 1ms d'affichage du nouveau solde trop tôt

3. **Si nouveau solde s'affiche TROP TÔT :**
   - Vérifier que tableState arrive avec retard du serveur
   - Vérifier que le freeze flag `allowDisplayUpdateRef` fonctionne
   - Peut être besoin d'augmenter le timeout (50ms → 100ms)
