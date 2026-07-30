/** Hiển thị câu trả lời dạng markdown đơn giản (đậm, gạch đầu dòng, xuống dòng). */
export function AnswerText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);

  return (
    <div className="prose-answer text-[0.95rem]">
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const isList = lines.every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l));
        if (isList) {
          return (
            <ul key={bi}>
              {lines.map((line, li) => (
                <li key={li}>{inline(line.replace(/^\s*([-*•]|\d+[.)])\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi}>
            {lines.map((line, li) => (
              <span key={li}>
                {inline(line)}
                {li < lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part.replace(/^#{1,6}\s*/, "")}</span>
    ),
  );
}
