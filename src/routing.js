export function resolveDocumentId(hash, documents, fallbackId = "README") {
  return parseRoute(hash, documents, fallbackId).documentId;
}

export function parseRoute(hash, documents, fallbackId = "README") {
  const value = decodeURIComponent(hash.replace(/^#/, ""));
  if (!value) return { documentId: fallbackId, headingSlug: "" };

  const sorted = [...documents].sort((a, b) => b.id.length - a.id.length);
  const match = sorted.find((doc) => value === doc.id || value.startsWith(`${doc.id}/`));
  if (!match) return { documentId: fallbackId, headingSlug: "" };

  return {
    documentId: match.id,
    headingSlug: value === match.id ? "" : value.slice(match.id.length + 1),
  };
}
