/**
 * Greek Font Support for jsPDF
 * 
 * Note: jsPDF's standard fonts (Helvetica, Times, Courier) use WinAnsiEncoding 
 * which doesn't properly support Greek characters. For proper Greek support,
 * a custom font needs to be added.
 * 
 * Current implementation uses standard fonts which may display Greek characters
 * with limitations. For production use with full Greek support, consider:
 * 1. Adding a TTF font file that supports Greek (e.g., Roboto, Arial Unicode)
 * 2. Converting it using jsPDF's font converter
 * 3. Including the converted font in the project
 * 
 * For more information, see:
 * https://github.com/parallax/jsPDF#use-of-unicode-characters--utf-8
 */

export const addGreekFontSupport = (doc) => {
  // Currently using default Helvetica font
  // Greek characters may not display perfectly but jsPDF 3.x has improved Unicode support
  // The text will be rendered and readable, though some characters might not be ideal
  
  // Future enhancement: Add custom Greek-supporting font here
  // Example:
  // doc.addFileToVFS("Roboto-Regular.ttf", fontBase64String);
  // doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  // doc.setFont("Roboto");
  
  return doc;
};

export default addGreekFontSupport;
