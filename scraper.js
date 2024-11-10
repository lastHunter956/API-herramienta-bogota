const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

// Función para obtener los precios de todos los productos
async function obtenerPrecios() {
  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // Opciones necesarias para Railway
      headless: true,
    });
    const page = await browser.newPage();

    // Navegar a la página principal de precios
    console.log("Navegando a la página de precios...");
    await page.goto("https://www.agronegocios.co/precios", {
      waitUntil: "load",
      timeout: 0,
    });
    console.log("Página cargada correctamente.");

    // Esperar a que la tabla de precios se cargue
    await page.waitForSelector(".ttable .tbody .row");
    console.log("Tabla de precios detectada.");

    // Obtener el contenido HTML de la página
    const html = await page.content();
    console.log("HTML recuperado:", html.substring(0, 500)); // Muestra los primeros 500 caracteres del HTML para depuración
    await browser.close();

    const $ = cheerio.load(html);
    const precios = [];

    // Recorrer las filas de la tabla de precios
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

    console.log("Productos extraídos:", precios.length);
    return precios;
  } catch (error) {
    console.error("Error al obtener los precios:", error);
    return [];
  }
}

// Función para convertir texto a kebab-case para construir URLs
function convertirAKebabCase(texto) {
  return texto
    .toLowerCase() // Convertir a minúsculas
    .replace(/[^a-z0-9]+/g, "-") // Reemplazar caracteres no alfanuméricos por guiones
    .replace(/^-+|-+$/g, ""); // Eliminar guiones al principio y al final
}

// Función para generar la URL de un producto específico
async function obtenerGrafica(nombreProducto) {
  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // Opciones necesarias para Railway
      headless: true,
    });
    const page = await browser.newPage();
    const nombreProductoKebab = convertirAKebabCase(nombreProducto);

    // Construir la URL del producto
    const urlProducto = `https://www.agronegocios.co/precios/${nombreProductoKebab}`;
    console.log("URL generada para el producto:", urlProducto);

    // Navegar a la página del producto para verificar su existencia
    await page.goto(urlProducto, { waitUntil: "load", timeout: 0 });
    console.log("Página del producto cargada correctamente.");
    await browser.close();

    return urlProducto;
  } catch (error) {
    console.error("Error al obtener la gráfica:", error);
    return null;
  }
}

module.exports = { obtenerPrecios, obtenerGrafica };
