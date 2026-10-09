// Fills the church membership form. Runs in the browser (exposes window.MembershipPdf)
// and in Node for testing (module.exports).
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.MembershipPdf = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  // Standard Helvetica only encodes WinAnsi. Anything else becomes "?".
  // Names in Chinese or other scripts need an embedded Unicode font (see README).
  function clean(value) {
    return String(value == null ? "" : value)
      .normalize("NFKD")
      .replace(/[^\x20-\x7E -ÿ]/g, "?")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Shrink text until it fits the field width, down to 7 pt.
  function fitSize(font, text, size, maxWidth) {
    let s = size;
    while (s > 7 && font.widthOfTextAtSize(text, s) > maxWidth) s -= 0.5;
    return s;
  }

  // layout: parsed field-coordinates.json
  // data: { name, address, contact, dob, marital, family, baptised, baptism_year,
  //         baptism_church, baptism_interest, signed_name, date, ref, agree, soft_copy }
  // templateBytes: Uint8Array of the blank form
  // signaturePng: Uint8Array of the signature PNG, or null
  async function fillMembershipPdf(PDFLib, templateBytes, layout, data, signaturePng) {
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const ink = rgb(0.05, 0.1, 0.4);

    const doc = await PDFDocument.load(templateBytes);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();
    const toPdfY = (page, topY) => page.getHeight() - topY;

    for (const f of layout.text) {
      const value = clean(data[f.key]);
      if (!value) continue;
      const page = pages[f.page - 1];
      const size = fitSize(font, value, f.size, f.maxWidth);
      page.drawText(value, { x: f.x, y: toPdfY(page, f.y), size, font, color: ink });
    }

    for (const c of layout.checks) {
      if (!data[c.key]) continue;
      const page = pages[c.page - 1];
      page.drawText("X", { x: c.x, y: toPdfY(page, c.y), size: 10, font, color: ink });
    }

    if (signaturePng) {
      const img = await doc.embedPng(signaturePng);
      const s = layout.signature;
      const page = pages[s.page - 1];
      // Fit inside the signature box, keeping the aspect ratio, top-left anchored.
      const scale = Math.min(s.width / img.width, s.height / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      page.drawImage(img, { x: s.x, y: toPdfY(page, s.top) - h, width: w, height: h });
    }

    return doc.save();
  }

  return { fillMembershipPdf, clean };
});
