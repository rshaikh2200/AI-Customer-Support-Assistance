"use client";
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Paper,
  CircularProgress,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  AppBar,
  Toolbar,
  Stack,
  Grid,
} from '@mui/material';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

export default function Home() {
  const [caseStudies, setCaseStudies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [specialization, setSpecialization] = useState('');

  const handleTakeAssessment = async () => {
    setIsLoading(true);
    setError(null);
    setCurrentQuestionIndex(0);

    try {
      const response = await fetch('/api/claude-bedrock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ department, role, specialization }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch case studies');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setCaseStudies([{ caseStudy: data.caseStudy, questions: data.questions }]);

      const openAiResponse = await fetch('/api/claude-bedrock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: data.caseStudy }),
      });

      const imageData = await openAiResponse.json();

      if (!openAiResponse.ok || imageData.error) {
        throw new Error(imageData.error || 'Failed to generate image');
      }

      setImageUrl(imageData.imageUrl);

    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answerKey) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerKey,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < caseStudies[0].questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <Container maxWidth="md">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Flashcards SaaS
          </Typography>
          <SignedOut>
            <SignInButton mode="modal">
              <Button color="inherit">Log In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button color="inherit">Sign Up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </Toolbar>
      </AppBar>

      <Box component={Paper} p={5} my={6} sx={{ backgroundColor: '#f9f9f9', borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h3" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          Take Your Assessment
        </Typography>

        <Box my={4}>
          <TextField
            label="Department"
            fullWidth
            margin="normal"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            variant="outlined"
            sx={{ marginBottom: 3 }}
          />
          <TextField
            label="Role"
            fullWidth
            margin="normal"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            variant="outlined"
            sx={{ marginBottom: 3 }}
          />
          <TextField
            label="Specialization"
            fullWidth
            margin="normal"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            variant="outlined"
            sx={{ marginBottom: 3 }}
          />

          <Box display="flex" justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              onClick={handleTakeAssessment}
              disabled={isLoading}
              sx={{ padding: '10px 30px', fontSize: '1.2rem' }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Take Assessment'}
            </Button>
          </Box>
        </Box>

        {error && (
          <Box mt={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {imageUrl && (
          <Box mt={4} display="flex" justifyContent="center">
            <img src={imageUrl} alt="Generated by AI" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }} />
          </Box>
        )}

        {caseStudies.length > 0 && (
          <Box mt={4}>
            <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
              Case Study
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ marginBottom: 3 }}>
              {caseStudies[0].caseStudy}
            </Typography>

            {caseStudies[0].questions && caseStudies[0].questions.length > 0 && (
              <Box mt={3} p={3} sx={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Question {currentQuestionIndex + 1} of {caseStudies[0].questions.length}
                </Typography>
                <Typography variant="body2" gutterBottom sx={{ marginBottom: 2 }}>
                  {caseStudies[0].questions[currentQuestionIndex].question}
                </Typography>

                <RadioGroup
                  value={selectedAnswers[currentQuestionIndex] || ''}
                  onChange={(e) => handleAnswerSelect(currentQuestionIndex, e.target.value)}
                >
                  {caseStudies[0].questions[currentQuestionIndex].options.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={option.key}
                      control={<Radio />}
                      label={<Typography variant="body2">{`${option.key}. ${option.label}`}</Typography>}
                      sx={{ marginBottom: 1 }}
                    />
                  ))}
                </RadioGroup>

                <Box mt={4} display="flex" justifyContent="space-between">
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    sx={{ padding: '8px 16px' }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === caseStudies[0].questions.length - 1}
                    sx={{ padding: '8px 16px' }}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
}
