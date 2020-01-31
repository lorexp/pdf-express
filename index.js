const express = require("express");
const cors = require("cors");

const { pdf_generator, pdf_ethereum } = require("./routes/pdf_file");

const app = express();

app.use(express.json());
app.use(cors());

app.post("/pdf", (req, res) => {
  const { capital, lucros, saques, usuario, chartP, chartR } = req.body;

  pdf_generator(res, capital, lucros, saques, usuario, chartP, chartR);
});

app.post("/ethereum", (req, res) => {
  const {
    capital,
    lucros,
    saques,
    usuario,
    chartP,
    chartR,
    cotacaoEth,
    moedas_mes
  } = req.body;
  /* AQUI ESTAO OS DADOS ESPERADOS PELO PDF, MODIFICAR SE NECESSÁRIO. */
  // const usuario = {
  //   nome: "vinicius"
  // };

  // const capital = {
  //   inicial: 10000,
  //   p_mensal: 10,
  //   lucro_mensal: 10,
  //   p_lucro_capital: 10,
  //   lucro_capital: 100000,
  //   lucro_mensal_total: 100000,
  //   moedas_total: 10,
  //   moedas_mes: 2,
  //   p_venda_moeda: 11,
  //   cotacao: 700,
  //   p_lucro_mensal_total: 10
  // };

  // const saques = [
  //   {
  //     data: "20/01/2020",
  //     saque: 100,
  //     aplicacao: "Moedas"
  //   }
  // ];
  pdf_ethereum(
    res,
    capital,
    saques,
    usuario,
    chartP,
    chartR,
    cotacaoEth,
    moedas_mes
  ); //trocar null por chartP e chartR
});

app.listen(5003, "0.0.0.0", () => console.log("Listening..."));
