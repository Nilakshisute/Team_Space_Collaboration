// Components/workspace/DocumentEditorContent.jsx
import React, { useRef, useCallback } from "react";
import { Box } from "@chakra-ui/react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Define Quill editor modules and formats
const EDITOR_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ['link', 'image'],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ['clean']
  ],
  clipboard: {
    matchVisual: false
  },
  history: {
    delay: 1000,
    maxStack: 50,
    userOnly: true
  }
};

const EDITOR_FORMATS = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image',
  'color', 'background',
  'align'
];

const DocumentEditorContent = ({ content, setContent, bgColor, borderColor }) => {
  const quillRef = useRef(null);

  // Handle content change with debounce
  const handleContentChange = useCallback((value) => {
    setContent(value);
  }, [setContent]);

  // Handle paste to clean formatting
  const handlePaste = (e) => {
    // If you want to implement custom paste handling
    // You can do it here
  };

  return (
    <Box 
      border="1px" 
      borderColor={borderColor} 
      borderRadius="md" 
      h={{ base: "60vh", md: "70vh" }}
      bg={bgColor}
      overflow="hidden"
      className="document-editor-container"
      position="relative"
      sx={{
        // Custom styling for editor
        '.ql-toolbar': {
          borderBottom: `1px solid ${borderColor}`,
          position: 'sticky',
          top: 0,
          zIndex: 1,
          background: bgColor
        },
        '.ql-container': {
          fontSize: '16px',
          height: { base: 'calc(60vh - 42px)', md: 'calc(70vh - 42px)' },
          overflow: 'auto'
        },
        // Improve styling of editor content
        '.ql-editor': {
          minHeight: { base: 'calc(60vh - 42px)', md: 'calc(70vh - 42px)' },
          lineHeight: '1.6',
          padding: '16px'
        },
        // Improve heading styles
        '.ql-editor h1': { fontSize: '2em', marginBottom: '0.5em' },
        '.ql-editor h2': { fontSize: '1.5em', marginBottom: '0.5em' },
        '.ql-editor h3': { fontSize: '1.3em', marginBottom: '0.5em' },
        // Improve list styles
        '.ql-editor ul, .ql-editor ol': { paddingLeft: '1.5em', marginBottom: '1em' },
        '.ql-editor li': { marginBottom: '0.5em' }
      }}
    >
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={handleContentChange}
        modules={EDITOR_MODULES}
        formats={EDITOR_FORMATS}
        placeholder="Start writing your document..."
        onPaste={handlePaste}
        preserveWhitespace={true}
      />
    </Box>
  );
};

export default React.memo(DocumentEditorContent);