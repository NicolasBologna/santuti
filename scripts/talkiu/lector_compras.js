const fs = require("fs");
const pdfParse = require("pdf-parse");
const path = require("path");

const proveedor = "Bidcom S.R.L.";
const marca = "GADNIC";

(async () => {
  // Buscar el primer archivo PDF en el directorio actual
  const files = fs.readdirSync(".");
  const pdfFile = files.find(f => f.toLowerCase().endsWith(".pdf"));

  if (!pdfFile) {
    console.error("❌ No se encontró ningún archivo PDF en la carpeta.");
    process.exit(1);
  }

  const pdfPath = path.join(".", pdfFile);
  const buffer = fs.readFileSync(pdfPath);

  const data = await pdfParse(buffer);
  const lines = data.text.split("\n").map(line => line.trim()).filter(Boolean);

  // Extraer la fecha de confirmación
  const fechaLineIndex = lines.findIndex(l => l.includes("Fecha de confirmación de propuesta"));
  let fechaConfirmacion = "";
  if (fechaLineIndex !== -1 && lines[fechaLineIndex + 1]) {
    fechaConfirmacion = lines[fechaLineIndex + 1].split(" ")[0]; // formato: 29/04/2025
  }

  const productos = [];
  let modelo = "";
  let descripcion = "";
  let unidades = "";
  let precioUnitario = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detectar línea con precio y cantidad (pegados)
    const match = line.match(/\$(\d{1,3}(?:\.\d{3})*,\d{2})(\d+)/);
    if (match) {
      precioUnitario = match[1].replace(/\./g, "").replace(",", ".");
      unidades = match[2];

      productos.push({
        Proveedor: proveedor,
        Marca: marca,
        Especificaciones: descripcion,
        Modelo: modelo,
        "Fecha de confirmación": fechaConfirmacion,
        "Unidades en stock": unidades,
        Talkiu: parseFloat(precioUnitario),
      });

      // Reset
      modelo = "";
      descripcion = "";
      unidades = "";
      precioUnitario = "";
    }

    // Detección de modelo
    if (line.match(/^[A-Z0-9]{5,}\s\|\s[A-Z0-9]{5,}/)) {
      const parts = line.split("|");
      modelo = parts[0].trim();
    }

    // Descripción
    if (modelo && !descripcion) {
      descripcion = line;
    }
  }

  // Generar archivo .txt con tabulaciones (para copiar en Sheets)
  const headers = [
    "Proveedor",
    "Marca",
    "Especificaciones",
    "Modelo",
    "Fecha de confirmación",
    "Unidades en stock",
    "Talkiu"
  ];
  const rows = productos.map(p =>
    [p.Proveedor, p.Marca, p.Especificaciones, p.Modelo, p["Fecha de confirmación"], p["Unidades en stock"], p.Talkiu].join("\t")
  );

  const output = [headers.join("\t"), ...rows].join("\n");
  fs.writeFileSync("gadnic_productos.txt", output);
  console.log("✅ Archivo generado: gadnic_productos.txt (copiable en Google Sheets)");
})();
