import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';

const MethodSelection = ({ onSelectMethod }) => {
  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Choisissez une méthode
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        <Grid item>
          <Card
            sx={{ cursor: 'pointer', width: 200 }}
            onClick={() => onSelectMethod('mobile')}
          >
            <CardContent>
              <Box
                sx={{
                  backgroundColor: '#e3f2fd',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '50%',
                  width: 60,
                  height: 60,
                  mx: 'auto',
                  mb: 1
                }}
              >
                <SmartphoneIcon sx={{ color: '#2196f3' }} />
              </Box>
              <Typography variant="body1">Mobile Money</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item>
          <Card
            sx={{ cursor: 'pointer', width: 200 }}
            onClick={() => onSelectMethod('crypto')}
          >
            <CardContent>
              <Box
                sx={{
                  backgroundColor: '#e8f5e9',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '50%',
                  width: 60,
                  height: 60,
                  mx: 'auto',
                  mb: 1
                }}
              >
                <CurrencyBitcoinIcon sx={{ color: '#4caf50' }} />
              </Box>
              <Typography variant="body1">Crypto Money</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

MethodSelection.propTypes = {
  onSelectMethod: PropTypes.func.isRequired
};

export default MethodSelection;
