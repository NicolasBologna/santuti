const puppeteer = require('puppeteer');
const XLSX = require('xlsx');

const productos = {
    'MASAJ301': 33898,
    'AV000212': 22357,
    'KPARRI03': 19940,
    'PARLN019': 26134,
    'CWIR0001': 16314,
    'P2P00047': 36255,
    'P2P00053': 51361,
    'CORTPE01': 38181,
    'ESTIMU10': 33717,
    'TETE0001': 17372,
    'GRINDER3': 12054,
    'BC000343': 21148
};

const codigos = Object.keys(productos);

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const resultados = [];

    for (let i = 0; i < codigos.length; i++) {
        const codigo = codigos[i];
        const url = `https://www.gadnic.com.ar/buscar?s=${codigo}`;
        const costo = productos[codigo];

        console.log(`[${i + 1}/${codigos.length}] Buscando: ${codigo}`);

        try {
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            const info = await page.evaluate(() => {
                const getText = (selector) => {
                    const el = document.querySelector(selector);
                    return el ? el.textContent.trim() : '';
                };

                const descripcion = (() => {
                    const el = document.getElementById('texto_descripcion_producto');
                    return el ? el.textContent.trim().replace(/\s+/g, ' ') : '';
                })();

                return {
                    titulo: getText('h1.title.principal_title'),
                    precioActual: getText('#precio'),
                    descripcion: descripcion
                };
            });

            const precioWeb = parseInt(info.precioActual.replace(/\D/g, '')) || 0;
            const base = Math.round(costo * 1.65);
            const margenMin = 1.35;
            let precioVenta;
            let reglaAplicada;
            let margenPorcentaje = '-';
            let diferenciaVsWeb = '-';

            if (!precioWeb) {
                precioVenta = base;
                reglaAplicada = 'Sin precio web – Margen 1.65';
            } else if (precioWeb > base) {
                const descuento10 = Math.round(precioWeb * 0.9);
                precioVenta = descuento10 > base ? descuento10 : base;
                reglaAplicada = 'Precio web > base – 10% menos del web';
            } else {
                const margen = precioWeb / costo;
                if (margen >= margenMin) {
                    precioVenta = Math.round(precioWeb * 0.95);
                    reglaAplicada = 'Precio web < base pero margen ≥ 1.35 – se usa web -5%';
                } else {
                    precioVenta = 'XXX';
                    reglaAplicada = 'Precio web < base y margen < 1.35 – se rechaza';
                }
            }

            if (typeof precioVenta === 'number') {
                margenPorcentaje = (((precioVenta - costo) / costo) * 100).toFixed(2) + '%';
                if (precioWeb) {
                    diferenciaVsWeb = (precioWeb - precioVenta) > 0 ? `$${precioWeb - precioVenta}` : '$0';
                }
            }

            const imageUrl = `${codigo}.jpg`;
            const dues3 = typeof precioVenta === 'number' ? Math.ceil(precioVenta / 3) : '-';
            const dues6 = typeof precioVenta === 'number' ? Math.ceil(precioVenta / 6) : '-';

            resultados.push({
                name: info.titulo,
                id: codigo,
                price: precioVenta,
                dues_3: dues3,
                dues_6: dues6,
                stock: '',
                category: 'gadnic',
                description: info.descripcion,
                image: imageUrl,
                'Precio Web': precioWeb || 'No encontrado',
                Costo: costo,
                'Precio Venta': precioVenta,
                'Margen %': margenPorcentaje,
                'Diferencia vs Web': diferenciaVsWeb,
                Regla: reglaAplicada
            });

            console.log(`→ OK: ${info.titulo}`);
        } catch (err) {
            console.error(`→ Error con ${codigo}: ${err.message}`);
            resultados.push({
                name: 'Error',
                id: codigo,
                price: 'XXX',
                dues_3: '-',
                dues_6: '-',
                stock: '',
                category: 'gadnic',
                description: '',
                image: `${codigo}.jpg`,
                'Precio Web': 'Error',
                Costo: costo,
                'Precio Venta': 'XXX',
                'Margen %': '-',
                'Diferencia vs Web': '-',
                Regla: 'Error en scraping'
            });
        }
    }

    await browser.close();

    const ws = XLSX.utils.json_to_sheet(resultados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    XLSX.writeFile(wb, `productos_gadnic_${formattedDate}.xlsx`);

    console.log('\n✅ Excel generado: productos_gadnic_' + formattedDate + '.xlsx');
})();
