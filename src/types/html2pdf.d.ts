declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number
    filename?: string
    image?: {
      type?: string
      quality?: number
    }
    html2canvas?: {
      scale?: number
      useCORS?: boolean
      backgroundColor?: string
      logging?: boolean
      windowWidth?: number
    }
    jsPDF?: {
      unit?: string
      format?: string | number[]
      orientation?: 'portrait' | 'landscape'
      putOnlyUsedFonts?: boolean
      compress?: boolean
    }
  }

  interface Html2PdfInstance {
    set: (options: Html2PdfOptions) => Html2PdfInstance
    from: (element: HTMLElement) => Html2PdfInstance
    save: () => Promise<void>
  }

  function html2pdf(): Html2PdfInstance
  export = html2pdf
} 