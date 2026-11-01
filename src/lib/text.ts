/** Lowercase and strip Vietnamese diacritics (incl. đ) for matching. Safe for client use. */
export function foldText(text: string): string {
  return text
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
