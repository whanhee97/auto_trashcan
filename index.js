const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs");
const multer = require("multer");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
let trashType = -1;
let isFull = 0;

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
  trashType = reqbody.trashType;

  console.log(reqfile);
  console.log(reqbody);

  res.json({ ok: true, data: "Single Upload Ok" });
});

app.get("/trashinfo", (req, res) => {
  const readFile = fs.readFileSync("./tmp");
  const encode = Buffer.from(readFile).toString("base64");

  res.json({ ok: true, trashType: trashType, pic: encode });
});

app.post("/trashcaninfo", (req, res) => {
  const reqbody = req.body;
  console.log(reqbody);
  isFull = reqbody.isFull;
  res.json({ ok: true, data: "trashcan info update!" });
});

app.get("/trashcaninfo", (req, res) => {
  res.json({ ok: true, isFull: isFull });
});

app.listen(5000);
