const express = require("express");
const pdf_generator = require("./routes/pdf_file");
const moment = require("moment");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization, DataContent, chartP, chartR, Accept-Encoding"
//   );
//   next();
// });

app.post("/pdf", (req, res) => {
  let { capital, lucros, saques, usuario, chartP, chartR } = req.body;
  //let result = lucros.filter(lcr => moment(lcr.data, "DD/MM/YYYY").month() === moment().month());

  pdf_generator(res, capital, lucros, saques, usuario, chartP, chartR);
});

app.listen(5003, "0.0.0.0", () => console.log("Listening..."));
