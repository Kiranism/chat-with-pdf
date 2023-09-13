import {
  Pinecone,
  Vector,
  PineconeRecord,
  utils as PineconeUtils,
} from "@pinecone-database/pinecone";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { downloadFromURL } from "./downloadFile";
import { getEmbeddings } from "./embeddings";
import md5 from "md5";
import { convertToAscii } from "./utils";
import { embeddingTransformer } from "./transformers";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
  environment: process.env.PINECONE_ENVIRONMENT!,
});

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadPdfIntoPinecone(file_key: string, file_url: string) {
  console.log("downloading file from uploadthing into filesystem");
  const file_name = await downloadFromURL(file_url);
  if (!file_name) {
    throw new Error("could not download from uploadthing");
  }
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];
  console.log("pagees=>", pages);
  // split and segment the pdf
  const documents = await Promise.all(pages.map(prepareDoc));
  console.log("documents", documents);
  const fileKeyWithoutAsci = convertToAscii(file_key);
  // vectorise and embed individual docs
  const vectors = await Promise.all(
    documents.flat().map((doc) => embedDocument(doc, fileKeyWithoutAsci))
  );
  console.log("vectors", vectors);

  // upload the vector to pinecone
  const client = pinecone;
  const pineconeIndex = client.index("chat-with-pdf");

  // const namespace = pineconeIndex.namespace(namespaceWithoutAsci);
  console.log("inserting vectors into pinecone");

  let res = await pineconeIndex.upsert(vectors);
  console.log("res from pine==>", res);
  return documents[0];
  // PineconeUtils.chunkedUpsert(pineconeIndex, vectors, namespace, 10);
}

