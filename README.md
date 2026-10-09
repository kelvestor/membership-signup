# Church membership form (free version)

Members fill in the form, draw their signature, and submit. The page fills the 316 Church membership PDF, Apps Script saves it to Drive, logs a row in a Google Sheet, and emails the signed PDF to the church and to the member.

Everything runs on free services: GitHub Pages (hosting), Google Apps Script, Gmail, Drive and Sheets. Libraries: signature_pad 4.1.7 (MIT) and pdf-lib 1.17.1 (MIT), loaded from jsdelivr.

## Files

| File | Public? | Purpose |
|---|---|---|
| `index.html` | Yes | The form page. Contains the Apps Script URL and the token. |
| `fill-pdf.js` | Yes | Writes the answers and signature onto the PDF. |
| `form-template.pdf` | Yes | The blank 316 Church membership form. |
| `field-coordinates.json` | Yes | Where each answer goes on the PDF. |
| `apps-script/Code.gs` | **No** | Back end. Contains the church email, Drive folder ID, Sheet ID and token. Keep it out of the public repo. |

## 1. Google account, Drive folder and Sheet

1. Use the church's Google account. A free Gmail account can send about 100 emails a day. Each submission sends two, so about 50 submissions a day. Google Workspace allows more.
2. Drive: create a folder called `Membership forms`. Copy its ID from the URL, the part after `/folders/`.
3. Sheets: create a new spreadsheet. Rename the first tab to `Submissions`. Copy the ID from the URL, the part between `/d/` and `/edit`.

## 2. Choose a token

Make up a long random string, for example 30+ letters and digits. Put the same string in two places: `CONFIG.TOKEN` in `index.html` and `CONFIG.TOKEN` in `Code.gs`.

The token is visible to anyone who views the page source. It only stops casual spam. Gmail's daily limit is the backstop.

## 3. Deploy the Apps Script back end

1. Go to [script.google.com](https://script.google.com) and click **New project**.
2. Delete the default code, paste in `apps-script/Code.gs`, and fill in `CONFIG`: token, church email, Drive folder ID and Sheet ID.
3. Click **Deploy → New deployment**. Type: **Web app**. Execute as: **Me**. Who has access: **Anyone**.
4. Click **Deploy** and authorise the permissions it asks for (Drive, Sheets, Gmail). Google may show an "unverified app" warning. Choose **Advanced**, then continue. This is your own script.
5. Copy the **Web app URL**. It ends in `/exec`.
6. Open that URL in a browser. You should see `{"ok":true,"service":"membership-form"}`.

If you change `Code.gs` later, go to **Deploy → Manage deployments → Edit → New version → Deploy**. Otherwise the old code keeps running.

## 4. Connect the page to the back end

In `index.html`, replace the two placeholders in `CONFIG`:

```js
const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/XXXX/exec",
  TOKEN: "the same token as Code.gs",
};
```

## 5. Publish on GitHub Pages (free)

GitHub Pages is free only for public repositories.

1. Create a free account at [github.com](https://github.com) if you don't have one.
2. Click **New repository**. Name it `membership-signup`. Choose **Public**. Click **Create repository**.
3. Click **uploading an existing file**. Drag in `index.html`, `fill-pdf.js`, `form-template.pdf` and `field-coordinates.json`. Do **not** upload the `apps-script` folder. Click **Commit changes**.
4. Go to **Settings → Pages**. Under **Build and deployment**, set Source to **Deploy from a branch**, Branch to `main`, folder `/ (root)`. Click **Save**.
5. Wait about a minute. The site will be at `https://YOUR-USERNAME.github.io/membership-signup/`.

Because the repository is public, anyone can read `index.html`, including the Apps Script URL and the token. The form PDF is public too. Only publish if the church has agreed to its form being online.

## 6. Test before you share the link

1. Set `CONFIG.CHURCH_EMAIL` in `Code.gs` to your own address for the first test. Deploy a new version after changing it.
2. Submit one test form on the live page, using your own email for the member copy.
3. Check: the email arrives with a PDF attached, the Drive folder has the file, and the Sheet has a new row.
4. Open the attached PDF and check that the answers, the signature and the checkboxes are in the right places.
5. Switch `CHURCH_EMAIL` back to the church's address and deploy a new version.

## Known limits

- **Names:** the PDF uses the standard Helvetica font, which handles Latin letters and common accents. Names in Chinese or other scripts show as `?`. Fixing this means embedding a Unicode font file, which I can add later.
- **Long text:** text shrinks to fit each line, down to 7 pt. Very long addresses may still look cramped.
- **Signature:** this is a drawn signature. It is not a cryptographic digital signature. The Sheet records a reference number and a SHA-256 hash of each PDF, so the document can be shown to be unchanged since submission. IP addresses are not available to Apps Script.
- **Consent:** the consent text on the page is a short placeholder. Replace it with the church's full PDPA notice before going live.
- **Retries:** if the browser shows an error after submitting, check the Sheet before resubmitting. A row may already have been saved.
- **Daily limit:** about 50 submissions a day on a free Gmail account.
