const express = require("express");
const app = express();
const morgan = require("morgan");
const PORT = 3001;

const persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
];


app.use(express.json());
morgan.token('req-body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'));

app.get("/", (req, res) => {
  res.status(200).end();
});

app.get("/info", (req, res) => {
  let body = `<div><p>Phonebook has info for ${persons.length} people</p></div>
              <div>${new Date()}</div>`;
  return res.send(body);
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const person = persons.find((x) => x.id === Number(req.params.id));
  if (!person) {
    return res.status(404).end();
  }
  res.json(person);
});

app.delete("/api/persons/:id", (req, res) => {
  const personIndex = persons.findIndex((x) => x.id === Number(req.params.id));
  if (personIndex === -1) {
    return res.status(404).end();
  } else {
    persons.splice(personIndex, 1);
    res.status(204).end();
  }
});

app.post("/api/persons", (req, res) => {
  if (!req.body || !req.body.name || !req.body.number) {
    return res.status(400).json({
      error: "content missing",
    });
  }
  if (persons.some((x) => x.name === req.body.name)) {
    return res.status(400).json({
      error: "name must be unique",
    });
  }
  const personId = Math.floor(Math.random() * 999999);
  const person = req.body;
  person.id = personId;
  persons.push(person);
  res.json(person);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
