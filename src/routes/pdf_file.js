const PDFDocument = require("pdfkit");
const path = require("path");
const cf = require("currency-formatter");
const moment = require("moment");
require("moment/locale/pt-br");

moment.updateLocale("pt-BR", null);

function pdf_generator(res, capital, lucros, saques, usuario, chartP, chartR) {
  const doc = new PDFDocument({
    size: "A4"
  });

  const fechamento =
    "FECHAMENTO " +
    moment()
      .format("MMMM YYYY")
      .toUpperCase();

  //Local para salvar o PDF
  res.setHeader("Content-disposition", 'attachment; filename="' + "teste.pdf" + '"');
  res.setHeader("Content-type", "application/pdf");
  doc.pipe(res);

  //Adicionando a imagem no topo da página
  doc.image(path.resolve("./src/" + "preta.png"), 145, 0, {
    fit: [320, 320]
  });

  //Nome do cliente
  doc.fontSize(20);
  doc.moveDown(3.5);
  doc.text("CLIENTE: " + usuario.nome.toUpperCase(), { align: "center" }); //130, 150

  //Retângulo dourado com o mês de fechamento
  doc.rect(0, 180, doc.page.width, 30).fill("#D1AC00");
  doc.fill("#000000");
  doc.fontSize(25);
  doc.moveDown(0.3);
  doc.text(fechamento, { align: "center" }); //130, 190

  //margem da página
  doc.rect(20, 230, doc.page.width - 40, doc.page.height - 270).fillAndStroke("#ffffff", "#D1AC00");

  //Dados do fechamento do cliente - primeira página

  //Capital inicial
  doc.moveDown(1);
  doc.fill("#000000");
  doc.text("CAPITAL", { align: "center" });
  doc.fontSize(48);
  doc.moveDown(0.5);
  doc.text(cf.format(capital.inicial, { code: "BRL" }), { align: "center" }); //130, 300
  doc.fontSize(14);
  doc.moveDown(0.5);
  doc.text("CAPITAL INICIAL", { align: "center" }); //240, 360
  doc.rect(75, 380, doc.page.width - 150, 5).fill("#D1AC00");

  //Lucro mensal
  doc.fontSize(24);
  doc.moveDown(1);
  if (capital.p_mensal >= 0) {
    doc.fillColor("green").text(capital.p_mensal + "%", { align: "center" });
  } else {
    doc.fillColor("red").text(capital.p_mensal + "%", { align: "center" });
  }

  doc.moveDown(0.2);
  doc.fill("#000000");
  doc.fontSize(48);
  doc.text(cf.format(capital.lucro_mensal, { code: "BRL" }), { align: "center" }); //130, 450
  doc.fontSize(14);
  doc.moveDown(0.5);
  doc.text("LUCRO MENSAL", { align: "center" });
  doc.rect(75, 530, doc.page.width - 150, 5).fill("#D1AC00");

  //Capital + Lucro
  doc.fontSize(24);
  doc.moveDown(1);
  if (capital.p_lucro_capital >= 0) {
    doc.fillColor("green").text(capital.p_lucro_capital + "%", { align: "center" });
  } else {
    doc.fillColor("red").text(capital.p_lucro_capital + "%", { align: "center" });
  }
  doc.fill("#000000");
  doc.fontSize(48);
  doc.moveDown(0.2);
  doc.text(cf.format(capital.lucro_capital, { code: "BRL" }), { align: "center" }); //130, 450
  doc.fontSize(14);
  doc.moveDown(0.5);
  doc.text("CAPITAL INICIAL + LUCRO", { align: "center" });

  // Criação da segunda página
  if (lucros.length > 0) {
    doc.addPage();
    //Adicionando a imagem no centro e topo da página
    doc.image(path.resolve("./src/" + "preta.png"), 145, 0, {
      fit: [320, 320]
    });

    //Retângulo dourado com o mês de fechamento
    doc.rect(0, 180, doc.page.width, 30).fill("#D1AC00");
    doc.fill("#000000");
    doc.fontSize(25);
    doc.moveDown(4);
    doc.text(fechamento, { align: "center" }); //130, 190

    //margem da página
    doc.rect(20, 230, doc.page.width - 40, doc.page.height - 270).fillAndStroke("#ffffff", "#D1AC00");

    doc.fill("#000000");
    doc.moveDown(2);
    doc.text("LUCROS DIÁRIOS", { align: "center" });
    //Itens do lucro
    doc.fontSize(14);
    doc.moveDown(1.5);

    lucros.forEach((item, index) => {
      doc.fill("#000000");
      doc.text(item.data, { continued: true, align: "left" });
      if (item.lucro >= 0) {
        doc.text("R$ " + item.lucro, { continued: true, align: "right" }).fill("green");
      } else {
        doc.text("R$ " + item.lucro, { continued: true, align: "right" }).fill("red");
      }
      doc.fill("#000000");
      doc.text(item.mercado, { lineBreak: true, align: "justify" });

      if (index !== lucros.length - 1) {
        doc.fill("#adadad");
        doc.text("__________________________________________________________", {
          align: "left",
          width: doc.page.width,
          lineBreak: true
        });
      }

      doc.moveDown(0.7);
    });
  }

  //incluindo os gráficos no pdf - terceira página

  doc.addPage();
  //Adicionando a imagem no topo da página
  doc.image(path.resolve("./src/" + "preta.png"), 145, 0, {
    fit: [320, 320]
  });

  //Retângulo dourado com o mês de fechamento
  doc.rect(0, 180, doc.page.width, 30).fill("#D1AC00");
  doc.fill("#000000");
  doc.fontSize(25);
  doc.moveDown(4);
  doc.text(fechamento, { align: "center" });

  //Caixa onde vão os dados
  doc.rect(20, 230, doc.page.width - 40, doc.page.height - 270).fillAndStroke("#ffffff", "#D1AC00");

  //Grafico Rentabilidade
  doc.image(chartP, 50, 250, {
    fit: [500, 400]
  });

  //Faixa abaixo do primeiro grafico
  doc.rect(50, 510, doc.page.width - 100, 0.5).fillAndStroke("#D1AC00", "#D1AC00");

  //Grafico ROI
  doc.image(chartR, 50, 550, {
    fit: [500, 400]
  });

  // Criação da quarta página
  if (saques.length > 0) {
    doc.addPage();
    //Adicionando a imagem no centro e topo da página
    doc.image(path.resolve("./src/" + "preta.png"), 145, 0, {
      fit: [320, 320]
    });

    //Retângulo dourado com o mês de fechamento
    doc.rect(0, 180, doc.page.width, 30).fill("#D1AC00");
    doc.fill("#000000");
    doc.fontSize(25);
    doc.moveDown(4);
    doc.text(fechamento, { align: "center" }); //130, 190

    //Caixa onde vão os dados
    doc.rect(20, 230, doc.page.width - 40, doc.page.height - 270).fillAndStroke("#ffffff", "#D1AC00");

    doc.fill("#000000");
    doc.moveDown(2);
    doc.text("SAQUES/APLICAÇÕES", { align: "center" });
    //Itens do array
    doc.fontSize(14);
    doc.moveDown(1.5);

    doc.text("DATA", { align: "left", continued: true });
    doc.text("SAQUES", 270, 325, { width: 20, continued: true });
    doc.text("APLICAÇÃO", 360, 325, { lineBreak: true });

    doc.moveDown(1.5);

    space = 350;

    saques.forEach((item, index) => {
      doc.fontSize(14);
      doc.fill("#000000");
      doc.text(item.data, { continued: true, align: "left" });
      doc.text(cf.format(item.saque, { code: "BRL" }), { continued: true, align: "center" });
      doc.text(cf.format(item.aplicacao, { code: "BRL" }), { lineBreak: true, align: "right" });

      if (index !== saques.length - 1) {
        doc.fill("#adadad");
        doc.text("__________________________________________________________", {
          align: "left",
          width: doc.page.width,
          lineBreak: true
        });
      }

      doc.moveDown(0.7);
    });
  }

  // Finalize PDF file
  doc.end();
}

module.exports = pdf_generator;
