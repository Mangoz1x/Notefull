# Notefull

Notefull is a basic AI based text editor, currently, its able to use AI to do real time autocomplete prediction, In the future, I hope to be able to bring more featuers like audio transcription, auto note taking, and quiz creation based on notes.


## Development

To run this project:

```bash
  npm install
```

Set up a MongoDB database and create a .env.local file, then 
set your MongoDB uri. Then create your OpenAI account and enter your api key. Alternativiely you can configure it to use GROQ.

```bash
MONGODB_URI=your_mongodb_uri
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
``

