import React, { useState } from 'react';
import { Sparkles, FileText, Download } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import { jsPDF } from 'jspdf';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ResearchPaper = () => {
  const citationStyles = ['APA', 'MLA', 'IEEE', 'Chicago', 'Harvard', 'Vancouver'];
  const { getToken } = useAuth();
  const [topic, setTopic] = useState('');
  const [requirements, setRequirements] = useState('');
  const [citationStyle, setCitationStyle] = useState('APA');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const markdownToPlainText = (markdown) => {
    return markdown
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/^(#{1,6})\s+/gm, '')
      .replace(/[*_~>-]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const downloadMarkdown = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${topic.trim().replace(/\s+/g, '-').toLowerCase() || 'research-paper'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    if (!content) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
    const textContent = markdownToPlainText(content);
    const lines = doc.splitTextToSize(textContent, maxWidth);
    let cursorY = margin;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    lines.forEach((line) => {
      if (cursorY > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += 16;
    });

    doc.save(`${topic.trim().replace(/\s+/g, '-').toLowerCase() || 'research-paper'}.pdf`);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!topic.trim()) {
      toast.error('Research topic is required');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('topic', topic.trim());
      formData.append('requirements', requirements.trim());
      formData.append('citationStyle', citationStyle);
      files.forEach((file) => formData.append('files', file));

      const { data } = await axios.post('/api/ai/generate-research-paper', formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }

    setLoading(false);
  };

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      <form
        onSubmit={onSubmitHandler}
        className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'
      >
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#2657E8]' />
          <h1 className='text-xl font-semibold'>Research Paper Generator</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>Research Topic</p>
        <input
          type='text'
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
          placeholder='Impact of AI in healthcare diagnostics'
          required
        />

        <p className='mt-4 text-sm font-medium'>Additional Requirements</p>
        <textarea
          rows={4}
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 resize-none'
          placeholder='Target audience, citation style, focus area, constraints, etc.'
        />

        <p className='mt-4 text-sm font-medium'>Citation Style</p>
        <select
          value={citationStyle}
          onChange={(e) => setCitationStyle(e.target.value)}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 bg-white'
        >
          {citationStyles.map((style) => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>

        <p className='mt-4 text-sm font-medium'>Upload Source Files (Optional)</p>
        <input
          type='file'
          multiple
          accept='.pdf,.docx,.txt,image/png,image/jpeg,image/jpg,image/webp'
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600'
        />
        <p className='text-xs text-gray-500 mt-1'>Supported: PDF, DOCX, TXT, JPG, JPEG, PNG, WEBP (up to 6 files).</p>

        <button
          disabled={loading}
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#2657E8] to-[#24A1F2] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'
        >
          {loading ? (
            <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
          ) : (
            <FileText className='w-5' />
          )}
          Generate Research Paper
        </button>
      </form>

      <div className='w-full max-w-lg p-4 bg-white rounded-lg border flex flex-col border-gray-200 min-h-96 max-h-[600px]'>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <FileText className='w-6 h-5 text-[#2657E8]' />
            <h1 className='text-xl font-semibold'>Generated Research Paper</h1>
          </div>
          {content && (
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={downloadMarkdown}
                className='text-xs px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1'
              >
                <Download className='w-3.5 h-3.5' />
                MD
              </button>
              <button
                type='button'
                onClick={downloadPdf}
                className='text-xs px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1'
              >
                <Download className='w-3.5 h-3.5' />
                PDF
              </button>
            </div>
          )}
        </div>

        {!content ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <FileText className='w-9 h-9' />
              <p>Add your topic and files, then click "Generate Research Paper".</p>
            </div>
          </div>
        ) : (
          <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-600'>
            <div className='reset-tw'>
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchPaper;