async function embedDocument(doc: Document, file_key: string) {
  try {
    const embeddings = await embeddingTransformer(doc.pageContent);
    console.log("embeddings=>", embeddings);
    const hash = md5(doc.pageContent);
    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        fileKey: file_key,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDoc(page: PDFPage) {
  let { metadata, pageContent } = page;
  pageContent = pageContent.replace(/\n/g, "");
  // split the docs
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}

/* 
[
  [
    Document {
      pageContent: 
        'Kiran.SFRONTEND DEVELOPER · BSC COMPUTER SCIENCE · UNIVERSITY OF CALICUT7306405336|imkir4n@gmail.com|kiranfolio.vercel.app|Kiranism|kiranismTechnical SkillsFrontend DevelopmentReact, Next.js, Javascript (ES6+), Typescript, HTML, CSS, Redux, React Router, Material UI, Tailwind CSSBuild Tools and othersJest, Vite, Webpack, Babel, Node, NPM, Express, MongoDB, Git, Github, RESTful APIsWork ExperienceSTACKROOTS TECHNOLOGY SOLUTIONSCyberpark Kozhikode, KeralaFULLSTACK DEVELOPER - MERN [1 YR 3 MOS]Jan. 2022 - Apr. 2023•Collaborated with a team of developers and designers to design, develop, and launch dynamic web applications usingReact js, Nextj s,Node js, meeting project requirements.•Successfullydeployed 3+ projectsto the cloud using Git, ensuringscalability and maintainabilityof the codebase.•Led comprehensive code reviews with the team lead, yielding20% fewer bugsand elevating application stability.•Enhanced user experience with dynamic JavaScript and CSS animations, powered',
      metadata: {
        pageNumber: 1,
        text: 
          'Kiran.SFRONTEND DEVELOPER · BSC COMPUTER SCIENCE · UNIVERSITY OF CALICUT7306405336|imkir4n@gmail.com|kiranfolio.vercel.app|Kiranism|kiranismTechnical SkillsFrontend DevelopmentReact, Next.js, Javascript (ES6+), Typescript, HTML, CSS, Redux, React Router, Material UI, Tailwind CSSBuild Tools and othersJest, Vite, Webpack, Babel, Node, NPM, Express, MongoDB, Git, Github, RESTful APIsWork ExperienceSTACKROOTS TECHNOLOGY SOLUTIONSCyberpark Kozhikode, KeralaFULLSTACK DEVELOPER - MERN [1 YR 3 MOS]Jan. 2022 - Apr. 2023•Collaborated with a team of developers and designers to design, develop, and launch dynamic web applications usingReact js, Nextj s,Node js, meeting project requirements.•Successfullydeployed 3+ projectsto the cloud using Git, ensuringscalability and maintainabilityof the codebase.•Led comprehensive code reviews with the team lead, yielding20% fewer bugsand elevating application stability.•Enhanced user experience with dynamic JavaScript and CSS animations, powered byFramer Motion, driving a40% increase in user inter-actionand heightened application engagement.ProjectsXarchView ProjectSAAS-BASED ARCHITECTURAL PROJECT MANAGEMENT ERP SOLUTION, STREAMLINING PROJECT TASKS AND COMMUNICATION.•Implemented secure role-based authenticationfor controlled access, along withConditional UI Renderingbased on user roles.•UtilizedFormik and Yup for seamless form handling, validation, and included file upload usingReact FilePond. Increased form submissionefficiency by20%.•Managed application state efficiently usingRedux Toolkit. Resulting inoptimized rendering and enhanced data flow.•Enabledlive chat functionalityusingSocket.IOfor real-time user interaction. Boosted user engagement by30%.•Applied advancedReact optimization techniques, includingcode splitting, debouncing, for enhanced performance.REACT.JSREDUX TOOLKITMUIREST APIREACT ROUTERNODEEXPRESSGITE-commerceView ProjectONLINE MERCHANDISE STORE•Optimized performance by incorporating lazy loading of product images and content, resulting in a significant33% reduction in initial pageload time.•Leveraged React, Redux, Zustand, and Material UI to architect dynamic frontend components, achieving over70% component reusabilitythrough strategicutilization of MUI components.•ImplementedRazorpay for secure online payments, offering seamless UPI transactions for effortless and convenient user experience.•Maximized the potential of Formik byimplementing comprehensive form validations, resulting inerror-free data submission.REACT.JSREDUXZUSTANDMUIREST APIRAZORPAYNODEEXPRESSGITWallpaperNextView ProjectA WALLPAPER WEBSITE USING NEXT.JS 12 AS A PERSONAL PROJECT•Prepared GROQ queries to retrieve and display data fromSanity.io CMSin web application.•RevampedSEO techniquesand applied keyword optimization strategies, resulting in a 40% increase in website visibility and a 60% boost inorganic traffic within 6 months.•Enhanced website performance through the application ofoptimization techniques, resulting in significantly improvedPageSpeed scoresand faster page load times.NEXT.JSSANITY CMSGROQTAILWIND CSSDAISY UIGITEducationUniversity of CalicutKozhikode,KeralaBSC IN COMPUTER SCIENCE2018 - 2021Certifications2021Certificate of Achievement,Completed Full stack Mern BootcampLearnCodeOnlineAUGUST 9, 2023KIRAN · RÉSUMÉ1',
        loc: { lines: { from: 1, to: 1 } }
      }
    },
    Document {
      pageContent: 
        'byFramer Motion, driving a40% increase in user inter-actionand heightened application engagement.ProjectsXarchView ProjectSAAS-BASED ARCHITECTURAL PROJECT MANAGEMENT ERP SOLUTION, STREAMLINING PROJECT TASKS AND COMMUNICATION.•Implemented secure role-based authenticationfor controlled access, along withConditional UI Renderingbased on user roles.•UtilizedFormik and Yup for seamless form handling, validation, and included file upload usingReact FilePond. Increased form submissionefficiency by20%.•Managed application state efficiently usingRedux Toolkit. Resulting inoptimized rendering and enhanced data flow.•Enabledlive chat functionalityusingSocket.IOfor real-time user interaction. Boosted user engagement by30%.•Applied advancedReact optimization techniques, includingcode splitting, debouncing, for enhanced performance.REACT.JSREDUX TOOLKITMUIREST APIREACT ROUTERNODEEXPRESSGITE-commerceView ProjectONLINE MERCHANDISE STORE•Optimized performance by incorporating lazy loading of product',
      metadata: {
        pageNumber: 1,
        text: 
          'Kiran.SFRONTEND DEVELOPER · BSC COMPUTER SCIENCE · UNIVERSITY OF CALICUT7306405336|imkir4n@gmail.com|kiranfolio.vercel.app|Kiranism|kiranismTechnical SkillsFrontend DevelopmentReact, Next.js, Javascript (ES6+), Typescript, HTML, CSS, Redux, React Router, Material UI, Tailwind CSSBuild Tools and othersJest, Vite, Webpack, Babel, Node, NPM, Express, MongoDB, Git, Github, RESTful APIsWork ExperienceSTACKROOTS TECHNOLOGY SOLUTIONSCyberpark Kozhikode, KeralaFULLSTACK DEVELOPER - MERN [1 YR 3 MOS]Jan. 2022 - Apr. 2023•Collaborated with a team of developers and designers to design, develop, and launch dynamic web applications usingReact js, Nextj s,Node js, meeting project requirements.•Successfullydeployed 3+ projectsto the cloud using Git, ensuringscalability and maintainabilityof the codebase.•Led comprehensive code reviews with the team lead, yielding20% fewer bugsand elevating application stability.•Enhanced user experience with dynamic JavaScript and CSS animations, powered byFramer Motion, driving a40% increase in user inter-actionand heightened application engagement.ProjectsXarchView ProjectSAAS-BASED ARCHITECTURAL PROJECT MANAGEMENT ERP SOLUTION, STREAMLINING PROJECT TASKS AND COMMUNICATION.•Implemented secure role-based authenticationfor controlled access, along withConditional UI Renderingbased on user roles.•UtilizedFormik and Yup for seamless form handling, validation, and included file upload usingReact FilePond. Increased form submissionefficiency by20%.•Managed application state efficiently usingRedux Toolkit. Resulting inoptimized rendering and enhanced data flow.•Enabledlive chat functionalityusingSocket.IOfor real-time user interaction. Boosted user engagement by30%.•Applied advancedReact optimization techniques, includingcode splitting, debouncing, for enhanced performance.REACT.JSREDUX TOOLKITMUIREST APIREACT ROUTERNODEEXPRESSGITE-commerceView ProjectONLINE MERCHANDISE STORE•Optimized performance by incorporating lazy loading of product images and content, resulting in a significant33% reduction in initial pageload time.•Leveraged React, Redux, Zustand, and Material UI to architect dynamic frontend components, achieving over70% component reusabilitythrough strategicutilization of MUI components.•ImplementedRazorpay for secure online payments, offering seamless UPI transactions for effortless and convenient user experience.•Maximized the potential of Formik byimplementing comprehensive form validations, resulting inerror-free data submission.REACT.JSREDUXZUSTANDMUIREST APIRAZORPAYNODEEXPRESSGITWallpaperNextView ProjectA WALLPAPER WEBSITE USING NEXT.JS 12 AS A PERSONAL PROJECT•Prepared GROQ queries to retrieve and display data fromSanity.io CMSin web application.•RevampedSEO techniquesand applied keyword optimization strategies, resulting in a 40% increase in website visibility and a 60% boost inorganic traffic within 6 months.•Enhanced website performance through the application ofoptimization techniques, resulting in significantly improvedPageSpeed scoresand faster page load times.NEXT.JSSANITY CMSGROQTAILWIND CSSDAISY UIGITEducationUniversity of CalicutKozhikode,KeralaBSC IN COMPUTER SCIENCE2018 - 2021Certifications2021Certificate of Achievement,Completed Full stack Mern BootcampLearnCodeOnlineAUGUST 9, 2023KIRAN · RÉSUMÉ1',
        loc: { lines: { from: 1, to: 1 } }
      }
    },
    Document {
      pageContent: 
        'images and content, resulting in a significant33% reduction in initial pageload time.•Leveraged React, Redux, Zustand, and Material UI to architect dynamic frontend components, achieving over70% component reusabilitythrough strategicutilization of MUI components.•ImplementedRazorpay for secure online payments, offering seamless UPI transactions for effortless and convenient user experience.•Maximized the potential of Formik byimplementing comprehensive form validations, resulting inerror-free data submission.REACT.JSREDUXZUSTANDMUIREST APIRAZORPAYNODEEXPRESSGITWallpaperNextView ProjectA WALLPAPER WEBSITE USING NEXT.JS 12 AS A PERSONAL PROJECT•Prepared GROQ queries to retrieve and display data fromSanity.io CMSin web application.•RevampedSEO techniquesand applied keyword optimization strategies, resulting in a 40% increase in website visibility and a 60% boost inorganic traffic within 6 months.•Enhanced website performance through the application ofoptimization techniques, resulting in',
      metadata: {
        pageNumber: 1,
        text: 
          'Kiran.SFRONTEND DEVELOPER · BSC COMPUTER SCIENCE · UNIVERSITY OF CALICUT7306405336|imkir4n@gmail.com|kiranfolio.vercel.app|Kiranism|kiranismTechnical SkillsFrontend DevelopmentReact, Next.js, Javascript (ES6+), Typescript, HTML, CSS, Redux, React Router, Material UI, Tailwind CSSBuild Tools and othersJest, Vite, Webpack, Babel, Node, NPM, Express, MongoDB, Git, Github, RESTful APIsWork ExperienceSTACKROOTS TECHNOLOGY SOLUTIONSCyberpark Kozhikode, KeralaFULLSTACK DEVELOPER - MERN [1 YR 3 MOS]Jan. 2022 - Apr. 2023•Collaborated with a team of developers and designers to design, develop, and launch dynamic web applications usingReact js, Nextj s,Node js, meeting project requirements.•Successfullydeployed 3+ projectsto the cloud using Git, ensuringscalability and maintainabilityof the codebase.•Led comprehensive code reviews with the team lead, yielding20% fewer bugsand elevating application stability.•Enhanced user experience with dynamic JavaScript and CSS animations, powered byFramer Motion, driving a40% increase in user inter-actionand heightened application engagement.ProjectsXarchView ProjectSAAS-BASED ARCHITECTURAL PROJECT MANAGEMENT ERP SOLUTION, STREAMLINING PROJECT TASKS AND COMMUNICATION.•Implemented secure role-based authenticationfor controlled access, along withConditional UI Renderingbased on user roles.•UtilizedFormik and Yup for seamless form handling, validation, and included file upload usingReact FilePond. Increased form submissionefficiency by20%.•Managed application state efficiently usingRedux Toolkit. Resulting inoptimized rendering and enhanced data flow.•Enabledlive chat functionalityusingSocket.IOfor real-time user interaction. Boosted user engagement by30%.•Applied advancedReact optimization techniques, includingcode splitting, debouncing, for enhanced performance.REACT.JSREDUX TOOLKITMUIREST APIREACT ROUTERNODEEXPRESSGITE-commerceView ProjectONLINE MERCHANDISE STORE•Optimized performance by incorporating lazy loading of product images and content, resulting in a significant33% reduction in initial pageload time.•Leveraged React, Redux, Zustand, and Material UI to architect dynamic frontend components, achieving over70% component reusabilitythrough strategicutilization of MUI components.•ImplementedRazorpay for secure online payments, offering seamless UPI transactions for effortless and convenient user experience.•Maximized the potential of Formik byimplementing comprehensive form validations, resulting inerror-free data submission.REACT.JSREDUXZUSTANDMUIREST APIRAZORPAYNODEEXPRESSGITWallpaperNextView ProjectA WALLPAPER WEBSITE USING NEXT.JS 12 AS A PERSONAL PROJECT•Prepared GROQ queries to retrieve and display data fromSanity.io CMSin web application.•RevampedSEO techniquesand applied keyword optimization strategies, resulting in a 40% increase in website visibility and a 60% boost inorganic traffic within 6 months.•Enhanced website performance through the application ofoptimization techniques, resulting in significantly improvedPageSpeed scoresand faster page load times.NEXT.JSSANITY CMSGROQTAILWIND CSSDAISY UIGITEducationUniversity of CalicutKozhikode,KeralaBSC IN COMPUTER SCIENCE2018 - 2021Certifications2021Certificate of Achievement,Completed Full stack Mern BootcampLearnCodeOnlineAUGUST 9, 2023KIRAN · RÉSUMÉ1',
        loc: { lines: { from: 1, to: 1 } }
      }
    },
    Document {
      pageContent: 
        'significantly improvedPageSpeed scoresand faster page load times.NEXT.JSSANITY CMSGROQTAILWIND CSSDAISY UIGITEducationUniversity of CalicutKozhikode,KeralaBSC IN COMPUTER SCIENCE2018 - 2021Certifications2021Certificate of Achievement,Completed Full stack Mern BootcampLearnCodeOnlineAUGUST 9, 2023KIRAN · RÉSUMÉ1',
      metadata: {
        pageNumber: 1,
        text: 
          'Kiran.SFRONTEND DEVELOPER · BSC COMPUTER SCIENCE · UNIVERSITY OF CALICUT7306405336|imkir4n@gmail.com|kiranfolio.vercel.app|Kiranism|kiranismTechnical SkillsFrontend DevelopmentReact, Next.js, Javascript (ES6+), Typescript, HTML, CSS, Redux, React Router, Material UI, Tailwind CSSBuild Tools and othersJest, Vite, Webpack, Babel, Node, NPM, Express, MongoDB, Git, Github, RESTful APIsWork ExperienceSTACKROOTS TECHNOLOGY SOLUTIONSCyberpark Kozhikode, KeralaFULLSTACK DEVELOPER - MERN [1 YR 3 MOS]Jan. 2022 - Apr. 2023•Collaborated with a team of developers and designers to design, develop, and launch dynamic web applications usingReact js, Nextj s,Node js, meeting project requirements.•Successfullydeployed 3+ projectsto the cloud using Git, ensuringscalability and maintainabilityof the codebase.•Led comprehensive code reviews with the team lead, yielding20% fewer bugsand elevating application stability.•Enhanced user experience with dynamic JavaScript and CSS animations, powered byFramer Motion, driving a40% increase in user inter-actionand heightened application engagement.ProjectsXarchView ProjectSAAS-BASED ARCHITECTURAL PROJECT MANAGEMENT ERP SOLUTION, STREAMLINING PROJECT TASKS AND COMMUNICATION.•Implemented secure role-based authenticationfor controlled access, along withConditional UI Renderingbased on user roles.•UtilizedFormik and Yup for seamless form handling, validation, and included file upload usingReact FilePond. Increased form submissionefficiency by20%.•Managed application state efficiently usingRedux Toolkit. Resulting inoptimized rendering and enhanced data flow.•Enabledlive chat functionalityusingSocket.IOfor real-time user interaction. Boosted user engagement by30%.•Applied advancedReact optimization techniques, includingcode splitting, debouncing, for enhanced performance.REACT.JSREDUX TOOLKITMUIREST APIREACT ROUTERNODEEXPRESSGITE-commerceView ProjectONLINE MERCHANDISE STORE•Optimized performance by incorporating lazy loading of product images and content, resulting in a significant33% reduction in initial pageload time.•Leveraged React, Redux, Zustand, and Material UI to architect dynamic frontend components, achieving over70% component reusabilitythrough strategicutilization of MUI components.•ImplementedRazorpay for secure online payments, offering seamless UPI transactions for effortless and convenient user experience.•Maximized the potential of Formik byimplementing comprehensive form validations, resulting inerror-free data submission.REACT.JSREDUXZUSTANDMUIREST APIRAZORPAYNODEEXPRESSGITWallpaperNextView ProjectA WALLPAPER WEBSITE USING NEXT.JS 12 AS A PERSONAL PROJECT•Prepared GROQ queries to retrieve and display data fromSanity.io CMSin web application.•RevampedSEO techniquesand applied keyword optimization strategies, resulting in a 40% increase in website visibility and a 60% boost inorganic traffic within 6 months.•Enhanced website performance through the application ofoptimization techniques, resulting in significantly improvedPageSpeed scoresand faster page load times.NEXT.JSSANITY CMSGROQTAILWIND CSSDAISY UIGITEducationUniversity of CalicutKozhikode,KeralaBSC IN COMPUTER SCIENCE2018 - 2021Certifications2021Certificate of Achievement,Completed Full stack Mern BootcampLearnCodeOnlineAUGUST 9, 2023KIRAN · RÉSUMÉ1',
        loc: { lines: { from: 1, to: 1 } }
      }
    }
  ]
] */
