import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const listDocuments = createServerFn({ method: "GET" }).handler(async () => {
  const { listDocumentsImpl } = await import("./rag.server");
  return listDocumentsImpl();
});

export const findDocumentByHash = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ hash: z.string().min(8).max(128) }).parse(input))
  .handler(async ({ data }) => {
    const { findByHashImpl } = await import("./rag.server");
    return findByHashImpl(data.hash);
  });

export const addDocument = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().min(1).max(300),
        pages: z.array(z.string()).min(1).max(2000),
        fileName: z.string().max(300).optional(),
        fileType: z.string().max(20).optional(),
        contentHash: z.string().min(8).max(128).optional(),
        needsOcr: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { addDocumentImpl } = await import("./rag.server");
    return addDocumentImpl({ ...data, title: data.title.trim() });
  });

export const seedSampleDocuments = createServerFn({ method: "POST" }).handler(async () => {
  const { seedSampleDocumentsImpl } = await import("./rag.server");
  return seedSampleDocumentsImpl();
});

export const deleteDocument = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { deleteDocumentImpl } = await import("./rag.server");
    return deleteDocumentImpl(data.id);
  });

export const getMessages = createServerFn({ method: "GET" }).handler(async () => {
  const { getMessagesImpl } = await import("./rag.server");
  return getMessagesImpl();
});

export const clearMessages = createServerFn({ method: "POST" }).handler(async () => {
  const { clearMessagesImpl } = await import("./rag.server");
  return clearMessagesImpl();
});

export const askQuestion = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ question: z.string().min(2).max(2000) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { askImpl } = await import("./rag.server");
    return askImpl(data.question.trim());
  });
