const express = require("express");
const { obtenerPrecios, obtenerGrafica } = require("./scraper");

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

app.get("/productos/:nombre", async (req, res) => {
  try {
    const nombreProducto = req.params.nombre;
    const precios = await obtenerPrecios();
    const producto = precios.find((p) => p.producto === nombreProducto);
    if (producto) {
      producto.mas_info = await obtenerGrafica(nombreProducto);
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

app.listen(port, () => {
  console.log(`API escuchando en el puerto ${port}`);
});
