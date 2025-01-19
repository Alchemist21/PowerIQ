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
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

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
  const [numPages, setNumPages] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState('');

  const onFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(URL.createObjectURL(file));
      setExtractedText('');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const analyzeContract = async (fullText) => {
    setLoading(true);

    // try {
    //   const response = await fetch("http://localhost:4000/evaluate", {
    //     method: "POST",
    //     body: formData,
    //   });
    //   const data = await response.json();
    //   console.log(data.data)
    //   setAnalysis(data.data);
    // } catch (error) {
    //   alert("Error analyzing the contract. Please try again.");
    // } finally {
    //   setLoading(false);
    // }

    try {
      const response = await fetch("http://localhost:4000/evaluate", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: fullText})
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data.data, "ddd")
      setAnalysis(data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }

    setLoading(false);
  };

  const extractTextFromPage = async (pageNumber) => {
    try {
      const loadingTask = pdfjs.getDocument(file);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      return textContent.items.map(item => item.str).join(' ');
    } catch (error) {
      console.error('Error extracting text from page:', error);
      return '';
    }
  };

  const extractAllText = async () => {
    setLoading(true);
    try {
      let fullText = '';
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const pageText = await extractTextFromPage(pageNum);
        fullText += `\n--- Page ${pageNum} ---\n${pageText}`;
      }
      setExtractedText(fullText);

       await analyzeContract(fullText);
    } catch (error) {
      console.error('Error extracting text:', error);
      setExtractedText('Error extracting text from PDF');
    }
    setLoading(false);
  };

  // const handleFileUpload = async (event) => {
  //   const uploadedFile = event.target.files[0];
  //   if (uploadedFile && uploadedFile.type === 'application/pdf') {
  //     try {
  //       setLoading(true);
  //       setFile(uploadedFile);

  //       // Extract text from PDF
  //       const text = await extractAllText();
  //       setExtractedText(text);

  //       console.log(text)

  //       // Analyze the extracted text
  //       // const analysisResults = await analyzeContract(text);
  //       // setAnalysis(analysisResults);
  //     } catch (error) {
  //       console.error('Error processing file:', error);
  //       // Handle error appropriately
  //     } finally {
  //       setLoading(false);
  //     }
  //   } else {
  //     alert('Please upload a PDF file');
  //   }
  // };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high risk': return 'error.main';
      case 'low risk': return 'success.main';
      default: return 'text.secondary';
    }
  };

  console.log(analysis, "analysis")

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
              onChange={onFileChange}
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

          {file && (
            <Box sx={{ mt: 2 }}>
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<CircularProgress />}
              >
                <Page pageNumber={1} />
              </Document>
    
              {numPages && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Total Pages: {numPages}
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={extractAllText}
                    disabled={loading}
                  >
                    {loading ? 'Extracting...' : 'Extract Text'}
                  </Button>
                </Box>
              )}
    
              {loading && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress />
                </Box>
              )}
    
              {extractedText && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Extracted Text:
                  </Typography>
                  <Box 
                    component="pre"
                    sx={{
                      p: 2,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      overflow: 'auto',
                      maxHeight: '400px',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word'
                    }}
                  >
                    {extractedText}
                  </Box>
                </Box>
              )}
            </Box>
          )}

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
