// import OpenAI from "openai";
// import sql from "../configs/db.js";
// import { clerkClient } from "@clerk/express";
// import axios from "axios";
// import {v2 as cloudinary} from 'cloudinary';
// import fs from 'fs';
// // import pdf from 'pdf-parse/lib/pdf-parse.js';
// import * as pdf from "pdf-parse";

// const AI = new OpenAI({
//     apiKey: process.env.GEMINI_API_KEY,
//     baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
// });

// export const generateArticle=async(req,res)=>{
//     try{
// const { userId } =req.auth();
// const{prompt,length}=req.body;
// const plan=req.plan;
// const free_usage=req.free_usage;
// if(plan !=='premium' && free_usage >=10){
//    return res.json({ success:false, message:"Limit reached.Upgrade to continue." });
// }

// const response = await AI.chat.completions.create({
//     model: "gemini-3-flash-preview",
//     messages: [{
          
//           "role": "user",
//           "content":prompt,
//       },

//     ],
//     temperature: 0.7,
//     max_tokens:length,
//   });
// const content= response.choices[0].message.content
// await sql`INSERT INTO creations (user_id,prompt,content,type) VALUES (${userId},${prompt},${content},'article')`;
// if(plan !=='premium'){
//     await clerkClient.users.updateUserMetadata(userId,{
//         privateMetadata:{
//             free_usage: free_usage + 1
//     }  
// })
//     }
// res.json({ success:true, content });
// }
//     catch(error){
//     console.log(error.message);
//     res.json({ success:false, message:error.message});
//     }

// }




// export const generateBlogTitle=async(req,res)=>{
//     try{
// const { userId } =req.auth();
// const{prompt}=req.body;
// const plan=req.plan;
// const free_usage=req.free_usage;
// if(plan !=='premium' && free_usage >=10){
//    return res.json({ success:false, message:"Limit reached.Upgrade to continue." });
// }

// const response = await AI.chat.completions.create({
//     model: "gemini-3-flash-preview",
//     messages: [{
          
//           "role": "user",
//           "content":prompt,
//       },

//     ],
//     temperature: 0.7,
//     max_tokens:100,
//   });
// const content= response.choices[0].message.content
// await sql`INSERT INTO creations (user_id,prompt,content,type) VALUES (${userId},${prompt},${content},'blog-title')`;
// if(plan !=='premium'){
//     await clerkClient.users.updateUserMetadata(userId,{
//         privateMetadata:{
//             free_usage: free_usage + 1
//     }  
// })
//     }
// res.json({ success:true, content});
// }
//     catch(error){
//     console.log(error.message);
//     res.json({ success:false, message:error.message});
//     }

// }





// export const generateImage=async(req,res)=>{
//     try{
// const { userId } =req.auth();
// const{prompt,publish}=req.body;
// const plan=req.plan;

// if(plan !=='premium'){
//    return res.json({ success:false, message:"This feature is only avaliable for premium subscriptions" })
// }

// const formData = new FormData()
// formData.append('prompt', prompt)
// const {data}= await axios.post("https://clipdrop-api.co/text-to-image/v1",formData,{
//     headers:{
//           'x-api-key': process.env.CLIPDROP_API_KEY,
//     },
//     responseType:"arraybuffer",
// })

// const base64Image=`data:image/png;base64,${Buffer.from(data,'binary').toString('base64')}`

// const {secure_url}= await cloudinary.uploader.upload(base64Image);

// await sql`INSERT INTO creations (user_id,prompt,content,type,publish) VALUES (${userId},${prompt},${secure_url},'image',${publish ?? false})`;

// res.json({ success:true, content:secure_url });
// }
//     catch(error){
//     console.log(error.message);
//     res.json({ success:false, message:error.message});
//     }

// }



// export const removeImageBackground=async(req,res)=>{
//     try{
// const { userId } =req.auth();
// //const{prompt,publish}=req.body;
// const {image}=req.file;
// const plan=req.plan;

// if(plan !=='premium'){
//    return res.json({ success:false, message:"This feature is only avaliable for premium subscriptions" })
// }




// const {secure_url}= await cloudinary.uploader.upload(image.path,{
//     transformation:[
//         {effect:'background_removal',
//             background_removal:'remove_the_background'
//         }
//     ]
// })

// await sql`INSERT INTO creations (user_id,prompt,content,type) VALUES (${userId},'Remove Background from image',${secure_url},'image')`;

// res.json({ success: true, content: secure_url });
// }
//     catch(error){
//     console.log(error.message);
//     res.json({ success: false, message: error.message});
//     }

// }


// export const removeImageObject=async(req,res)=>{
//     try{
// const { userId } =req.auth();
// //const{prompt,publish}=req.body;
// const { object } =req.body;
// const {image}=req.file;
// const plan=req.plan;

