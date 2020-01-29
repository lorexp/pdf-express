const PDFDocument = require("pdfkit");
const path = require("path");
const cf = require("currency-formatter");
const moment = require("moment");
require("moment/locale/pt-br");

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
  res.setHeader(
    "Content-disposition",
    'attachment; filename="' +
      usuario.nome +
      moment().format("MM[_]YYYY") +
      ".pdf" +
      '"'
  );
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
  doc
    .rect(20, 230, doc.page.width - 40, doc.page.height - 270)
    .fillAndStroke("#ffffff", "#D1AC00");

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
  doc.text(cf.format(capital.lucro_mensal, { code: "BRL" }), {
    align: "center"
  }); //130, 450
  doc.fontSize(14);
  doc.moveDown(0.5);
  doc.text("LUCRO MENSAL", { align: "center" });
  doc.rect(75, 530, doc.page.width - 150, 5).fill("#D1AC00");

  //Capital + Lucro
  doc.fontSize(24);
  doc.moveDown(1);
  if (capital.p_lucro_capital >= 0) {
    doc
      .fillColor("green")
      .text(capital.p_lucro_capital + "%", { align: "center" });
  } else {
    doc
      .fillColor("red")
      .text(capital.p_lucro_capital + "%", { align: "center" });
  }
  doc.fill("#000000");
  doc.fontSize(48);
  doc.moveDown(0.2);
  doc.text(cf.format(capital.lucro_capital, { code: "BRL" }), {
    align: "center"
  }); //130, 450
  doc.fontSize(14);
  doc.moveDown(0.5);
  doc.text("CAPITAL INICIAL + LUCRO", { align: "center" });

  // Criação da segunda página
  //ajustando a quantidade de páginas
  let qtd_pages = lucros.length / 10;
  let diff = qtd_pages % 1;
  qtd_pages = qtd_pages + 1 - diff;
  for (let i = 0; i < qtd_pages; i++) {
    if (lucros.length > 10) {
      itens_por_pagina = 10;
    } else {
      if (lucros.length === 0) {
        break;
      } else {
        itens_por_pagina = lucros.length;
      }
    }
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
    doc
      .rect(20, 230, doc.page.width - 40, doc.page.height - 270)
      .fillAndStroke("#ffffff", "#D1AC00");

    doc.fill("#000000");
    doc.moveDown(2);
    doc.text("LUCROS DIÁRIOS", { align: "center" });
    //Itens do lucro
    doc.fontSize(14);
    doc.moveDown(1.5);

    for (let x = 0; x < itens_por_pagina; x++) {
      doc.fill("#000000");
      doc.text(lucros[x].data, { continued: true, align: "left" });
      if (lucros[x].lucro >= 0) {
        doc
          .fillColor("green")
          .text(cf.format(lucros[x].lucro, { code: "BRL" }), {
            continued: true,
            align: "right"
          });
      } else {
        doc.fillColor("red").text(cf.format(lucros[x].lucro, { code: "BRL" }), {
          continued: true,
          align: "right"
        });
      }
      doc.fill("#000000");
      doc.text(lucros[x].mercado, { lineBreak: true, align: "justify" });

      if (x !== itens_por_pagina - 1) {
        doc.fill("#adadad");
        doc.text("__________________________________________________________", {
          align: "left",
          width: doc.page.width,
          lineBreak: true
        });
      }

      doc.moveDown(0.7);
    }
    lucros = lucros.slice(10, lucros.length);
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
  doc
    .rect(20, 230, doc.page.width - 40, doc.page.height - 270)
    .fillAndStroke("#ffffff", "#D1AC00");

  //Grafico Rentabilidade
  doc.image(chartP, 110, 250, { width: 350, height: 250 });

  //Faixa abaixo do primeiro grafico
  doc
    .rect(50, 510, doc.page.width - 100, 0.5)
    .fillAndStroke("#D1AC00", "#D1AC00");

  //Grafico ROI
  doc.image(chartR, 110, 550, { width: 350, height: 250 });

  // Criação da quarta página
  qtd_pages = saques.length / 10;
  diff = qtd_pages % 1;
  qtd_pages = qtd_pages + 1 - diff;
  for (let i = 0; i < qtd_pages; i++) {
    if (saques.length > 10) {
      itens_por_pagina = 10;
    } else {
      if (saques.length === 0) {
        break;
      } else {
        itens_por_pagina = saques.length;
      }
    }
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
    doc
      .rect(20, 230, doc.page.width - 40, doc.page.height - 270)
      .fillAndStroke("#ffffff", "#D1AC00");

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

    for (let x = 0; x < itens_por_pagina; x++) {
      doc.fontSize(14);
      doc.fill("#000000");
      doc.text(saques[x].data, { continued: true, align: "left" });
      doc.text(cf.format(saques[x].saque, { code: "BRL" }), {
        continued: true,
        align: "center"
      });
      doc.text(cf.format(saques[x].aplicacao, { code: "BRL" }), {
        lineBreak: true,
        align: "right"
      });

      if (x !== itens_por_pagina - 1) {
        doc.fill("#adadad");
        doc.text("__________________________________________________________", {
          align: "left",
          width: doc.page.width,
          lineBreak: true
        });
      }

      doc.moveDown(0.7);
    }
    saques = saques.slice(10, saques.length);
  }
  // if (saques.length > 0) {
  //   doc.addPage();
  //   //Adicionando a imagem no centro e topo da página
  //   doc.image(path.resolve("./src/" + "preta.png"), 145, 0, {
  //     fit: [320, 320]
  //   });

  //   //Retângulo dourado com o mês de fechamento
  //   doc.rect(0, 180, doc.page.width, 30).fill("#D1AC00");
  //   doc.fill("#000000");
  //   doc.fontSize(25);
  //   doc.moveDown(4);
  //   doc.text(fechamento, { align: "center" }); //130, 190

  //   //Caixa onde vão os dados
  //   doc.rect(20, 230, doc.page.width - 40, doc.page.height - 270).fillAndStroke("#ffffff", "#D1AC00");

  //   doc.fill("#000000");
  //   doc.moveDown(2);
  //   doc.text("SAQUES/APLICAÇÕES", { align: "center" });
  //   //Itens do array
  //   doc.fontSize(14);
  //   doc.moveDown(1.5);

  //   doc.text("DATA", { align: "left", continued: true });
  //   doc.text("SAQUES", 270, 325, { width: 20, continued: true });
  //   doc.text("APLICAÇÃO", 360, 325, { lineBreak: true });

  //   doc.moveDown(1.5);

  //   saques.forEach((item, index) => {
  //     doc.fontSize(14);
  //     doc.fill("#000000");
  //     doc.text(item.data, { continued: true, align: "left" });
  //     doc.text(cf.format(item.saque, { code: "BRL" }), { continued: true, align: "center" });
  //     doc.text(cf.format(item.aplicacao, { code: "BRL" }), { lineBreak: true, align: "right" });

  //     if (index !== saques.length - 1) {
  //       doc.fill("#adadad");
  //       doc.text("__________________________________________________________", {
  //         align: "left",
  //         width: doc.page.width,
  //         lineBreak: true
  //       });
  //     }

  //     doc.moveDown(0.7);
  //   });

  // Finalize PDF file
  doc.end();
}

