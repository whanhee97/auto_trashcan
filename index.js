const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs");
const multer = require("multer");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);

app.use(express.json());

app.use(
  session({
    secret: "secret key",
    resave: false,
    saveUninitialized: true,
    store: new MemoryStore({
      checkPeriod: 86400000, // 24 hours (= 24 * 60 * 60 * 1000 ms)
    }),
    cookie: { maxAge: 86400000 },
  })
);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname);
  },
  filename: function (req, file, cb) {
    cb(null, "tmp");
  },
});

const upload = multer({ storage: storage });

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/trashinfo", upload.single("file"), (req, res, next) => {
  const reqfile = req.file;
  const reqbody = req.body;
  req.session.trashType = reqbody.trashType;

  console.log(reqfile);
  console.log(reqbody);

  res.json({ ok: true, data: "Single Upload Ok" });
});

app.get("/trashinfo", (req, res) => {
  fs.readFile("tmp", (err, data) => {
    res.writeHead(200, { "Content-Type": "" });
    res.json({ ok: true, trashType: req.session.trashType, pic: data });
  });
});

app.post("/trashcaninfo", (req, res) => {
  const reqbody = req.body;
  console.log(reqbody);
  req.session.isFull = reqbody.isFull;
  res.json({ ok: true, data: "trashcan info update!" });
});

app.get("/trashcaninfo", (req, res) => {
  res.json({ ok: true, isFull: req.session.isFull });
});

app.listen(5000);
