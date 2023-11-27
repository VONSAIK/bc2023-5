const express = require('express');
const fs = require('fs/promises');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
const port = 8000;

app.use(express.json());
app.use(express.static('static'));
app.use(bodyParser.raw({ type: 'text/plain' }));

const filename = 'notes.json';

async function readNotesFile() {
  try {
    const fileContent = await fs.readFile(filename, 'utf8');
    return JSON.parse(fileContent) || [];
  } catch (error) {
    console.error('Error reading or parsing JSON file:', error.message);
    return [];
  }
}

async function writeNotesFile(notes) {
  try {
    await fs.writeFile(filename, JSON.stringify(notes), 'utf8');
  } catch (error) {
    console.error('Error writing JSON file:', error.message);
  }
}

app.get('/notes', async (req, res) => {
  const notes = await readNotesFile();
  res.json(notes);
});

app.get('/UploadForm.html', (req, res) => {
  res.sendFile(__dirname + '/static/UploadForm.html');
});

app.post('/upload', async (req, res) => {
  const { note_name, note } = req.body;
  const notes = await readNotesFile();
  const existing = notes.find(existingNote => existingNote.note_name === note_name);

  if (existing) {
    res.status(400).send('This note already exists');
  } else {
    notes.push({ note_name, note });
    await writeNotesFile(notes);
    res.status(201).send('Created');
  }
});

app.get('/notes/:note_name', async (req, res) => {
  const note_name = req.params.note_name;
  const notes = await readNotesFile();
  const findNote = notes.find(existingNote => existingNote.note_name === note_name);

  if (findNote) {
    res.send(findNote.note);
  } else {
    res.status(404).send('Not Found');
  }
});

app.put('/notes/:noteName', async (req, res) => {
  const noteName = req.params.noteName;
  const notes = await readNotesFile();
  const noteIndex = notes.findIndex(existingNote => existingNote.note_name === noteName);

  if (noteIndex !== -1) {
    notes[noteIndex].note = req.body.note;
    await writeNotesFile(notes);
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.delete('/notes/:note_name', async (req, res) => {
  const note_name = req.params.note_name;
  const notes = await readNotesFile();
  const noteIndex = notes.findIndex(existingNote => existingNote.note_name === note_name);

  if (noteIndex !== -1) {
    notes.splice(noteIndex, 1);
    await writeNotesFile(notes);
    res.status(200).send('Note deleted');
  } else {
    res.status(404).send('Not Found');
  }
});

app.listen(port, () => {
  console.log(`The server is running on the port ${port}`);
});
