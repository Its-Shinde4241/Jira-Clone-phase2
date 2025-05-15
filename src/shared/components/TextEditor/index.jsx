import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { EditorCont } from './Styles';

const propTypes = {
  className: PropTypes.string,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  getEditor: PropTypes.func,
};

const defaultProps = {
  className: undefined,
  placeholder: undefined,
  defaultValue: '',
  value: '',
  onChange: () => {},
  getEditor: () => {},
};

const TextEditor = ({
  className,
  placeholder,
  defaultValue,
  value,
  onChange,
  getEditor,
}) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (getEditor) {
      getEditor({
        getValue: () =>
          editorRef.current?.getEditor().root.innerHTML || '',
      });
    }
  }, [getEditor]);

  return (
    <EditorCont className={className}>
      <ReactQuill
        ref={editorRef}
        theme="snow"
        placeholder={placeholder}
        value={value || defaultValue}
        onChange={onChange}
        modules={quillConfig.modules}
      />
    </EditorCont>
  );
};

const quillConfig = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      ['clean'],
    ],
  },
};

TextEditor.propTypes = propTypes;
TextEditor.defaultProps = defaultProps;

export default TextEditor;
