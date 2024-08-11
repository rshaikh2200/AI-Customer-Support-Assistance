'use client'

import { useEffect, useState, useRef } from "react";
import { Box, Stack, TextField, Button, Paper, Typography, IconButton, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { auth, db } from '../firebase'; // Ensure these imports are correct
import { signOut } from 'firebase/auth';
import LogoutIcon from '@mui/icons-material/Logout';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

export default function Home() {

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ]);

  const [message, setMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini'); // Default to Gemini
  const messagesEndRef = useRef(null);
  const user = auth.currentUser;

  useEffect(() => {
    const loadChatHistory = async () => {
      if (user) {
        const chatDoc = doc(db, 'chats', user.uid);
        const chatSnapshot = await getDoc(chatDoc);
        if (chatSnapshot.exists()) {
          setMessages(chatSnapshot.data().messages);
        } else {
          setMessages([
            {
              role: 'assistant',
              content: "Hi! I'm the Headstarter support assistant. How can I help you today?",
            },
          ]);
        }
      }
    };

    loadChatHistory();
  }, [user]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newMessages = [
      ...messages,
      { role: 'user', content: message.trim() },
    ];

    setMessage(''); // Clear input field
    setMessages(newMessages); // Optimistically update UI

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({ body: message.trim(), type: selectedModel }),
      });

      const data = await response.json();

      const updatedMessages = [
        ...newMessages,
        { role: 'assistant', content: response.ok ? data.output : data.error || "Error occurred while processing your request." },
      ];

      setMessages(updatedMessages);

      if (user) {
        await setDoc(doc(db, 'chats', user.uid), { messages: updatedMessages });
      }

    } catch (error) {
      console.log("Post request error: %s", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ bgcolor: 'background.default', p: 2 }}
    >
      <Paper
        elevation={6}
        sx={{
          width: { xs: '100%', sm: '90%', md: '600px' },
          height: '80vh',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          borderRadius: 2,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <IconButton
          onClick={handleLogout}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'grey.600',
            '&:hover': {
              color: 'grey.900',
            },
          }}
        >
          <LogoutIcon />
        </IconButton>

        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', color: 'text.primary' }}>
          Chat with Support
        </Typography>

        {/* Model Selection Dropdown */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="model-select-label">Select Model</InputLabel>
          <Select
            labelId="model-select-label"
            value={selectedModel}
            label="Select Model"
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <MenuItem value="gemini">Gemini</MenuItem>
            <MenuItem value="aws">Anthropic Claude</MenuItem>
          </Select>
        </FormControl>

        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          sx={{ overflowY: 'auto', maxHeight: 'calc(100% - 80px)', p: 1, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)' }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
              sx={{ mb: 1 }}
            >
              <Box
                sx={{
                  bgcolor: message.role === 'assistant' ? 'primary.main' : 'secondary.main',
                  color: 'white',
                  borderRadius: 2,
                  p: 2,
                  maxWidth: '70%',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  wordWrap: 'break-word',
                }}
              >
                <Typography variant="body2">{message.content}</Typography>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Type your message..."
            fullWidth
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={4}
            sx={{ bgcolor: 'background.default', borderRadius: 2 }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            sx={{
              minWidth: '100px',
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            Send
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
