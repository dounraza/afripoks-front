import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Stack,
  Chip
} from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { allHisto } from '../../../services/RetraitCryptoService';
import { Visibility } from '@mui/icons-material';

const HistoriqueMain = () => {
  const [data, setData] = useState([]);
  const [isHandModalOpen, setIsHandModalOpen] = useState(false);
  const [selectedHand, setSelectedHand] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await allHisto();
      console.log("Données reçues:", result); // Debug
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    }
  };

  const handleOpenHandModal = (item) => {
    console.log("Ouvrir modal pour:", item); // Debug
    if (item) {
      setSelectedHand(item);
      setIsHandModalOpen(true);
    } else {
      console.warn("Item est null/undefined"); // Debug
    }
  };

  const handleCloseModal = () => {
    setIsHandModalOpen(false);
    setSelectedHand(null);
  };

  const getSrcCard = (card_id) => {
        const final_id_card = card_id.replace('T', 0).toUpperCase();
        return require(`../../../image/card2/${final_id_card}.svg`);  
    };

  const renderCards = (cards) => {
  // Si cards est une string JSON, on la parse
  let cardsArray = [];
  
  if (typeof cards === 'string') {
    try {
      cardsArray = JSON.parse(cards);
    } catch (e) {
      console.error("Erreur de parsing cards:", e);
      return '—';
    }
  } else {
    cardsArray = cards;
  }

  if (!Array.isArray(cardsArray)) {
    return '—';
  }
  
  const validCards = cardsArray.filter(card => card && typeof card === 'string');
  
  if (validCards.length === 0) {
    return '—';
  }
  
  return (
    <Stack direction="row" spacing={1}>
      {validCards.map((card, index) => (
        <Avatar 
          key={index} 
          src={getSrcCard(card)} 
          variant="square"
          sx={{ width: 50, height: 70 }}
        />
      ))}
    </Stack>
  );
};

  const renderPlayerHands = () => {
  console.log(selectedHand);
  
  if (!selectedHand || !selectedHand.main_joueurs) {
    return <Typography>Aucune main de joueur disponible</Typography>;
  }

  // Parse les main_joueurs si c'est une string JSON
  let playersData = [];
  try {
    playersData = typeof selectedHand.main_joueurs === 'string' 
      ? JSON.parse(selectedHand.main_joueurs) 
      : selectedHand.main_joueurs;
  } catch (e) {
    console.error("Erreur de parsing main_joueurs:", e);
    return <Typography>Format des données invalide</Typography>;
  }

  if (!Array.isArray(playersData)) {
    return <Typography>Format des données invalide</Typography>;
  }

  // Parse aussi foldes et gagnants si nécessaire
  let foldes = [];
  let gagnants = [];
  
  try {
    foldes = typeof selectedHand.foldes === 'string' 
      ? JSON.parse(selectedHand.foldes) 
      : selectedHand.foldes || [];
      
    gagnants = typeof selectedHand.gagnants === 'string' 
      ? JSON.parse(selectedHand.gagnants) 
      : selectedHand.gagnants || [];
  } catch (e) {
    console.error("Erreur de parsing foldes/gagnants:", e);
  }

  return (
    <Box>
      {playersData.slice(playersData.length - 200).map((player, index) => {
        if (!player || typeof player !== 'object') return null;
        
        const playerCards = Array.isArray(player.cards) ? player.cards : [];
        const playerName = player.pseudo || 'Joueur inconnu';
        const isFolded = Array.isArray(foldes) && foldes.includes(playerName);
        const isWinner = Array.isArray(gagnants) && gagnants.includes(playerName);

        return (
          <Box key={index} mb={3}>
            <Typography variant="h6" gutterBottom>
              {playerName}
              {isFolded && (
                <Chip label="Fold" color="error" size="small" sx={{ ml: 1 }} />
              )}
              {isWinner && (
                <Chip label="Gagnant" color="success" size="small" sx={{ ml: 1 }} />
              )}
            </Typography>
            {renderCards(playerCards)}
          </Box>
        );
      })}
    </Box>
  );
};

  return (
    <Box>
      <ToastContainer />
      <Typography variant="h4" mb={3} color="primary">
        Historique de main joueur
      </Typography>

      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Table Name</TableCell>
              <TableCell>Carte Commune</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(data) && data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {item?.datetime 
                      ? new Date(item.datetime).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {item?.table_name || '—'}
                  </TableCell>
                  <TableCell>
                    {renderCards(item?.cartes_communaute)}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpenHandModal(item)}
                      color="primary"
                      title="Voir les mains"
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Aucune donnée disponible
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal pour afficher les mains des joueurs */}
      <Dialog 
        open={isHandModalOpen} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Détails de la main
          {selectedHand && (
            <Typography variant="subtitle2" color="text.secondary">
              {selectedHand.table_name || 'Table inconnue'} - 
              {selectedHand.datetime 
                ? new Date(selectedHand.datetime).toLocaleString() 
                : 'Date inconnue'}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedHand && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Cartes communes:
              </Typography>
              {renderCards(selectedHand.cartes_communaute)}
              
              <Typography variant="h6" gutterBottom mt={3}>
                Mains des joueurs:
              </Typography>
              {renderPlayerHands()}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HistoriqueMain;