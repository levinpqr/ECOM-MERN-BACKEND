const app = require("express")();
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const path = require("path");
const readdirSync = require("fs").readdirSync;

mongoose
    .connect(process.env.MONGO_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
    })
    .then(() => console.log("DB CONNECTED"));

app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());

readdirSync("./routes").forEach((file) => {
    const filename = path.basename(file, ".js");
    app.use(`/api/${filename}`, require(`./routes/${filename}`));
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log("SERVER RUNNING AT PORT", port));
