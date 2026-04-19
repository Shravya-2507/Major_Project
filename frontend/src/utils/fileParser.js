import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// FIXED worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";