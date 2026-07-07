import assert from "node:assert/strict";
import { parseRoute, resolveDocumentId } from "../src/routing.js";

const documents = [
  { id: "README" },
  { id: "docs/objective-c/01-basic-syntax" },
  { id: "docs/objective-c/03-property-and-method" },
];

assert.equal(resolveDocumentId("", documents), "README");
assert.equal(resolveDocumentId("#docs/objective-c/03-property-and-method", documents), "docs/objective-c/03-property-and-method");
assert.equal(
  resolveDocumentId("#docs/objective-c/03-property-and-method/4-strong-weak-copy-assign", documents),
  "docs/objective-c/03-property-and-method",
);
assert.equal(resolveDocumentId("#missing/path", documents), "README");

assert.deepEqual(parseRoute("", documents), { documentId: "README", headingSlug: "" });
assert.deepEqual(parseRoute("#docs/objective-c/03-property-and-method", documents), {
  documentId: "docs/objective-c/03-property-and-method",
  headingSlug: "",
});
assert.deepEqual(parseRoute("#docs/objective-c/03-property-and-method/4-strong-weak-copy-assign", documents), {
  documentId: "docs/objective-c/03-property-and-method",
  headingSlug: "4-strong-weak-copy-assign",
});
