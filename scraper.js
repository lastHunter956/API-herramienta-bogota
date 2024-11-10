const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

async function obtenerPrecios() {
  try {
    console.log("Iniciando Puppeteer...");
    const browser = await puppeteer.launch({
      headless: true, // Ejecutar en modo headless
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // Configuración para servidores como Railway
    });
    const page = await browser.newPage();
    await page.goto("https://www.agronegocios.co/precios", {
      waitUntil: "networkidle2", // Esperar hasta que la página cargue completamente
    });

    console.log("Esperando que se cargue la tabla...");
    await page.waitForSelector(".ttable .tbody .row"); // Selector para la tabla

    console.log("Extrayendo contenido de la página...");
    const html = await page.content();
    const $ = cheerio.load(html);

    const precios = [];

    $(".ttable .tbody .row").each((index, element) => {
      try {
        const nombre = $(element).find(".name").text().trim();
        const precioPromedio = $(element).find(".value").first().text().trim();
        const fecha = $(element).find(".value").first().next().text().trim();
        const variacion = $(element).find(".value").last().text().trim();

        if (nombre) {
          precios.push({
            producto: nombre,
            precio_promedio: precioPromedio,
            fecha: fecha,
            variacion: variacion,
          });
        }
      } catch (error) {
        console.error(`Error al procesar la fila ${index + 1}:`, error);
      }
    });

    console.log("Cerrando Puppeteer...");
    await browser.close();

    console.log("Precios extraídos:", precios);
    return precios;
  } catch (error) {
    console.error("Error al obtener los precios:", error);
    return [];
  }
}

function convertirAKebabCase(texto) {
  return texto
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function obtenerGrafica(nombreProducto) {
  try {
    console.log(`Generando URL para el producto: ${nombreProducto}`);
    const nombreProductoKebab = convertirAKebabCase(nombreProducto);

    const urlProducto = `https://www.agronegocios.co/precios/${nombreProductoKebab}`;
    console.log(`URL generada: ${urlProducto}`);
    return urlProducto;
  } catch (error) {
    console.error("Error al obtener la gráfica:", error);
    return null;
  }
}

module.exports = { obtenerPrecios, obtenerGrafica };
