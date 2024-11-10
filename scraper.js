const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

async function obtenerPrecios() {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.agronegocios.co/precios");

    // Esperar a que la tabla de precios se cargue
    await page.waitForSelector(".ttable .tbody .row");

    const html = await page.content();
    // console.log(html); // Imprimir el HTML en la consola (opcional)
    await browser.close();

    const $ = cheerio.load(html);
    const precios = [];

    $(".ttable .tbody .row").each((index, element) => {
      try {
        const nombre = $(element).find(".name").text().trim();
        const precioPromedio = $(element).find(".value").first().text().trim();
        const fecha = $(element).find(".value").first().next().text().trim();
        const variacion = $(element).find(".value").last().text().trim();

        console.log(`Fila ${index + 1}:`);
        console.log("Nombre:", nombre);
        console.log("Precio Promedio:", precioPromedio);
        console.log("Fecha:", fecha);
        console.log("Variación:", variacion);

        precios.push({
          producto: nombre,
          precio_promedio: precioPromedio,
          fecha: fecha,
          variacion: variacion,
        });
      } catch (error) {
        console.error(`Error al procesar la fila ${index + 1}:`, error);
      }
    });

    return precios;
  } catch (error) {
    console.error("Error al obtener los precios:", error);
    return [];
  }
}
function convertirAKebabCase(texto) {
  return texto
    .toLowerCase() // Convertir a minúsculas
    .replace(/[^a-z0-9]+/g, "-") // Reemplazar caracteres no alfanuméricos por guiones
    .replace(/^-+|-+$/g, ""); // Eliminar guiones al principio y al final
}

async function obtenerGrafica(nombreProducto) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const nombreProductoKebab = convertirAKebabCase(nombreProducto);

    const urlProducto = `https://www.agronegocios.co/precios/${nombreProductoKebab}`;

    return urlProducto;
  } catch (error) {
    console.error("Error al obtener la gráfica:", error);
    return null;
  }
}

module.exports = { obtenerPrecios, obtenerGrafica };
