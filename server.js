// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files (your HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for chatbot
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        // Prepare messages for OpenAI API
        const messages = [
            {
                role: "system",
                content: "You are a witty AI assistant with a sense of humor. You keep answers short but entertaining, and occasionally make jokes."
            }
        ];
        
        // Add conversation history if available
        if (history && Array.isArray(history)) {
            messages.push(...history);
        }
        
        // Add the current user message
        messages.push({
            role: "user",
            content: message
        });
        
        // Call OpenAI API
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",  // You can switch to "gpt-4" if needed
                messages: messages,
                max_tokens: 150,
                temperature: 0.7
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            }
        );
        
        
        // Extract the assistant's response
        const aiResponse = response.data.choices[0].message.content;
        
        // Send back to the client
        res.json({ response: aiResponse });
    } catch (error) {
        console.error('Error calling OpenAI API:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to get response from AI service',
            details: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});