import { PDFDocument, StandardFonts, rgb, PDFString } from 'pdf-lib';
import type { PDFFont, PDFPage } from 'pdf-lib';
import { pdfText } from './pdf-guides.ts';
import type { TopicGuide } from './pdf-guides.ts';

const brand='For Elaine Only Reviewer',W=595.28,H=841.89,M=48,BOTTOM=60;
export async function renderTopicPDF(guide:TopicGuide):Promise<Uint8Array>{
 const doc=await PDFDocument.create(),regular=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold),serif=await doc.embedFont(StandardFonts.TimesRomanBold);
 doc.setTitle(pdfText(`${guide.title} - ${brand}`));doc.setAuthor(brand);doc.setSubject('PNLE practice questions, choice rationales, and clinical case notes');doc.setLanguage('en-PH');
 const berry=rgb(.51,.19,.34),ink=rgb(.22,.15,.19),muted=rgb(.43,.31,.38),pale=rgb(254/255,181/255,192/255);
 // Standard-font text is emitted without pair kerning. Measure the glyph
 // advances that readers actually use, so long lines stay inside the margins.
 const advances=new Map<PDFFont,Map<string,number>>();
 function measure(text:string,font:PDFFont,size:number){let cache=advances.get(font);if(!cache){cache=new Map();advances.set(font,cache);}let sum=0;for(const char of text){let width=cache.get(char);if(width===undefined){width=font.widthOfTextAtSize(char,1);cache.set(char,width);}sum+=width;}return sum*size;}
 let page:PDFPage,y=0;
 function newPage(){page=doc.addPage([W,H]);y=H-70;page.drawRectangle({x:0,y:H-52,width:W,height:52,color:pale});page.drawText(brand,{x:M,y:H-36,size:10,font:bold,color:berry});let title=pdfText(guide.title);while(measure(title,regular,8)>260)title=title.slice(0,-4)+'...';page.drawText(title,{x:W-M-measure(title,regular,8),y:H-36,size:8,font:regular,color:muted});}
 function ensure(height:number){if(y-height<BOTTOM)newPage();}
 function lines(text:string,font:PDFFont,size:number,width=W-2*M){
  const output:string[]=[];
  for(const paragraph of pdfText(text).split(/\r?\n/)){
   let line='',lineWidth=0;const space=measure(' ',font,size);
   for(const word of paragraph.split(/\s+/).filter(Boolean)){
    const wordWidth=measure(word,font,size);
    if(wordWidth>width){
     if(line){output.push(line);line='';lineWidth=0;}
     let part='',partWidth=0;for(const c of word){const charWidth=measure(c,font,size);if(part&&partWidth+charWidth>width){output.push(part);part='';partWidth=0;}part+=c;partWidth+=charWidth;}line=part;lineWidth=partWidth;
    }else if(line&&lineWidth+space+wordWidth>width){output.push(line);line=word;lineWidth=wordWidth;}
    else{lineWidth+=(line?space:0)+wordWidth;line+=(line?' ':'')+word;}
   }
   output.push(line);
  }
  return output;
 }
 function paragraph(text:string,{font=regular,size=10.5,color=ink,indent=0,after=9}:{font?:PDFFont;size?:number;color?:ReturnType<typeof rgb>;indent?:number;after?:number}={}){
  const leading=size*1.45;
  for(const line of lines(text,font,size,W-2*M-indent)){ensure(leading);page.drawText(line,{x:M+indent,y,size,font,color});y-=leading;}
  y-=after;
 }
 function heading(text:string,size=15){const n=lines(text,bold,size).length;ensure(n*size*1.45+38);paragraph(text,{font:bold,size,color:berry,after:8});}
 function reference(url:string,index:number){
  ensure(25);
  for(const line of lines(`[${index}] ${guide.referenceLabels[index-1]}`,regular,10)){
   ensure(15);const width=measure(line,regular,10);page.drawText(line,{x:M,y,size:10,font:regular,color:berry});
   const annotation=doc.context.register(doc.context.obj({Type:'Annot',Subtype:'Link',Rect:[M,y-3,M+width,y+11],Border:[0,0,0],A:{Type:'Action',S:'URI',URI:PDFString.of(url)}}));page.node.addAnnot(annotation);y-=14;
  }
  y-=5;
 }
 newPage();
 paragraph(`${guide.subject} | PNLE TOPIC REVIEW`,{font:bold,size:10,color:muted,after:12});
 paragraph(guide.title,{font:serif,size:24,color:berry,after:6});
 paragraph(`${guide.practice.length} practice questions | ${guide.sections.length} case summaries | ${guide.references.length} references`,{size:10,color:muted,after:6});
 paragraph(`Study framework from the PRC exam blueprint [${guide.blueprintReference}].`,{size:10,color:muted,after:10});
 heading('Practice check');
 paragraph('Choose one answer per case. Check the answer review after completing the set.',{size:10,color:muted,after:8});
 for(const [index,question] of guide.practice.entries()){
  const stem=question.stem.replace(/\n{2,}/g,'\n');
  const bodyHeight=lines(stem,regular,10.5).length*15.225;
  const optionsHeight=question.options.reduce((sum,option)=>sum+lines(option.text,regular,10.5,W-2*M-12).length*15.225+4,0);
  ensure(Math.min(bodyHeight+optionsHeight+38,H-70-BOTTOM));
  heading(`Question ${index+1}`,12);
  paragraph(stem,{after:6});
  for(const [choice,option] of question.options.entries())paragraph(`${'ABCD'[choice]}. ${option.text}`,{indent:12,after:4});
  y-=5;
 }
 newPage();
 heading('Answer review');
 for(const [index,question] of guide.practice.entries()){
  const key=question.options[question.correctIndex];
  heading(`${index+1}. ${'ABCD'[question.correctIndex]} - ${question.objective}`,12);
  paragraph(key.text,{font:bold,after:7});
  for(const [choice,option] of question.options.entries()){
   const label=choice===question.correctIndex?'Best answer':'Alternative';
   paragraph(`${'ABCD'[choice]} - ${label}. ${option.rationale} ${option.references.map(reference=>`[${reference}]`).join(' ')}`,{indent:8,after:6});
  }
  y-=8;
 }
 heading('Clinical case notes');
 paragraph('Review the case cues, the expected response, and the safety checks. Use the numbered links for the clinical references.',{size:10,color:muted,after:12});
 for(const section of guide.sections){
  heading(section.title);paragraph(section.scenario,{size:10.5,color:muted,after:8});
  if(section.summary)paragraph(section.summary,{font:bold,size:10,after:8});
  for(const point of section.points)paragraph(`- ${point.avoid?'':point.objective+' - '}${point.text} [${point.reference}]`,{indent:8,after:6,color:point.avoid?rgb(.54,.19,.25):ink});
  y-=10;
 }
 heading('References');paragraph('Numbers beside the review points identify their clinical references. Open a link for the full source and publication context.',{size:10,color:muted});
 guide.references.forEach((url,i)=>reference(url,i+1));
 heading('About this guide',13);paragraph('Prepared from original educational scenarios in For Elaine Only Reviewer. Nursing reference facts informed the scenarios; source authors do not endorse this guide. Open RN nursing texts are published by WisTech Open / Chippewa Valley Technical College under CC BY 4.0. Editors include Kimberly Ernstmeyer and Elizabeth Christman; Myra Reuter-Sandquist authored Nursing Assistant. The app\'s About page provides full source attribution.',{size:9,color:muted});
 paragraph('https://nlereviewer.vercel.app/about',{size:9,color:berry});
 const total=doc.getPageCount();
 for(const [i,p] of doc.getPages().entries()){
  p.drawLine({start:{x:M,y:42},end:{x:W-M,y:42},thickness:.5,color:pale});
  p.drawText('Original nursing review | '+brand,{x:M,y:27,size:8,font:regular,color:muted});
  const label=`${i+1} / ${total}`;p.drawText(label,{x:W-M-measure(label,regular,8),y:27,size:8,font:regular,color:muted});
 }
 // No scripts, account names, personal notes, tokens or remote content are embedded.
 return doc.save();
}