// if(plan !=='premium'){
//    return res.json({ success:false, message:"This feature is only avaliable for premium subscriptions" })
// }



// const {public_id}= await cloudinary.uploader.upload(image.path)

// const imageUrl = cloudinary.url(public_id,{
//     transformation:[{effect:`gen_remove:${object}`}],
//     resource_type:'image',   
// })

// await sql`INSERT INTO creations (user_id,prompt,content,type) VALUES (${userId},'${`Removed ${object} from image`},${imageUrl},'image')`;

// res.json({ success: true, content: imageUrl});
// }
//     catch(error){
//     console.log(error.message);
//     res.json({ success: false, message: error.message});
//     }

// }



// export const resumeReview=async(req,res)=>{
//     try{
// const { userId } =req.auth();
// //const{prompt,publish}=req.body;

// const resume=req.file;
// const plan=req.plan;

// if(plan !=='premium'){
//    return res.json({ success:false, message:"This feature is only avaliable for premium subscriptions" })
// }


// if(resume.size > 5 * 1024 * 1024){
//     return res.json({ success: false, message: "File size should be less than 5MB" });
// }

// const dataBuffer=fs.readFileSync(resume.path)
// const pdfData=await pdf(dataBuffer)

// const prompt=`Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n ${pdfData.text}`

// const response = await AI.chat.completions.create({
//     model: "gemini-3-flash-preview",
//     messages: [{
          
//           "role": "user",
//           "content":prompt,
//       },

//     ],
//     temperature: 0.7,
//     max_tokens:1000,
//   });
// const content= response.choices[0].message.content
// await sql`INSERT INTO creations (user_id,prompt,content,type) VALUES (${userId},'Review the uploaded resume',${content},'resume-review')`;

// res.json({ success: true, content: imageUrl});
// }
//     catch(error){
//     console.log(error.message);
//     res.json({ success: false, message: error.message});
//     }

// }










import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import * as pdf from "pdf-parse";
import mammoth from "mammoth";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const SUPPORTED_TEXT_MIME_TYPES = ['text/plain'];
const SUPPORTED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const SUPPORTED_PDF_MIME_TYPES = ['application/pdf'];
const SUPPORTED_DOCX_MIME_TYPES = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const SUPPORTED_CITATION_STYLES = ['APA', 'MLA', 'IEEE', 'Chicago', 'Harvard', 'Vancouver'];

const isDocxFile = (file) => {
  if (SUPPORTED_DOCX_MIME_TYPES.includes(file.mimetype)) return true;
  return file?.originalname?.toLowerCase().endsWith('.docx');
};

