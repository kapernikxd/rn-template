#!/usr/bin/env node
/**
 * Скрипт принимает путь к SVG-файлу и пересоздаёт ресурсы иконок в папке `assets`.
 * Использование:
 *   npm run update:icons -- ./path/to/icon.svg
 *   (или) node scripts/update-icons.js ./path/to/icon.svg
 *
 * Требования:
 *   - Установлен пакет sharp (npm i -D sharp)
 *   - Исходный SVG квадратный и с viewBox не меньше 1024x1024
 */

const path = require('path');
const fs = require('fs/promises');
let sharp;
try {
  sharp = require('sharp');
} catch (_) {
  console.error(
    'Пакет "sharp" не найден. Установите его локально: npm i -D sharp'
  );
  process.exit(1);
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/**
 * Целевые файлы и размеры по умолчанию (если нельзя определить из существующих PNG).
 * Можно подстроить под свой проект.
 */
const TARGETS = [
  { name: 'adaptive-icon.png', defaultSize: 1024 },
  { name: 'favicon.png',       defaultSize: 512  },
  { name: 'icon.png',          defaultSize: 1024 },
  { name: 'notification-icon.png', defaultSize: 96 }, // стандартный notification
  { name: 'splash-icon.png',   defaultSize: 1024 },
];

/* ----------------------- utils ----------------------- */

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function readPngSize(filePath) {
  try {
    const data = await fs.readFile(filePath);
    if (data.length < 24) {
      throw new Error(`Файл ${filePath} повреждён или имеет неверный формат PNG`);
    }
    if (!data.subarray(0, 8).equals(PNG_SIGNATURE)) {
      throw new Error(`Файл ${filePath} не является PNG`);
    }
    const width = data.readUInt32BE(16);
    const height = data.readUInt32BE(20);
    return { width, height };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Пытаемся достать viewBox из SVG для проверки квадратности и минимального размера.
 * Если извлечь не удалось — просто вернём null (не критично).
 */
async function readSvgViewBox(svgPath) {
  try {
    const content = await fs.readFile(svgPath, 'utf8');
    // Ищем viewBox="minX minY width height"
    const m = content.match(/viewBox\s*=\s*"([\d.\-eE]+)\s+([\d.\-eE]+)\s+([\d.\-eE]+)\s+([\d.\-eE]+)"/i);
    if (!m) return null;
    const [, , , wStr, hStr] = m;
    const w = Number(wStr);
    const h = Number(hStr);
    if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
    return { width: w, height: h };
  } catch {
    return null;
  }
}

async function ensureSizeForTarget(target, assetsDir) {
  const existingPath = path.join(assetsDir, target.name);
  const size = await readPngSize(existingPath);
  if (size) return size;

  const s = target.defaultSize || target.fallbackSize;
  if (s) return { width: s, height: s };

  throw new Error(
    `Не удалось определить размер для ${target.name}. ` +
      `Либо положите временный PNG в assets/, либо задайте defaultSize/fallbackSize для цели.`
  );
}

/* ----------------------- main ----------------------- */

async function main() {
  const svgPathArg = process.argv[2];
  if (!svgPathArg) {
    console.error('Укажите путь к SVG-файлу. Пример: npm run update:icons -- ./assets/icon.svg');
    process.exit(1);
  }

  const svgPath = path.resolve(process.cwd(), svgPathArg);
  try {
    const stats = await fs.stat(svgPath);
    if (!stats.isFile()) {
      throw new Error('Указанный путь не является файлом');
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`Файл ${svgPath} не найден.`);
      process.exit(1);
    }
    throw error;
  }

  if (path.extname(svgPath).toLowerCase() !== '.svg') {
    console.warn('Предупреждение: ожидается SVG-файл. Продолжаю обработку.');
  }

  const repoRoot = path.resolve(__dirname, '..');
  const assetsDir = path.join(repoRoot, 'assets');
  await ensureDir(assetsDir);

  // Мягкая проверка viewBox — предупредим, если неквадратный или меньше 1024
  const vb = await readSvgViewBox(svgPath);
  if (vb) {
    const isSquare = Math.abs(vb.width - vb.height) < 1e-6;
    if (!isSquare) {
      console.warn(`⚠️  SVG viewBox не квадратный (${vb.width}x${vb.height}). Рекомендуется квадратный >= 1024x1024.`);
    } else if (vb.width < 1024 || vb.height < 1024) {
      console.warn(`⚠️  SVG viewBox меньше 1024x1024 (${vb.width}x${vb.height}). Возможна потеря качества при экспорте.`);
    }
  } else {
    console.warn('ℹ️  Не удалось определить viewBox из SVG. Пропускаю проверку квадратности/минимального размера.');
  }

  for (const target of TARGETS) {
    const { width, height } = await ensureSizeForTarget(target, assetsDir);
    const outputPath = path.join(assetsDir, target.name);

    // density повышаем до требуемой стороны, чтобы острее растрировать в PNG
    const density = Math.max(width, height);

    await sharp(svgPath, { density })
      .resize(width, height, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(outputPath);

    console.log(`Создан ${target.name} (${width}x${height})`);
  }

  console.log('Иконки успешно обновлены.');
}

main().catch((error) => {
  console.error(error?.stack || error?.message || error);
  process.exit(1);
});



// npm run update:icons -- ./assets/favicon-300.svg