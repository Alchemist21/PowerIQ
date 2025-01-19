import React, { useState } from 'react';
import { 
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Paper,
  IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';

const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));

const ContractAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeContract = async (file) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:4000/evaluate", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log(data.data)
      setAnalysis(data.data);
    } catch (error) {
      alert("Error analyzing the contract. Please try again.");
    } finally {
      setLoading(false);
    }

    setLoading(false);
  };

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      await analyzeContract(uploadedFile);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high risk': return 'error.main';
      case 'low risk': return 'success.main';
      default: return 'text.secondary';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Energy Contract Risk Detector
          </Typography>

          <Box sx={{ mb: 4 }}>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              id="contract-file-upload"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <label htmlFor="contract-file-upload">
              <UploadBox>
                <IconButton 
                  color="primary" 
                  aria-label="upload contract"
                  component="span"
                  sx={{ mb: 1 }}
                >
                  <CloudUploadIcon fontSize="large" />
                </IconButton>
                <Typography variant="body1">
                  {file ? file.name : 'Upload contract file'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Drag and drop or click to select
                </Typography>
              </UploadBox>
            </label>
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {analysis && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Analysis Results
              </Typography>
              
              <Grid container spacing={3}>
                {Object.entries(analysis.risks).map(([key, value]) => {
                  return (
                    <Grid item xs={12} md={6} key={key}>
                      <Paper sx={{ p: 3 }}>
                        <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                          {key}
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ color: getRiskColor(value) }}
                        >
                          {value.toUpperCase()}
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              <Paper sx={{ mt: 4, p: 3, bgcolor: 'grey.50' }}>
                <Typography variant="h6">
                  Overall Risk Assessment:{' '}
                  <Box component="span" sx={{ color: getRiskColor(analysis.overallRisk) }}>
                    {analysis.overallRisk.toUpperCase()}
                  </Box>
                </Typography>
              </Paper>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ContractAnalyzer;