const cleanupUploadedFiles = (files = []) => {
  files.forEach((file) => {
    try {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch {
      // Ignore temp file cleanup failures.
    }
  });
};

const extractTextFromFile = async (file) => {
  if (SUPPORTED_PDF_MIME_TYPES.includes(file.mimetype)) {
    const buffer = fs.readFileSync(file.path);
    const parsedPdf = await pdf(buffer);
    return parsedPdf.text?.trim() || '';
  }

  if (isDocxFile(file)) {
    const result = await mammoth.extractRawText({ path: file.path });
    return result.value?.trim() || '';
  }

  if (SUPPORTED_TEXT_MIME_TYPES.includes(file.mimetype)) {
    return fs.readFileSync(file.path, 'utf8').trim();
  }

  return '';
};

const uploadImagesAndGetUrls = async (files = []) => {
  const imageFiles = files.filter((file) => SUPPORTED_IMAGE_MIME_TYPES.includes(file.mimetype));
  const uploaded = await Promise.all(
    imageFiles.map((file) => cloudinary.uploader.upload(file.path, { resource_type: 'image' }))
  );
  return uploaded.map((item) => item.secure_url);
};


// ✅ ================== GENERATE ARTICLE ==================
export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== 'premium' && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue."
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-3-flash-preview",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: length,
    });

    const content = response.choices[0].message.content;

    // Save to DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')
    `;

    // Update usage
    if (plan !== 'premium') {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1
        }
      });
    }

    // ✅ 🔥 FIXED RESPONSE
    res.json({
      success: true,
      article: content
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};


// ✅ ================== GENERATE BLOG TITLE ==================
export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== 'premium' && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue."
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-3-flash-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const content = response.choices[0].message.content;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
    `;

    if (plan !== 'premium') {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1
        }
      });
    }

    res.json({
      success: true,
      content
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};


// ✅ ================== GENERATE IMAGE ==================
export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== 'premium') {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions"
      });
    }

    if (!process.env.STABILITY_API_KEY) {
      throw new Error("STABILITY_API_KEY is missing in server .env");
    }

    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('output_format', 'png');

    const { data } = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/generate/core',
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: 'image/*'
        },
        responseType: 'arraybuffer'
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
    `;

    res.json({
      success: true,
      content: secure_url
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};


// ✅ ================== REMOVE IMAGE BACKGROUND ==================
export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const plan = req.plan;

    if (plan !== 'premium') {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions"
      });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: 'background_removal',
          background_removal: 'remove_the_background'
        }
      ]
    });

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Remove Background from image', ${secure_url}, 'image')
    `;

    res.json({
      success: true,
      content: secure_url
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};


// ✅ ================== REMOVE IMAGE OBJECT ==================
export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;

    if (plan !== 'premium') {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions"
      });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: 'image',
    });

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')
    `;

    res.json({
      success: true,
      content: imageUrl
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};


// ✅ ================== RESUME REVIEW ==================
export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== 'premium') {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions"
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "File size should be less than 5MB"
      });
    }

    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    const prompt = `Review the following resume and provide constructive feedback:\n\n${pdfData.text}`;

    const response = await AI.chat.completions.create({
      model: "gemini-3-flash-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Resume Review', ${content}, 'resume-review')
    `;

    // ✅ FIXED BUG (imageUrl ❌ → content ✅)
    res.json({
      success: true,
      content
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};


// ✅ ================== GENERATE RESEARCH PAPER ==================
export const generateResearchPaper = async (req, res) => {
  const files = req.files || [];

  try {
    const { userId } = req.auth();
    const { topic, requirements, citationStyle } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;
    const selectedCitationStyle = SUPPORTED_CITATION_STYLES.includes(citationStyle)
      ? citationStyle
      : 'APA';

    if (!topic?.trim()) {
      cleanupUploadedFiles(files);
      return res.json({
        success: false,
        message: "Research topic is required"
      });
    }

    if (plan !== 'premium' && free_usage >= 10) {
      cleanupUploadedFiles(files);
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue."
      });
    }

    const unsupportedFile = files.find((file) => {
      const isText = SUPPORTED_TEXT_MIME_TYPES.includes(file.mimetype);
      const isImage = SUPPORTED_IMAGE_MIME_TYPES.includes(file.mimetype);
      const isPdf = SUPPORTED_PDF_MIME_TYPES.includes(file.mimetype);
      const isDocx = isDocxFile(file);
      return !isText && !isImage && !isPdf && !isDocx;
    });

    if (unsupportedFile) {
      cleanupUploadedFiles(files);
      return res.json({
        success: false,
        message: "Unsupported file type. Upload PDF, DOCX, TXT, JPG, JPEG, PNG, or WEBP files only."
      });
    }

    const extractedTexts = await Promise.all(
      files
        .filter((file) => SUPPORTED_TEXT_MIME_TYPES.includes(file.mimetype) || SUPPORTED_PDF_MIME_TYPES.includes(file.mimetype) || isDocxFile(file))
        .map(async (file) => {
          const extracted = await extractTextFromFile(file);
          return `Source: ${file.originalname}\n${extracted || '[No readable text found]'}`;
        })
    );

    const imageUrls = await uploadImagesAndGetUrls(files);

    const basePrompt = [
      `Create a high-quality research paper on: ${topic}.`,
      requirements?.trim() ? `Additional requirements: ${requirements.trim()}` : 'No additional requirements were provided.',
      `Use ${selectedCitationStyle} citation style for in-text citations and references.`,
      'Use only the supplied material where relevant. If evidence is missing, clearly state assumptions.',
      'Return markdown with the following sections: Title, Abstract, Introduction, Methodology/Approach, Analysis, Findings, Limitations, Conclusion, and References.'
    ].join('\n\n');

    const textContext = extractedTexts.length
      ? `Use these extracted file contents as source material:\n\n${extractedTexts.join('\n\n---\n\n')}`
      : 'No text-based source files were uploaded.';

    const userContent = [
      {
        type: 'text',
        text: `${basePrompt}\n\n${textContext}`
      },
      ...imageUrls.map((url) => ({
        type: 'image_url',
        image_url: { url }
      }))
    ];

    const response = await AI.chat.completions.create({
      model: "gemini-3-flash-preview",
      messages: [{ role: "user", content: userContent }],
      temperature: 0.6,
      max_tokens: 2500,
    });

    const content = response.choices?.[0]?.message?.content || "";

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Research paper: ${topic}`}, ${content}, 'research-paper')
    `;

    if (plan !== 'premium') {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1
        }
      });
    }

    cleanupUploadedFiles(files);

    res.json({
      success: true,
      content
    });
  } catch (error) {
    cleanupUploadedFiles(files);
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};
















