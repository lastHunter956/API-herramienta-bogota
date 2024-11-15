const express = require("express");
const {
  obtenerPrecios,
  obtenerGrafica,
  buscarImagen,
  buscarDescripcionWikipedia,
} = require("./scraper");

const app = express();
const port = 3000;

app.use(express.json());

app.get("/productos", async (req, res) => {
  try {
    const precios = await obtenerPrecios();
    res.json(precios);
  } catch (error) {
    console.error("Error en la API:", error);
    res.status(500).json({ error: "Error al obtener los precios" });
  }
});

// POST para obtener información de un producto específico
app.post("/productos", async (req, res) => {
  try {
    const { nombre } = req.body; // Obtener el nombre del producto desde el cuerpo de la solicitud

    if (!nombre) {
      return res
        .status(400)
        .json({ error: 'El parámetro "nombre" es requerido.' });
    }

    const precios = await obtenerPrecios(); // Obtiene todos los productos
    const producto = precios.find((p) => p.producto === nombre);

    if (producto) {
      // Enriquecer la respuesta con imagen, gráfica y descripción
      producto.imagen = await buscarImagen(nombre);
      producto.mas_info = await obtenerGrafica(nombre);
      producto.descripcion = await buscarDescripcionWikipedia(nombre);
      res.json(producto);
    } else {
      res.status(404).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    console.error("Error en la API:", error);
    res.status(500).json({ error: "Error al obtener los precios" });
  }
});

app.post("/grafica_producto", async (req, res) => {
  try {
    console.log(req.body);
    const nombreProducto = req.body.producto;
    if (!nombreProducto) {
      return res
        .status(400)
        .json({ error: "Falta el nombre del producto en el body" });
    }
    const urlGrafica = await obtenerGrafica(nombreProducto);
    res.json({ url_grafica: urlGrafica });
  } catch (error) {
    console.error("Error en la API:", error);
    res.status(500).json({ error: "Error al obtener la gráfica" });
  }
});
// POST para ordenar productos según el porcentaje, incluyendo imágenes
app.post("/ordenar", async (req, res) => {
  try {
    const { orden = "DESC", cantidad = 10 } = req.body;

    if (orden !== "ASC" && orden !== "DESC") {
      return res
        .status(400)
        .json({ error: 'El parámetro "orden" debe ser "ASC" o "DESC".' });
    }

    const productos = await obtenerPrecios();

    // Filtrar productos válidos (aquellos con porcentaje definido)
    const productosValidos = productos.filter(
      (p) => p.variacion && p.variacion.porcentaje
    );

    // Calcular porcentajeNumerico correctamente
    productosValidos.forEach((p) => {
      // Limpia caracteres no numéricos excepto el signo negativo y la coma
      const porcentajeLimpio = p.variacion.porcentaje
        .replace(/[^0-9.,-]/g, "") // Remueve todo excepto números, punto, coma y signo negativo
        .replace(",", "."); // Reemplaza coma por punto decimal

      // Verifica si el porcentaje contiene un signo negativo
      const porcentajeNumerico = porcentajeLimpio.startsWith("-")
        ? -parseFloat(porcentajeLimpio.replace("-", ""))
        : parseFloat(porcentajeLimpio);

      // Asigna el valor numérico corregido
      p.variacion.porcentajeNumerico = porcentajeNumerico || 0;
    });

    // Ordenar los productos por porcentajeNumerico
    const productosOrdenados = productosValidos.sort((a, b) => {
      if (orden === "ASC") {
        return a.variacion.porcentajeNumerico - b.variacion.porcentajeNumerico;
      } else {
        return b.variacion.porcentajeNumerico - a.variacion.porcentajeNumerico;
      }
    });

    // Limitar la cantidad de productos
    const productosLimitados = productosOrdenados.slice(0, cantidad);

    // Buscar imágenes para cada producto
    const productosConImagenes = await Promise.all(
      productosLimitados.map(async (producto) => {
        const imagen = await buscarImagen(producto.producto); // Llamada a la función buscarImagen
        return {
          ...producto,
          imagen, // Añadir la imagen al producto
        };
      })
    );

    return res.json(productosConImagenes);
  } catch (error) {
    console.error("Error al ordenar los productos:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

app.listen(port, () => {
  console.log(`API escuchando en el puerto ${port}`);
});