function pdf_ethereum(res, capital, saques, usuario, chartP, chartR) {
  const doc = new PDFDocument({
    size: "A4"
  });

  const fechamento =
    "FECHAMENTO " +
    moment()
      .format("MMMM YYYY")
      .toUpperCase();

  //Local para salvar o PDF
  res.setHeader(
    "Content-disposition",
    'attachment; filename="' +
      usuario.nome +
      moment().format("MM[_]YYYY") +
      ".pdf" +
      '"'
  );
  res.setHeader("Content-type", "application/pdf");
  doc.pipe(res);

  //Adicionando a imagem no topo da página
  doc.image(path.resolve("./src/preta.png"), 145, 0, {
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
  doc
    .rect(20, 230, doc.page.width - 40, doc.page.height - 270)
    .fillAndStroke("#ffffff", "#D1AC00");

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
  doc.text(cf.format(capital.lucro_mensal, { code: "BRL" }), {
    align: "center"
  }); //130, 450
  doc.fontSize(14);
  doc.moveDown(0.5);
  doc.text("LUCRO MENSAL", { align: "center" });
  doc.rect(75, 530, doc.page.width - 150, 5).fill("#D1AC00");

  //Capital + Lucro
  doc.fontSize(24);
  doc.moveDown(1);
  if (capital.p_lucro_capital >= 0) {
    doc
      .fillColor("green")
      .text(capital.p_lucro_capital + "%", { align: "center" });
  } else {
    doc
      .fillColor("red")
      .text(capital.p_lucro_capital + "%", { align: "center" });
  }
  doc.fill("#000000");
  doc.fontSize(48);
  doc.moveDown(0.2);
  doc.image(path.resolve("./src/ethereum.png"), 90, 575, {
    fit: [60, 60]
  });
  doc.text(cf.format(capital.lucro_capital, { code: "BRL" }), {
    align: "center"
  }); //130, 450
  doc.fontSize(14);
  doc.moveDown(0.5);
  doc.text("MOEDA MINERADA ETHEREUM", { align: "center" });

  //incluindo os gráficos no pdf - terceira página

  doc.addPage();
  //Adicionando a imagem no topo da página
  doc.image(path.resolve("./src/preta.png"), 145, 0, {
    fit: [320, 320]
  });

  //Retângulo dourado com o mês de fechamento
  doc.rect(0, 180, doc.page.width, 30).fill("#D1AC00");
  doc.fill("#000000");
  doc.fontSize(25);
  doc.moveDown(4);
  doc.text(fechamento, { align: "center" });

  //Caixa onde vão os dados
  doc
    .rect(20, 230, doc.page.width - 40, doc.page.height - 270)
    .fillAndStroke("#ffffff", "#D1AC00");

  //Grafico Rentabilidade
  // doc.image(chartP, 110, 250, { width: 350, height: 250 });

  //Faixa abaixo do primeiro grafico
  doc
    .rect(50, 510, doc.page.width - 100, 0.5)
    .fillAndStroke("#D1AC00", "#D1AC00");

  //Grafico ROI
  // doc.image(chartR, 110, 550, { width: 350, height: 250 });

  // Criação da quarta página
  qtd_pages = saques.length / 10;
  diff = qtd_pages % 1;
  qtd_pages = qtd_pages + 1 - diff;
  for (let i = 0; i < qtd_pages; i++) {
    if (saques.length > 10) {
      itens_por_pagina = 10;
    } else {
      if (saques.length === 0) {
        break;
      } else {
        itens_por_pagina = saques.length;
      }
    }
    doc.addPage();
    //Adicionando a imagem no centro e topo da página
    doc.image(path.resolve("./src/preta.png"), 145, 0, {
      fit: [320, 320]
    });

    //Retângulo dourado com o mês de fechamento
    doc.rect(0, 180, doc.page.width, 30).fill("#D1AC00");
    doc.fill("#000000");
    doc.fontSize(25);
    doc.moveDown(4);
    doc.text(fechamento, { align: "center" }); //130, 190

    //margem da página
    doc
      .rect(20, 230, doc.page.width - 40, doc.page.height - 270)
      .fillAndStroke("#ffffff", "#D1AC00");

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

    for (let x = 0; x < itens_por_pagina; x++) {
      doc.fontSize(14);
      doc.fill("#000000");
      doc.text(saques[x].data, { continued: true, align: "left" });
      doc.text(cf.format(saques[x].saque, { code: "BRL" }), {
        continued: true,
        align: "center"
      });
      doc.text(cf.format(saques[x].aplicacao, { code: "BRL" }), {
        lineBreak: true,
        align: "right"
      });

      if (x !== itens_por_pagina - 1) {
        doc.fill("#adadad");
        doc.text("__________________________________________________________", {
          align: "left",
          width: doc.page.width,
          lineBreak: true
        });
      }

      doc.moveDown(0.7);
    }
    saques = saques.slice(10, saques.length);
  }

  //Ultima página
  doc.addPage();

  doc.image(path.resolve("./src/preta.png"), 145, 0, {
    fit: [320, 320]
  });

  //Retângulo dourado com o mês de fechamento
  doc.rect(0, 180, doc.page.width, 30).fill("#D1AC00");
  doc.fill("#000000");
  doc.fontSize(25);
  doc.moveDown(4);
  doc.text(fechamento, { align: "center" }); //130, 190

  //margem da página
  doc
    .rect(20, 230, doc.page.width - 40, doc.page.height - 270)
    .fillAndStroke("#ffffff", "#D1AC00");

  //Lucro mensal
  doc.fontSize(18);
  doc.fill("#000000");
  doc.moveDown(2);
  doc.text("TOTAL EM MOEDAS ETHEREUM", { align: "center" });
  doc.moveDown(2.5);
  doc.image(path.resolve("./src/ethereum.png"), 170, 320, {
    fit: [60, 60]
  });
  doc.fill("#000000");
  doc.fontSize(48);
  doc.text(capital.moedas, {
    align: "center"
  }); //130, 450
  doc.rect(75, 415, doc.page.width - 150, 5).fill("#D1AC00");

  //Capital + Lucro
  doc.fontSize(24);
  doc.moveDown(2);
  if (capital.p_lucro_mensal_total >= 0) {
    doc
      .fillColor("green")
      .text(capital.p_lucro_mensal_total + "%", { align: "center" });
  } else {
    doc
      .fillColor("red")
      .text(capital.p_lucro_mensal_total + "%", { align: "center" });
  }
  doc.fill("#000000");
  doc.fontSize(48);
  doc.moveDown(0.2);
  doc.text(cf.format(capital.lucro_mensal_total, { code: "BRL" }), {
    align: "center"
  }); //130, 450
  doc.fontSize(14);
  doc.moveDown(0.5);
  doc.text("LUCRO MENSAL TOTAL", { align: "center" });
  doc.rect(75, 585, doc.page.width - 150, 5).fill("#D1AC00");

  doc.moveDown(4);
  doc.fill("#000000");
  doc.fontSize(48);
  doc.text(cf.format(capital.moedas * capital.cotacao, { code: "BRL" }), {
    align: "center"
  }); //130, 450
  doc.fontSize(14);
  doc.moveDown(0.5);
  doc.text("VALOR TOTAL PARA VENDA HOJE", { align: "center" });

  // Finalize PDF file
  doc.end();
}

module.exports = {
  pdf_generator,
  pdf_ethereum
};
