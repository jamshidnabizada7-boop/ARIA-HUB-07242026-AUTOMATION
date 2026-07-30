'use client';

import '@mdxeditor/editor/style.css';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  linkPlugin,
  linkDialogPlugin,
  ListsToggle,
} from '@mdxeditor/editor';
import React from 'react';

export interface EditorProps {
  markdown: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

export default function Editor({ markdown, onChange, placeholder }: EditorProps) {
  return (
    <MDXEditor
      className="dark-theme border rounded-md min-h-[150px] bg-white dark:bg-slate-900"
      markdown={markdown}
      onChange={onChange}
      contentEditableClassName="prose prose-sm sm:prose dark:prose-invert max-w-none px-4 py-3 min-h-[150px] focus:outline-none"
      placeholder={placeholder}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <div className="flex items-center gap-1 flex-wrap p-1 border-b bg-slate-50 dark:bg-slate-800/50">
              <UndoRedo />
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
              <BlockTypeSelect />
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
              <BoldItalicUnderlineToggles />
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
              <ListsToggle />
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
              <CreateLink />
            </div>
          )
        })
      ]}
    />
  );
}
