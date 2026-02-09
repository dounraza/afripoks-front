import React from 'react';
import PropTypes from 'prop-types';
import TransactionTable from '../TansactionTable';
import { Box, Button, Typography, Stack } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const ContentMobileRetrait = ({ data, onBack, onRefresh }) => {
  const statusMap = {
    'completes': { label: 'Complété', color: 'success.main' },
    'en-attente': { label: 'En attente', color: 'warning.main' },
  };

  const columns = [
    { header: 'Pseudo', accessor: 'pseudo' },
    { header: 'Numéro', accessor: 'numero' },
    { header: 'Montant', accessor: 'montant',
      render: (value) => {
        if (value == null) return '—';
        return new Intl.NumberFormat('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value) + ' Ar';  // ajoute la devise Ar (à adapter)
      }
    },
    { header: 'Nom demandeur', accessor: 'nom' },
    { header: 'Date', accessor: 'createdAt',
      render: (value) => {
        if (!value) return '—'; // Gestion d'une valeur vide ou invalide
        const date = new Date(value);
        // Format jour/mois/année (exemple : 23/06/2025)
        const jour = date.getDate().toString().padStart(2, '0');
        const mois = (date.getMonth() + 1).toString().padStart(2, '0');
        const annee = date.getFullYear();

        return `${jour}/${mois}/${annee}`;
      }
    },
    {
      header: 'Statut',
      accessor: 'etat',
      render: (value) => {
        const key = value === true || value === 'completes' ? 'completes' : 'en-attente';
        const status = statusMap[key] || { label: value ?? 'N/A', color: 'text.primary' };
        return (
          <Typography
            component="span"
            sx={{ color: status.color, fontWeight: 'bold' }}
          >
            {status.label}
          </Typography>
        );
      }
    }
  ];

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBackIosNewIcon />} onClick={onBack} variant="outlined">
          Retour aux méthodes
        </Button>
        <Typography variant="body2">/</Typography>
        <Typography variant="h6">Retrait - Mobile Money</Typography>
      </Stack>

      <TransactionTable
        title="Retrait - Mobile Money"
        columns={columns}
        data={data}
        onRefresh={onRefresh}
      />
    </Box>
  );
};

ContentMobileRetrait.propTypes = {
  data: PropTypes.array.isRequired,
  onBack: PropTypes.func.isRequired,
  onRefresh: PropTypes.func
};

export default ContentMobileRetrait;
