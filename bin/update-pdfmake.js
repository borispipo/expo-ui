const path = require("path");
const fs = require("fs");
const {writeFile} = require("../electron/utils")
const ePdfmake  = path.resolve("./src","pdf","pdfmake");
const pdfmakeBuildPath = path.resolve(process.cwd(),"node_modules","pdfmake","build");
const pdfmakePath = path.resolve(pdfmakeBuildPath,"pdfmake.min.js"),
pdfmakeVsFontsPath = path.resolve(pdfmakeBuildPath,"vfs_fonts.js");
const localPdfmake = path.resolve("node_modules","pdfmake","build","pdfmake.min.js");
const pdfmakeDistPath = fs.existsSync(pdfmakePath)? pdfmakePath : fs.existsSync(localPdfmake)? localPdfmake : null;
if(pdfmakeDistPath && ePdfmake && fs.existsSync(ePdfmake)){
  const pdfmakePathHtml = path.resolve(ePdfmake,"pdfmake.html");
  const jsContent = fs.readFileSync(pdfmakeDistPath, 'utf8');
  const vfs_fonts = fs.existsSync(pdfmakeVsFontsPath) ? fs.readFileSync(pdfmakeVsFontsPath, 'utf8') : "";
  writeFile(pdfmakePathHtml,`
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script>
          ${jsContent};
          /*********** pdfmake vsfonts content*********/
          ${vfs_fonts};
      </script>
      </head>
      <body>
      </body>
    </html>
  `);
  console.log("native pdfmake updated");
}