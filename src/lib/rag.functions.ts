import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const listDocuments = createServerFn({ method: "GET" }).handler(async () => {
  const { listDocumentsImpl } = await import("./rag.server");
  return listDocumentsImpl();
});

export const addDocument = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({ title: z.string().min(1).max(300), content: z.string().min(20).max(400_000) })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { addDocumentImpl } = await import("./rag.server");
    return addDocumentImpl(data.title.trim(), data.content);
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
