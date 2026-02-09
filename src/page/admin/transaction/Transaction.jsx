// 🎯 Objectif : refactorer tous les composants pour utiliser Material UI
// 📦 Packages requis : @mui/material, @mui/icons-material, react-feather, react-toastify
// 🔧 Structure conservée mais composants visuels refondus avec MUI

// Étape 1 : Transaction.jsx
import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Tabs, Tab, Typography, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MethodSelection from './MethodSelection';
import ContentMobileDepot from './Depot/ContentMobileDepot';
import ContentCryptoDepot from './Depot/ContentCryptoDepot';
import ContentMobileRetrait from './Retrait/ContentMobileRetrait';
import ContentCryptoRetrait from './Retrait/ContentCryptoRetrait';
import { findTransaction as dataDepotCrypto } from '../../../services/depotCryptoService';
import { findTransaction as dataDepotMobile } from '../../../services/depotMobileService';
import { findTransaction as dataRetraitCrypto } from '../../../services/RetraitCryptoService';
import { findTransaction as dataRetraitMobile } from '../../../services/RetraitMobileService';

const Transaction = () => {
  const [asideOpen, setAsideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('depot');
  const [activeMethod, setActiveMethod] = useState(null);
  const [data, setData] = useState({
    depotMobile: [],
    depotCrypto: [],
    retraitMobile: [],
    retraitCrypto: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [depotCrypto, depotMobile, retraitCrypto, retraitMobile] = await Promise.all([
        dataDepotCrypto(),
        dataDepotMobile(),
        dataRetraitCrypto(),
        dataRetraitMobile()
      ]);

      setData({
        depotMobile: Array.isArray(depotMobile) ? depotMobile.map(t => ({ ...t, type: 'Dépot Mobile' })) : [],
        depotCrypto: Array.isArray(depotCrypto) ? depotCrypto.map(t => ({ ...t, type: 'Dépot Crypto' })) : [],
        retraitMobile: Array.isArray(retraitMobile) ? retraitMobile.map(t => ({ ...t, type: 'Retrait Mobile' })) : [],
        retraitCrypto: Array.isArray(retraitCrypto) ? retraitCrypto.map(t => ({ ...t, type: 'Retrait Crypto' })) : []
      });
    } catch (err) {
      setError("Erreur lors du chargement des données");
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" alignItems="center" gap={2} mt={2}>
          <CircularProgress size={24} />
          <Typography>Chargement des données...</Typography>
        </Box>
      );
    }
    if (error) {
      return (
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchData}>Réessayer</Button>
        }>
          {error}
        </Alert>
      );
    }
    if (!activeMethod) {
      return <MethodSelection onSelectMethod={setActiveMethod} />;
    }

    const key = `${activeTab}-${activeMethod}`;
    const props = {
      onBack: () => setActiveMethod(null),
      onRefresh: fetchData
    };
    const map = {
      'depot-mobile': <ContentMobileDepot data={data.depotMobile} {...props} />,
      'depot-crypto': <ContentCryptoDepot data={data.depotCrypto} {...props} />,
      'retrait-mobile': <ContentMobileRetrait data={data.retraitMobile} {...props} />,
      'retrait-crypto': <ContentCryptoRetrait data={data.retraitCrypto} {...props} />,
    };

    return map[key] || null;
  };

  return (
    <Box display="flex">
      <Box flexGrow={1}>
        <Box p={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">Transactions</Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              disabled={loading}
              variant="outlined"
            >
              {loading ? 'Chargement...' : 'Rafraîchir'}
            </Button>
          </Box>
          <Tabs
            value={activeTab}
            onChange={(e, val) => {
              setActiveTab(val);
              setActiveMethod(null);
            }}
          >
            <Tab label="Dépôt" value="depot" />
            <Tab label="Retrait" value="retrait" />
          </Tabs>

          <Box mt={2}>{renderContent()}</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Transaction;
