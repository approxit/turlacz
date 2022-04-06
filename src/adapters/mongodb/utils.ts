export function removeUndefinedKeys<T extends Record<string, any>>(obj: T): T {
	Object.entries(obj).map(([k, v]) => {
		if (v === undefined) {
			delete obj[k];
		}
	});

	return obj;
}
