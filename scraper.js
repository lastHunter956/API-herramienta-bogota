const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const axios = require("axios");

// Instancia única del navegador
let browserInstance;

async function getBrowserInstance() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });
  }
  return browserInstance;
}

/**
 * Función para obtener los precios de la página de Agronegocios.
 * @returns {Array} Lista de productos con sus precios y variaciones.
 */
async function obtenerPrecios() {
  try {
    console.log("Iniciando Puppeteer...");
    const browser = await getBrowserInstance();
    const page = await browser.newPage();

    // Bloquear recursos innecesarios (imágenes, fuentes, etc.)
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (
        ["image", "stylesheet", "font", "script", "media"].includes(
          request.resourceType()
        )
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });

    console.log("Navegando a la página de precios...");
    await page.goto("https://www.agronegocios.co/precios", {
      waitUntil: "networkidle2", // Esperar a que la red esté inactiva
    });

    console.log("Esperando que se cargue la tabla...");
    await page.waitForSelector(".ttable .tbody .row");

    console.log("Extrayendo el contenido de la página...");
    const html = await page.content();
    await page.close();

    console.log("Procesando el contenido HTML con Cheerio...");
    return parsearHtml(html);
  } catch (error) {
    console.error("Error al obtener los precios:", error);
    return [];
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
      let variacionTexto = $(element).find(".value").last().text().trim();

      // Limpieza adicional del texto
      variacionTexto = variacionTexto.replace(/\s+/g, " ").trim();

      // Expresión regular ajustada para capturar incremento y porcentaje (positivos y negativos)
      const variacionMatch = variacionTexto.match(
        /^([+\-]?\$\s?[\d,.\s]+)\s([+\-]?\d+,\d+\s?%)$/
      );

      const variacion = {
        incremento: variacionMatch ? variacionMatch[1].trim() : "N/A",
        porcentaje: variacionMatch ? variacionMatch[2].trim() : "N/A",
      };

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
    console.log("Generando URL para la gráfica...");
    const nombreProductoKebab = convertirAKebabCase(nombreProducto);
    const urlProducto = `https://www.agronegocios.co/precios/${nombreProductoKebab}`;
    return urlProducto;
  } catch (error) {
    console.error("Error al obtener la gráfica:", error);
    return null;
  }
}

const PIXABAY_API_KEY = "47008472-16999a4f6476b93ee9917e69e";
const PIXABAY_URL = "https://pixabay.com/api/";

/**
 * Buscar una imagen en Pixabay.
 * @param {string} producto Nombre del producto.
 * @returns {string} URL de la imagen encontrada o predeterminada.
 */
async function buscarImagen(producto) {
  try {
    const response = await axios.get(PIXABAY_URL, {
      params: {
        key: PIXABAY_API_KEY,
        q: producto,
        image_type: "photo",
        per_page: 3, // Ajustado al rango permitido por Pixabay
      },
    });

    if (response.data.hits && response.data.hits.length > 0) {
      return response.data.hits[0].webformatURL; // Retorna la primera imagen encontrada
    }

    // Si no hay resultados, retorna una imagen predeterminada
    return "https://i.blogs.es/37ba66/trabajar-en-el-campo/1366_2000.jpg";
  } catch (error) {
    console.error("Error al buscar la imagen:", error);
    return "https://i.blogs.es/37ba66/trabajar-en-el-campo/1366_2000.jpg";
  }
}

const LOREM_IPSUM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ac orci a sapien eleifend malesuada. Phasellus nec tortor non mauris volutpat vehicula. Integer euismod purus sit amet dui ultricies, nec eleifend dolor tincidunt.";

/**
 * Buscar una descripción en Wikipedia.
 * @param {string} producto Nombre del producto para buscar.
 * @param {string} lang Idioma para buscar (por defecto 'es').
 * @returns {string} Descripción corta del producto.
 */
async function buscarDescripcionWikipedia(producto, lang = "es") {
  try {
    const response = await axios.get(
      `https://${lang}.wikipedia.org/w/api.php`,
      {
        params: {
          action: "query",
          prop: "extracts",
          exintro: true,
          explaintext: true,
          format: "json",
          titles: producto,
        },
      }
    );

    const pages = response.data.query.pages;
    const pageKey = Object.keys(pages)[0];
    const page = pages[pageKey];

    if (pageKey !== "-1") {
      return limpiarTexto(page.extract) || LOREM_IPSUM;
    } else {
      return LOREM_IPSUM;
    }
  } catch (error) {
    console.error("Error al buscar la descripción en Wikipedia:", error);
    return LOREM_IPSUM;
  }
}

/**
 * Función para convertir un texto a formato kebab-case.
 * @param {string} texto Texto a convertir.
 * @returns {string} Texto en formato kebab-case.
 */
function convertirAKebabCase(texto) {
  return texto
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Limpia un texto eliminando corchetes y su contenido, así como saltos de línea.
 * @param {string} texto El texto a limpiar.
 * @returns {string} Texto limpio.
 */
function limpiarTexto(texto) {
  const sinCorchetes = texto.replace(/\[.*?\]/g, "");
  return sinCorchetes.replace(/\n/g, "").trim();
}

module.exports = {
  obtenerPrecios,
  obtenerGrafica,
  buscarImagen,
  buscarDescripcionWikipedia,
};
