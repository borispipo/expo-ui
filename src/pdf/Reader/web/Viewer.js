import React from "$react";
import View from "$ecomponents/View";
export default function PdfViewerWeb(){
    return <View testID="RN_PDF_WEBVIEW_COMPONENT">
        <div id="viewerContainer">
          <div id="viewer" class="pdfViewer"></div>
        </div>
        <div id="loadingBar">
          <div class="progress"></div>
          <div class="glimmer"></div>
        </div>
        <footer>
          <button class="toolbarButton pageUp" title="Previous Page" id="previous"></button>
          <button class="toolbarButton pageDown" title="Next Page" id="next"></button>
          <input type="number" id="pageNumber" class="toolbarField pageNumber" value="1" size="4" min="1"/>
          <button class="toolbarButton zoomOut" title="Zoom Out" id="zoomOut"></button>
          <button class="toolbarButton zoomIn" title="Zoom In" id="zoomIn"></button>
        </footer>
    </View>
}