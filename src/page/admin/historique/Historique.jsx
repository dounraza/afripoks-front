import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip
} from '@mui/material';

import {
  findAllDesc as getDepotMobile
} from '../../../services/depotMobileService';
import {
  findAllDesc as getDepotCrypto
} from '../../../services/depotCryptoService';
import {
  findAllDesc as getRetraitMobile
} from '../../../services/RetraitMobileService';
import {
  findAllDesc as getRetraitCrypto
} from '../../../services/RetraitCryptoService';

const Historique = () => {
  const [activeTab, setActiveTab] = useState('depotMobile');
  const [data, setData] = useState([]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const fetchData = async () => {
    try {
      let result = [];
      switch (activeTab) {
        case 'depotMobile':
          result = await getDepotMobile();
          break;
        case 'depotCrypto':
          result = await getDepotCrypto();
          break;
        case 'retraitMobile':
          result = await getRetraitMobile();
          break;
        case 'retraitCrypto':
          result = await getRetraitCrypto();
          break;
        default:
          result = [];
      }
      setData(result);
    } catch (error) {
      console.error('Erreur de chargement des données', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const renderChip = (item) => {
    if (item.etat === true || (parseInt(item.etat) === 1)) {
      return <Chip label="Validé" color="success" size="small" />;
    }
    if (item.createdAt === item.updatedAt) {
      return <Chip label="En attente" color="warning" size="small" />;
    }
    return <Chip label="Refusé" color="error" size="small" />;
  };

  return (
    <Box>
      <Typography variant="h4" mb={3} color="primary">
        Historique
      </Typography>

      <Paper elevation={2} sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Historique tabs"
        >
          <Tab label="Dépôt Mobile" value="depotMobile" />
          <Tab label="Dépôt Crypto" value="depotCrypto" />
          <Tab label="Retrait Mobile" value="retraitMobile" />
          <Tab label="Retrait Crypto" value="retraitCrypto" />
        </Tabs>
      </Paper>

      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Montant</TableCell>
              <TableCell>Pseudo</TableCell>
              <TableCell>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {item.createdAt 
                      ? new Date(item.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
                      : '—'}
                  </TableCell>

                  <TableCell>
                    {item.montant != null 
                      ? new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.montant) + ' Ar' 
                      : '—'}
                  </TableCell>
                  <TableCell>{item.pseudo || '—'}</TableCell>
                  <TableCell>{renderChip(item)}</TableCell>
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
    </Box>
  );
};

export default Historique;