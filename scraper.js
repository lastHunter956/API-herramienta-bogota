const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

/**
 * Función para obtener los precios de la página de Agronegocios.
 * @returns {Array} Lista de productos con sus precios y variaciones.
 */
async function obtenerPrecios() {
  try {
    console.log("Iniciando Puppeteer...");
    // Configurar Puppeteer con opciones necesarias para entornos de producción
    const browser = await puppeteer.launch({
      headless: true, // Ejecutar en modo sin cabeza (sin abrir navegador)
      args: [
        "--no-sandbox", // Desactiva el sandboxing (necesario en Railway y otros servidores)
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    console.log("Navegando a la página de precios...");
    await page.goto("https://www.agronegocios.co/precios", {
      waitUntil: "networkidle2", // Esperar a que la red esté inactiva
    });

    console.log("Esperando que se cargue la tabla...");
    // Esperar hasta que el selector de la tabla esté presente
    await page.waitForSelector(".ttable .tbody .row");

    console.log("Extrayendo el contenido de la página...");
    const html = await page.content(); // Extraer el HTML de la página

    console.log("Cerrando Puppeteer...");
    await browser.close();

    console.log("Procesando el contenido HTML con Cheerio...");
    const precios = parsearHtml(html); // Llamar a la función para procesar el HTML

    return precios; // Devolver los precios extraídos
  } catch (error) {
    console.error("Error al obtener los precios:", error);
    return []; // Devolver una lista vacía si ocurre un error
  }
}

/**
 * Función para procesar el HTML y extraer los datos de precios.
 * @param {string} html El HTML de la página.
 * @returns {Array} Lista de productos con sus precios y variaciones.
 */
function parsearHtml(html) {
  const $ = cheerio.load(html); // Cargar el HTML con Cheerio
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

  return precios; // Devolver la lista de precios extraídos
}

/**
 * Función para obtener el enlace de la gráfica de un producto.
 * @param {string} nombreProducto Nombre del producto.
 * @returns {string} Enlace de la gráfica del producto.
 */
async function obtenerGrafica(nombreProducto) {
  try {
    console.log("Iniciando Puppeteer para obtener la gráfica...");
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    const nombreProductoKebab = convertirAKebabCase(nombreProducto);

    const urlProducto = `https://www.agronegocios.co/precios/${nombreProductoKebab}`;
    console.log(`URL generada para la gráfica: ${urlProducto}`);

    await browser.close();
    return urlProducto; // Devolver el enlace generado
  } catch (error) {
    console.error("Error al obtener la gráfica:", error);
    return null; // Devolver null si ocurre un error
  }
}

/**
 * Función para convertir un texto a formato kebab-case.
 * @param {string} texto Texto a convertir.
 * @returns {string} Texto en formato kebab-case.
 */
function convertirAKebabCase(texto) {
  return texto
    .toLowerCase() // Convertir a minúsculas
    .replace(/[^a-z0-9]+/g, "-") // Reemplazar caracteres no alfanuméricos por guiones
    .replace(/^-+|-+$/g, ""); // Eliminar guiones al principio y al final
}

module.exports = { obtenerPrecios, obtenerGrafica };
