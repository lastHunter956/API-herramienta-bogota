const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

// Función para obtener precios desde la página
async function obtenerPrecios() {
  try {
    console.log("Iniciando Puppeteer...");
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto("https://www.agronegocios.co/precios", {
      waitUntil: "load",
      timeout: 0,
    });

    // Esperar a que la tabla de precios esté disponible
    await page.waitForSelector(".ttable .tbody .row", { timeout: 10000 });

    // Obtener el contenido HTML de la página
    const html = await page.content();
    console.log("HTML recuperado correctamente.");

    const $ = cheerio.load(html);
    const precios = [];

    $(".ttable .tbody .row").each((index, element) => {
      try {
        const nombre = $(element).find(".name").text().trim();
        const precioPromedio = $(element).find(".value").first().text().trim();
        const fecha = $(element).find(".value").first().next().text().trim();
        const variacion = $(element).find(".value").last().text().trim();

        // Agregar el producto a la lista de precios
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

    console.log(`Total de productos recuperados: ${precios.length}`);
    await browser.close();
    return precios;
  } catch (error) {
    console.error("Error al obtener los precios:", error);
    return [];
  }
}

// Función para convertir texto a kebab-case para URLs
function convertirAKebabCase(texto) {
  return texto
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Reemplazar caracteres no alfanuméricos por guiones
    .replace(/^-+|-+$/g, ""); // Eliminar guiones al principio y al final
}

// Función para obtener el enlace gráfico de un producto
async function obtenerGrafica(nombreProducto) {
  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });
    const page = await browser.newPage();
    const nombreProductoKebab = convertirAKebabCase(nombreProducto);

    const urlProducto = `https://www.agronegocios.co/precios/${nombreProductoKebab}`;
    try {
      await page.goto(urlProducto, { waitUntil: "load", timeout: 0 });
      console.log(
        `Página del producto '${nombreProducto}' cargada correctamente.`
      );
      await browser.close();
      return urlProducto;
    } catch (error) {
      console.error("Error al cargar la página del producto:", error);
      await browser.close();
      return null;
    }
  } catch (error) {
    console.error("Error al obtener la gráfica:", error);
    return null;
  }
}

module.exports = { obtenerPrecios, obtenerGrafica };
