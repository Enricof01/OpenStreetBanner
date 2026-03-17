import React, { useState } from 'react';
import { Backdrop, CircularProgress, Button, Typography, Box } from '@mui/material';

export default function LoadingOverlay({loading} : {loading:boolean}) {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const startCalculation = async () => {
    setOpen(true); // Loader anzeigen
    
    try {
      // Hier kommt dein Axios-Call oder die Berechnung hin
      await new Promise((resolve) => setTimeout(resolve, 3000)); 
    } catch (error) {
      console.error(error);
    } finally {
      setOpen(false); // Loader immer schließen (Promise erfüllt/abgelehnt)
    }
  };

  return (

    <>

      {/* Das Overlay */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2
        }}
        open={loading}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6">Berechne Route...</Typography>
      </Backdrop>
      </>
  );
}