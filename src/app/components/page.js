'use client';

import React, { useState, useRef, useEffect } from "react";
import { Box, Stack, TextField, Button, Paper, Typography, Avatar, List, ListItem, ListItemText, Divider, IconButton } from '@mui/material';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';

// Dark mode theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1A73E8',
    },
    secondary: {
      main: '#9C27B0',
    },
    background: {
      default: '#121212',
      paper: '#1D1D1D',
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#B0B0B0',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default function Home() {
  const [chats, setChats] = useState([{
    id: Date.now(),
    messages: [
      {
        role: 'assistant',
        content: "Hi! I'm Alex, an AI English Learning Assistant.",
      },
    ],
  }]);
  const [currentChatId, setCurrentChatId] = useState(chats[0].id);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const user = auth.currentUser;

  const sendMessage = async () => {
    // Your sendMessage logic here...
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
  }, [chats, currentChatId]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      messages: [
        {
          role: 'assistant',
          content: "Hi! How can I assist you today?",
        },
      ],
    };
    setChats([...chats, newChat]);
    setCurrentChatId(newChat.id);
  };

  const selectChat = (id) => {
    setCurrentChatId(id);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
      >
        {/* Sidebar with New Chat and Chat List */}
        {isSidebarOpen && (
          <Paper
            elevation={6}
            sx={{
              width: { xs: '100%', md: '20%' },
              height: { xs: 'auto', md: '100%' },
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              bgcolor: 'background.paper',
            }}
          >
            <IconButton
              onClick={toggleSidebar}
              sx={{ alignSelf: 'flex-end', mb: 2 }}
            >
              <CloseIcon />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={createNewChat}
              sx={{
                mb: 2,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              New Chat
            </Button>

            <List sx={{ overflowY: 'auto', flexGrow: 1 }}>
              {chats.map((chat) => (
                <React.Fragment key={chat.id}>
                  <ListItem
                    button
                    selected={chat.id === currentChatId}
                    onClick={() => selectChat(chat.id)}
                    sx={{
                      bgcolor: chat.id === currentChatId ? 'primary.dark' : 'inherit',
                      '&:hover': {
                        bgcolor: 'primary.light',
                      },
                    }}
                  >
                    <ListItemText
                      primary={`Chat ${chats.indexOf(chat) + 1}`}
                      secondary={chat.messages[0].content.substring(0, 20) + '...'}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>

            <Button
              variant="contained"
              onClick={handleLogout}
              sx={{
                mt: 2,
                bgcolor: 'secondary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                },
              }}
            >
              Logout
            </Button>
          </Paper>
        )}

        {/* Chat area */}
        <Paper
          elevation={6}
          sx={{
            width: { xs: '100%', md: isSidebarOpen ? '80%' : '100%' },
            height: '100%',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            borderRadius: 2,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            bgcolor: 'background.paper',
          }}
        >
          {/* Header with AI Support Assistance, image, and online status */}
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box display="flex" alignItems="center">
              <IconButton
                onClick={toggleSidebar}
                sx={{ display: { md: 'none' }, mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Avatar
                alt="AI Avatar"
                src="/src/app/images/image1.jpg" // Adjust the path to your image file
                sx={{ width: 32, height: 32, mr: 1 }}
              />
              <Typography variant="h6" sx={{ color: 'text.primary' }}>
                AI Support Assistance
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <CircleIcon sx={{ color: 'green', fontSize: 14, mr: 1 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Online
              </Typography>
            </Box>
          </Box>

          <Stack
            direction="column"
            spacing={2}
            flexGrow={1}
            sx={{ overflowY: 'auto', maxHeight: 'calc(100% - 80px)', p: 1, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)' }}
          >
            {chats.find(chat => chat.id === currentChatId)?.messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
                sx={{ mb: 1 }}
              >
                {message.role === 'assistant' && (
                  <Avatar
                    alt="AI Avatar"
                    src="/src/app/ai-avatar.png" // Adjust the path to your image file
                    sx={{ width: 24, height: 24, mr: 1 }}
                  />
                )}
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
                  <Typography variant="body2">
                    {message.role === 'assistant' && isLoading && index === chats.find(chat => chat.id === currentChatId)?.messages.length - 1
                      ? <CircularProgress size={14} sx={{ color: 'white' }} />
                      : message.content}
                  </Typography>
                </Box>
              </Box>
            ))}
            {isLoading && typingMessage && (
              <Box
                display="flex"
                justifyContent="flex-start"
                sx={{ mb: 1 }}
              >
                <Avatar
                  alt="AI Avatar"
                  src="/src/app/ai-avatar.png" // Adjust the path to your image file
                  sx={{ width: 24, height: 24, mr: 1 }}
                />
                <Box
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: 2,
                    p: 2,
                    maxWidth: '70%',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    wordWrap: 'break-word',
                  }}
                >
                  <Typography variant="body2">{typingMessage}</Typography>
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Chat with AI Assistance"
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
    </ThemeProvider>
  );
}
