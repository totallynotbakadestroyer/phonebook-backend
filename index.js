require("dotenv").config({ path: "./.env.local" });
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

const PORT = process.env.PORT || 3001;

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
app.use(express.static("build"));
app.use(cors());
app.use(express.json());
morgan.token("req-body", function (req, res) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :req-body"
  )
);

app.get("/", (req, res) => {
  res.status(200).end();
});

app.get("/info", (req, res) => {
  let body = `<div><p>Phonebook has info for ${persons.length} people</p></div>
              <div>${new Date()}</div>`;
  return res.send(body);
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((result) => {
    res.json(result);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((result) => {
      if (result) {
        res.json(result);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => {
      next(error);
    });
});

app.delete("/api/persons/:id", (req, res) => {
  Person.findByIdAndDelete(req.params.id).then(() => {
    res.status(204).end();
  });
});

app.post("/api/persons", (req, res, next) => {
  if (!req.body || !req.body.name || !req.body.number) {
    next({ name: "ContentMissing" });
  }
  Person({ ...req.body })
    .save()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      next(err);
    });
});

app.put("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .then((result) => {
      if (result) {
        res.json(result);
      } else {
        next({ name: "NotFound" });
      }
    })
    .catch((error) => {
      next(error);
    });
});

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return res.status(400).send({ error: "wrong type of id" });
  }
  if (error.name === "ContentMissing") {
    return res.status(400).json({ error: "content missing" });
  }
  if (error.name === "NotFound") {
    return res.status(404).json({ error: "not found" });
  }
  if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
