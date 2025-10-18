type QueryValue = string | number | boolean | null | undefined | (string | number | boolean)[];
export type QueryParams = Record<string, QueryValue>;

interface QueriedUrl {
  url: string;
  query?: QueryParams;
}

export function getQueriedUrl({ url, query }: QueriedUrl): string {
  if (!query) return url;

  const params = Object.entries(query)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        // формат "comma"
        return `${encodeURIComponent(key)}=${encodeURIComponent(value.join(","))}`;
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    })
    .join("&");

  return params ? `${url}?${params}` : url;
}
