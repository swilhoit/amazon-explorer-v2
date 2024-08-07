// components/AccountHistory.js
import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebase'; // Ensure correct path
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const AccountHistory = () => {
  const [queryLogs, setQueryLogs] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'queryLogs'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQueryLogs(logs);
    });

    return () => unsubscribe();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Query</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {queryLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.query}</TableCell>
              <TableCell>{log.timestamp?.toDate().toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AccountHistory;
