const fs = require("fs")
const path = require("path")

const localePaths = {
	en: path.join("src", "i18n", "locales", "en.json"),
	ru: path.join("src", "i18n", "locales", "ru.json"),
	az: path.join("src", "i18n", "locales", "az.json")
}

function walk(dir) {
	let out = []
	for (const name of fs.readdirSync(dir)) {
		const p = path.join(dir, name)
		const st = fs.statSync(p)
		if (st.isDirectory()) out = out.concat(walk(p))
		else if (/\.(ts|tsx)$/.test(p)) out.push(p)
	}
	return out
}

function flatten(obj, prefix = "", out = {}) {
	if (Array.isArray(obj)) {
		for (let i = 0; i < obj.length; i++) {
			const key = prefix ? `${prefix}.${i}` : String(i)
			const v = obj[i]
			if (v && typeof v === "object") flatten(v, key, out)
			else out[key] = v
		}
		return out
	}

	if (obj && typeof obj === "object") {
		for (const [k, v] of Object.entries(obj)) {
			const key = prefix ? `${prefix}.${k}` : k
			if (v && typeof v === "object") flatten(v, key, out)
			else out[key] = v
		}
	}

	return out
}

function setDeep(obj, dotted, value) {
	const parts = dotted.split(".")
	let cur = obj
	for (let i = 0; i < parts.length - 1; i++) {
		const part = parts[i]
		const next = parts[i + 1]
		const nextIsIndex = /^\d+$/.test(next)

		if (Array.isArray(cur)) {
			const idx = Number(part)
			if (cur[idx] === undefined || typeof cur[idx] !== "object") {
				cur[idx] = nextIsIndex ? [] : {}
			}
			cur = cur[idx]
		} else {
			if (cur[part] === undefined || typeof cur[part] !== "object") {
				cur[part] = nextIsIndex ? [] : {}
			}
			cur = cur[part]
		}
	}

	const last = parts[parts.length - 1]
	if (Array.isArray(cur) && /^\d+$/.test(last)) {
		cur[Number(last)] = value
	} else {
		cur[last] = value
	}
}

const files = walk("src")
const re = /\bt\(\s*['\"]([^'\"]+)['\"]\s*(?:,\s*['\"]([^'\"]*)['\"])?/g
const used = new Map()

for (const file of files) {
	const txt = fs.readFileSync(file, "utf8")
	let m
	while ((m = re.exec(txt))) {
		const key = m[1]
		const fallback = m[2] || null
		if (!used.has(key)) used.set(key, fallback)
		else if (!used.get(key) && fallback) used.set(key, fallback)
	}
}

const locales = {
	en: JSON.parse(fs.readFileSync(localePaths.en, "utf8")),
	ru: JSON.parse(fs.readFileSync(localePaths.ru, "utf8")),
	az: JSON.parse(fs.readFileSync(localePaths.az, "utf8"))
}

function missingCount(localeObj) {
	const f = flatten(localeObj)
	let miss = 0
	for (const key of used.keys()) {
		if (f[key] === undefined) miss++
	}
	return miss
}

function missingKeys(localeObj) {
	const f = flatten(localeObj)
	const missing = []
	for (const key of used.keys()) {
		if (f[key] === undefined) missing.push(key)
	}
	return missing.sort()
}

const missingBefore = {
	en: missingCount(locales.en),
	ru: missingCount(locales.ru),
	az: missingCount(locales.az)
}

for (const lang of ["en", "ru", "az"]) {
	const f = flatten(locales[lang])
	for (const key of used.keys()) {
		if (f[key] === undefined) {
			const fallback = used.get(key)
			const fromEn = flatten(locales.en)[key]
			const value = fromEn ?? fallback ?? key.split(".").slice(-1)[0].replace(/_/g, " ")
			setDeep(locales[lang], key, value)
		}
	}
}

fs.writeFileSync(localePaths.en, JSON.stringify(locales.en, null, 2))
fs.writeFileSync(localePaths.ru, JSON.stringify(locales.ru, null, 2))
fs.writeFileSync(localePaths.az, JSON.stringify(locales.az, null, 2))

const missingAfter = {
	en: missingCount(locales.en),
	ru: missingCount(locales.ru),
	az: missingCount(locales.az)
}

console.log(JSON.stringify({
	usedKeys: used.size,
	missingBefore,
	missingAfter,
	ruMissingKeys: missingKeys(locales.ru),
	azMissingKeys: missingKeys(locales.az)
}, null, 2))
