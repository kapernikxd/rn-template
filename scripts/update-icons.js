#!/usr/bin/env node
/**
 * Скрипт принимает путь к SVG-файлу и пересоздаёт ресурсы иконок в папке `assets`.
 * Использование:
 *   node scripts/update-icons.js ./path/to/icon.svg
 * Перед запуском убедитесь, что установлен глобальный sharp-cli (npm install -g sharp-cli).
 *
 * Важно: исходный SVG должен быть квадратным и иметь viewBox не меньше 1024x1024 пикселей.
 * Это гарантирует, что экспортируемые PNG-файлы (до 1024x1024) будут чёткими и без артефактов.
 */
const path = require('path');
const fs = require('fs/promises');
const { findSharpInstanceAsync, isAvailableAsync } = require('@expo/image-utils');

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const TARGETS = [
  { name: 'adaptive-icon.png' },
  { name: 'favicon.png' },
  { name: 'icon.png' },
  { name: 'notification-icon.png', fallbackSize: 96 },
  { name: 'splash-icon.png' },
];

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

async function ensureSizeForTarget(target, assetsDir) {
  const existingPath = path.join(assetsDir, target.name);
  const size = await readPngSize(existingPath);
  if (size) {
    return size;
  }
  if (target.fallbackSize) {
    return { width: target.fallbackSize, height: target.fallbackSize };
  }
  throw new Error(
    `Не удалось определить размер для ${target.name}. ` +
      `Создайте временный PNG вручную или добавьте fallbackSize в конфигурацию.`
  );
}

async function main() {
  const svgPathArg = process.argv[2];
  if (!svgPathArg) {
    console.error('Укажите путь к SVG-файлу. Пример: node scripts/update-icons.js ./icon.svg');
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

  if (!(await isAvailableAsync())) {
    throw new Error(
      'Не найден установленный sharp-cli. Установите его глобально: npm install -g sharp-cli'
    );
  }

  const sharp = await findSharpInstanceAsync();

  for (const target of TARGETS) {
    const { width, height } = await ensureSizeForTarget(target, assetsDir);
    const outputPath = path.join(assetsDir, target.name);

    await sharp(svgPath, { density: Math.max(width, height) })
      .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outputPath);

    console.log(`Создан ${target.name} (${width}x${height})`);
  }

  console.log('Иконки успешно обновлены.');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
