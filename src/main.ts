import './style.css'
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";

const file = document.getElementById('file') as HTMLInputElement | null;

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
});

function downloadAsFile(filename: string, content: string, mimeType = "application/json") {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

file?.addEventListener('change', async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (!files || files.length === 0) return;

    const loadFile = files[0];

    const buffer = await loadFile.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);

    const documentFile = zip.file("word/document.xml");
    const stylesFile = zip.file("word/styles.xml");

    if (!documentFile || !stylesFile) {
        console.error("Это не .docx файл или в нём нет нужных XML");
        return;
    }

    const documentXml = await documentFile.async("text");
    const stylesXml = await stylesFile.async("text");

    const document = parser.parse(documentXml);
    const styles = parser.parse(stylesXml);

    console.log(document);
    console.log(styles);

    // downloadAsFile("document.json", JSON.stringify(document, null, 2));
    // downloadAsFile("styles.json", JSON.stringify(styles, null, 2));
});