# API de Precios de Productos

Esta API permite obtener información sobre los precios de productos y generar gráficos de precios.

---

## **Requisitos previos**

1. Node.js (versión 14 o superior) instalado en tu sistema.
2. Instalar las dependencias necesarias:
   ```bash
   npm install
   ```

---

## **Cómo ejecutar la API**

1. Clona este repositorio en tu máquina local:

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd <NOMBRE_DEL_REPOSITORIO>
   ```

2. Inicia el servidor:

   ```bash
   npm start
   ```

3. La API estará disponible en [http://127.0.0.1:3000](http://127.0.0.1:3000).

---

## **Endpoints disponibles**

### 1. `/productos`

- **Método:** GET
- **Descripción:** Devuelve una lista de precios de productos.
- **Ejemplo de respuesta:**
  ```json
  [
    {
      "nombre": "Maíz",
      "precio": 1200
    },
    {
      "nombre": "Trigo",
      "precio": 1400
    }
  ]
  ```

### 2. `/productos/:nombre`

- **Método:** GET
- **Descripción:** Devuelve información detallada de un producto específico, incluyendo un enlace a más información.
- **Parámetros de URL:**
  - `nombre` (string): El nombre del producto.
- **Ejemplo de respuesta:**
  ```json
  {
    "nombre": "Maíz",
    "precio": 1200,
    "enlace": "https://www.agronegocios.co/precios/maiz"
  }
  ```

### 3. `/grafica_producto`

- **Método:** POST
- **Descripción:** Genera un gráfico de precios para un producto específico.
- **Cuerpo de la solicitud (JSON):**
  ```json
  {
    "producto": "Maíz"
  }
  ```
- **Ejemplo de respuesta:**
  ```json
  {
    "mensaje": "Gráfico generado con éxito.",
    "enlace_grafico": "https://www.ejemplo.com/graficos/maiz"
  }
  ```

---

## **Errores comunes**

1. **Producto no encontrado**

   - Verifica que el nombre del producto en la solicitud sea exacto al que aparece en la lista de productos.

2. **Error al obtener los precios**
   - Asegúrate de que la URL de la API de precios ([https://www.agronegocios.co/precios](https://www.agronegocios.co/precios)) esté accesible y funcionando correctamente.

---

## **Notas adicionales**

- Esta API utiliza Puppeteer y Cheerio para obtener y procesar los datos de precios de productos.
- Puedes modificar el puerto en el archivo `index.js` si es necesario.

---

¡Disfruta de la API!
