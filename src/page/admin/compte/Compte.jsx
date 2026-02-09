import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Stack
} from '@mui/material';
import { MdCheck, MdClose, MdDeleteForever } from 'react-icons/md';
import { getCompte, updateCompte, createCompte, removeCompte } from '../../../services/envoieService';
import { toast, ToastContainer } from 'react-toastify';

const Compte = () => {
  const [nom, setNom] = useState('');
  const [numero, setNumero] = useState('');
  const [comptes, setComptes] = useState([]);

  const findCompte = async () => {
    await getCompte(setComptes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nom && numero) {
      const formData = {
        nom,
        telephone: numero,
      };
      await createCompte(formData);
      await findCompte();
      setNom('');
      setNumero('');
    } else {
      toast.error('Veuillez remplir tous les champs !');
    }
  };

  const toggleStatus = async (id, etat) => {
    await updateCompte(id, etat);
    await findCompte();
  };
  
  const remove = async (id) => {
      await removeCompte(id);
      await findCompte();
  };

  useEffect(() => {
    findCompte();
  }, []);

  return (
    <Box>
      <ToastContainer />
      <Typography variant="h4" mb={3}>Gestion des Comptes</Typography>

      {/* Formulaire ajout */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Nom"
              variant="outlined"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Numéro"
              variant="outlined"
              type='number'
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              fullWidth
              required
            />
            <Button type="submit" variant="contained" sx={{ minWidth: 120 }}>
              Ajouter
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Tableau de comptes */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#3498db' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Nom</TableCell>
              <TableCell sx={{ color: 'white' }}>Numéro</TableCell>
              <TableCell sx={{ color: 'white' }}>Statut</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(comptes) && comptes.map((compte, index) => (
              <TableRow key={index}>
                <TableCell>{compte.nom}</TableCell>
                <TableCell>{compte.telephone}</TableCell>
                <TableCell>
                  <Chip
                    label={compte.type ? 'Actif' : 'Inactif'}
                    color={compte.type ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    title="Activer"
                    onClick={() => toggleStatus(compte.id, true)}
                  >
                    <MdCheck size={20} color="green" />
                  </IconButton>
                  <IconButton
                    title="Désactiver"
                    onClick={() => toggleStatus(compte.id, false)}
                  >
                    <MdClose size={20} color="gray" />
                  </IconButton>
                  <IconButton
                    title="Supprimer"
                    onClick={() => {
                      const sure = window.confirm('Voulez vous vraiment supprimer cette ligne ?');
                      if (!sure) return;
                      remove(compte.id);
                    }}
                  >
                    <MdDeleteForever size={20} color="red" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Compte;