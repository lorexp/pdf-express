const express = require("express");
const cors = require("cors");

const { pdf_generator, pdf_ethereum } = require("./routes/pdf_file");

const app = express();

app.use(express.json());
app.use(cors());

app.post("/pdf", (req, res) => {
  const { capital, lucros, saques, usuario, chartP, chartR, data } = req.body;

  pdf_generator(res, capital, lucros, saques, usuario, chartP, chartR, data);
});

app.post("/ethereum", (req, res) => {
  const {
    capital,
    saques,
    usuario,
    chartP,
    chartR,
    cotacaoEth,
    moedas_mes,
    data
  } = req.body;

  pdf_ethereum(
    res,
    capital,
    saques,
    usuario,
    chartP,
    chartR,
    cotacaoEth,
    moedas_mes,
    data
  );
});

app.listen(5003, "0.0.0.0", () => console.log("Listening..."));
