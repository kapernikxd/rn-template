const fs = require("fs");
const path = require("path");

/**
 * ⬇️ МЕНЯЙ ЗДЕСЬ
 */
const TARGET_FILE = "sr.json"; // файл, который обновляем
const SOURCE_FILE = "sr.json"; // файл-эталон
// ------------------

const TARGET_DIR = "locales";
const SOURCE_DIR = "import";

function isPlainObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Результат:
 * - ключи идут в порядке SOURCE
 * - значения берём из TARGET (если есть), иначе из SOURCE
 * - дополнительные ключи из TARGET (которых нет в SOURCE) НЕ теряем — добавляем в конец
 * - рекурсивно для вложенных объектов
 */
function mergeKeepTargetExtrasWithSourceOrder(target, source) {
  const result = {};

  // 1) сначала все ключи из source в нужном порядке
  for (const key of Object.keys(source)) {
    if (key in target) {
      const tVal = target[key];
      const sVal = source[key];

      if (isPlainObject(tVal) && isPlainObject(sVal)) {
        result[key] = mergeKeepTargetExtrasWithSourceOrder(tVal, sVal);
      } else {
        // ключ есть в target — оставляем его значение (не перезаписываем)
        result[key] = tVal;
      }
    } else {
      // ключа нет в target — добавляем из source
      result[key] = source[key];
    }
  }

  // 2) потом добавляем "лишние" ключи из target (которых нет в source) — в их порядке
  for (const key of Object.keys(target)) {
    if (!(key in source)) {
      result[key] = target[key];
    }
  }

  return result;
}

const targetPath = path.resolve(__dirname, TARGET_DIR, TARGET_FILE);
const sourcePath = path.resolve(__dirname, SOURCE_DIR, SOURCE_FILE);

const targetJson = JSON.parse(fs.readFileSync(targetPath, "utf8"));
const sourceJson = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

const merged = mergeKeepTargetExtrasWithSourceOrder(targetJson, sourceJson);

fs.writeFileSync(targetPath, JSON.stringify(merged, null, 2), "utf8");

console.log(
  `✅ "${TARGET_DIR}/${TARGET_FILE}" дополнен из "${SOURCE_DIR}/${SOURCE_FILE}" (порядок как в source, extras сохранены)`
);
