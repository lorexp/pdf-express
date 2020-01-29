const express = require("express");
const { pdf_generator, pdf_ethereum } = require("./routes/pdf_file");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.post("/pdf", (req, res) => {
  let { capital, lucros, saques, usuario, chartP, chartR } = req.body;
  //let result = lucros.filter(lcr => moment(lcr.data, "DD/MM/YYYY").month() === moment().month());

  pdf_generator(res, capital, lucros, saques, usuario, chartP, chartR);
});

app.get("/ethereum", (req, res) => {
  //TROCAR PARA POST LOGO APÓS TERMINAR O PDF
  // let { capital, lucros, saques, usuario, chartP, chartR } = req.body;
  const usuario = {
    nome: "vinicius"
  };

  const capital = {
    inicial: 10000,
    p_mensal: 10,
    lucro_mensal: 10,
    p_lucro_capital: 10,
    lucro_capital: 100000,
    lucro_mensal_total: 100000,
    moedas: 10,
    cotacao: 700,
    p_lucro_mensal_total: 10
  };

  const saques = [
    {
      data: "20/01/2020",
      saque: 100,
      aplicacao: "Moedas"
    }
  ];
  pdf_ethereum(res, capital, saques, usuario, null, null); //trocar null por chartP e chartR
});

app.listen(5003, "0.0.0.0", () => console.log("Listening..."));
