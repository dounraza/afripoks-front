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
  TextField
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import { allSolde } from '../../../services/RetraitCryptoService';
import { updateSolde } from '../../../services/soldeService';
import { Add } from '@mui/icons-material';

const SoldePlayers = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [newSolde, setNewSolde] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const result = await allSolde();
    setData(result);
  };

  const handleOpenModal = (player) => {
    setSelectedPlayer(player);
    setNewSolde(player.montant);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlayer(null);
    setNewSolde('');
  };

  const handleUpdateSolde = async () => {
    try {
      await updateSolde(selectedPlayer.userId, parseFloat(newSolde));
      handleCloseModal();
      await fetchData();
      toast.success('Solde mis à jour avec succès !');
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du solde");
    }
  };

  return (
    <Box>
      <ToastContainer />
      <Typography variant="h4" mb={3} color="primary">
        Solde joueur
      </Typography>

      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Montant</TableCell>
              <TableCell>Pseudo</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {item.dernier 
                      ? new Date(item.dernier).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {item.montant != null 
                      ? new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.montant) + ' Ar' 
                      : '—'}
                  </TableCell>
                  <TableCell>{item.pseudo || '—'}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpenModal(item)}
                      color="primary"
                    >
                      <Add />
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

      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle>Modifier le solde</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" mb={1}>
            Joueur : <strong>{selectedPlayer?.pseudo}</strong>
          </Typography>
          <TextField
            label="Nouveau solde"
            type="number"
            onChange={(e) => setNewSolde(e.target.value)}
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Annuler
          </Button>
          <Button onClick={handleUpdateSolde} variant="contained" color="primary">
            Valider
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SoldePlayers;