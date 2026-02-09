import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip
} from '@mui/material';
import { MdCheck, MdClose } from 'react-icons/md';
import { getTypeForAdmin, createType, updateType } from '../../../services/typeService';
import { toast, ToastContainer } from 'react-toastify';

const Type = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [adresse, setAdresse] = useState('');
  const [types, setTypes] = useState([]);

  const findType = async () => {
    await getTypeForAdmin(setTypes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name && code && adresse) {
      const formData = { name, code, adresse };
      await createType(formData);
      await findType();
      setName('');
      setCode('');
      setAdresse('');
    } else {
      toast.error("Veuillez remplir tous les champs !");
    }
  };

  const toggleStatus = async (id, etat) => {
    await updateType(id, etat);
    await findType();
  };

  useEffect(() => {
    findType();
  }, []);

  return (
    <Box>
      <ToastContainer />
      <Typography variant="h4" mb={3} color="primary">
        Gestion des Types de Crypto Money
      </Typography>

      {/* Formulaire d'ajout */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Adresse"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" sx={{ minWidth: 120 }}>
              Ajouter
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Tableau des types */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#3498db' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Nom</TableCell>
              <TableCell sx={{ color: 'white' }}>Code</TableCell>
              <TableCell sx={{ color: 'white' }}>Adresse</TableCell>
              <TableCell sx={{ color: 'white' }}>Statut</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(types) &&
              types.map((compte, index) => (
                <TableRow key={index}>
                  <TableCell>{compte.name}</TableCell>
                  <TableCell>{compte.code}</TableCell>
                  <TableCell>{compte.adresse}</TableCell>
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
                      <MdClose size={20} color="red" />
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

export default Type;
