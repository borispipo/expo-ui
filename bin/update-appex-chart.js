const path = require("path");
const fs = require("fs");
const {writeFile} = require("../bin/utils")
const $ecomponents = path.resolve("./src/components");
const eAppex  = path.resolve($ecomponents,"Chart","appexChart");
const cwdApexChart = path.resolve(process.cwd(),"node_modules","apexcharts","dist","apexcharts.min.js");
const localApexChart = path.resolve("node_modules","apexcharts","dist","apexcharts.min.js");
const appexDistPath = fs.existsSync(cwdApexChart)? cwdApexChart : fs.existsSync(localApexChart)? localApexChart : null;
if(appexDistPath && eAppex && fs.existsSync(eAppex)){
  const appexPathHtml = path.resolve(eAppex,"appexChart.html");
  const jsContent = fs.readFileSync(appexDistPath, 'utf8')
  writeFile(appexPathHtml,`
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script>${jsContent}</script>
      </head>
      <body>
      </body>
    </html>
  `);
  console.log("native apexChart updated");
}