const BYTE_UNITS: string[] = [
	"B",
	"kB",
	"MB",
	"GB",
	"TB",
	"PB",
	"EB",
	"ZB",
	"YB",
];

const BI_BYTE_UNITS: string[] = [
	"B",
	"KiB",
	"MiB",
	"GiB",
	"TiB",
	"PiB",
	"EiB",
	"ZiB",
	"YiB",
];

const BIT_UNITS: string[] = [
	"b",
	"kbit",
	"Mbit",
	"Gbit",
	"Tbit",
	"Pbit",
	"Ebit",
	"Zbit",
	"Ybit",
];

const BI_BIT_UNITS: string[] = [
	"b",
	"kibit",
	"Mibit",
	"Gibit",
	"Tibit",
	"Pibit",
	"Eibit",
	"Zibit",
	"Yibit",
];

export default function byteFormat(
	number: number,
	{
		bits = false,
		binary = false,
		space = true,
		single = false,
		suffix = true,
		locale,
		signed,
		...option2
	}: {
		bits?: boolean;
		binary?: boolean;
		space?: boolean;
		single?: boolean;
		suffix?: boolean;
		locale?: string | string[] | boolean;
		signed?: boolean;
		option2?: Intl.NumberFormatOptions;
	}
): string {
	if (!Number.isFinite(number)) {
		throw new TypeError(
			`Expected a finite number, got ${typeof number}: ${number}`
		);
	}

	const UNITS = bits
		? binary
			? BI_BIT_UNITS
			: BIT_UNITS
		: binary
			? BI_BYTE_UNITS
			: BYTE_UNITS;

	const separator = space ? " " : "";

	if (signed && number === 0) {
		return ` 0${separator}${UNITS[0]}`;
	}

	const isNegative = number < 0;
	const prefix = isNegative ? "-" : signed ? "+" : "";

	if (isNegative) {
		number = -number;
	}

	if (number < 1) {
		return prefix + number + separator + UNITS[0];
	}

	const exponent = Math.min(
		Math.floor(
			binary ? Math.log(number) / Math.log(1024) : Math.log10(number) / 3
		),
		UNITS.length - 1
	);
	number /= (binary ? 1024 : 1000) ** exponent;

	if (!option2) {
		number = Number(number.toPrecision(3));
	}

	const unit = single ? UNITS[exponent][0] : UNITS[exponent];

	return prefix + number + (suffix ? separator + unit : "");
}