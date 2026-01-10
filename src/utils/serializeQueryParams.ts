export function serializeQueryParams(
  params: Record<string, string | string[] | undefined>
): string {
  try {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;

      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item));
      } else {
        searchParams.append(key, value);
      }
    }

    return searchParams.toString();
  } catch (error) {
    throw new Error(`序列化query失败: ${error}`);
  }
}
