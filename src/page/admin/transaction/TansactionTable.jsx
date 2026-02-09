import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Check, Trash } from 'react-feather';
import { transaction as transactionDepotCrypto } from '../../../services/depotCryptoService';
import { transaction as transactionDepotMobile } from '../../../services/depotMobileService';
import { transaction as transactionRetraitCrypto } from '../../../services/RetraitCryptoService';
import { transaction as transactionRetraitMobile } from '../../../services/RetraitMobileService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Stack
} from '@mui/material';

const TransactionTable = ({
  title,
  columns,
  data,
  onExport,
  onRefresh,
  showPagination = true,
  pageSize = 10,
  currentPage = 1,
  onPageChange
}) => {
  const [loadingIds, setLoadingIds] = useState([]);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = showPagination
    ? data.slice(startIndex, startIndex + pageSize)
    : data;

  const handleAction = async (action, item) => {
    const etat = action === 'validate';
    setLoadingIds((ids) => [...ids, item.id]);

    try {
      let res;
      if (item.type === 'Retrait Mobile') {
        res = await transactionRetraitMobile(etat, item.id);
      } else if (item.type === 'Retrait Crypto') {
        res = await transactionRetraitCrypto(etat, item.id);
      } else if (item.type === 'Dépot Mobile') {
        res = await transactionDepotMobile(etat, item.id);
      } else {
        res = await transactionDepotCrypto(etat, item.id);
      }
      toast.success(`Transaction ${etat ? 'validée' : 'refusée'} avec succès !`);
      onRefresh?.();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la mise à jour de la transaction.');
    } finally {
      setLoadingIds((ids) => ids.filter((id) => id !== item.id));
    }
  };

  return (
    <Box>
      <ToastContainer position="top-right" autoClose={3000} />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.accessor}>{column.header}</TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((item) => (
              <TableRow key={item.id} hover>
                {columns.map((column) => (
                  <TableCell key={`${item.id}-${column.accessor}`}>
                    {column.render ? column.render(item[column.accessor], item) : item[column.accessor]}
                  </TableCell>
                ))}
                <TableCell>
                  <IconButton
                    color="success"
                    onClick={() => handleAction('validate', item)}
                    disabled={loadingIds.includes(item.id)}
                  >
                    {loadingIds.includes(item.id) ? <CircularProgress size={18} /> : <Check size={18} />}
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleAction('reject', item)}
                    disabled={loadingIds.includes(item.id)}
                  >
                    {loadingIds.includes(item.id) ? <CircularProgress size={18} /> : <Trash size={18} />}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && (
        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2">
            Affichage de {startIndex + 1} à {Math.min(startIndex + pageSize, totalItems)} sur {totalItems} entrées
          </Typography>
          <TablePagination
            component="div"
            count={totalItems}
            page={currentPage - 1}
            onPageChange={(e, newPage) => onPageChange(newPage + 1)}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[pageSize]}
          />
        </Box>
      )}
    </Box>
  );
};

TransactionTable.propTypes = {
  title: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  onExport: PropTypes.func,
  onRefresh: PropTypes.func,
  showPagination: PropTypes.bool,
  pageSize: PropTypes.number,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func
};

export default TransactionTable;
