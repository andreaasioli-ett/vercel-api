const fetch = require('node-fetch-commonjs');
const express = require('express');
const cors = require('cors');


const app = express();

const openaiApiKey = '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';
const temperature = 0.5;
const url = 'https://api.openai.com/v1/chat/completions';
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${openaiApiKey}`,
  },
}

function tryParseJSON(jsonString){
  try {
    return JSON.parse(jsonString);
  }
  catch (e) {
    return {choices: [{delta: {content: ''}}]}
  }
}



app.use(cors({
  origin: '*'
}));

app.get("/", async (req, res) => {

  const body = JSON.stringify({
    messages: [
      { "role": "user", "content": "Scrivi una storia di 1000 parole" }
    ],
    temperature: temperature,
    stream: true,
    model: "gpt-3.5-turbo",
  });

  const response = await fetch(url, { ...options, body })
  console.log(response);
  try {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' });
    for await (const chunk of response.body) {
      const lines = chunk.toString('utf-8').split('\n').filter(line => line.trim() !== '');
      const jsonLines = lines.map(line => line.replace(/^data: /, '')).filter(line => line.trim() !== '');
      const text = jsonLines.reduce((acc, line) => {
        const words = tryParseJSON(line).choices[0].delta.content;
        return line !== '[DONE]' ? acc + (words !== undefined ? words : '') : acc;
      }
      , '');
      res.write(text, 'utf-8');
      
      

    }
    res.end();
  } catch (err) {
    res.send(err.stack);
  }
});

app.listen(5000, () => {
  console.log("Running on port 5000.");
});

module.exports = app;