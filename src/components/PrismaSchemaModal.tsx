import React, { useState } from 'react';
import { PRISMA_SCHEMA, NEXTJS_API_SAMPLE } from '../lib/prisma-schema';
import { X, Database, Copy, Check, Terminal, FileCode, Layers, Server } from 'lucide-react';

interface PrismaSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrismaSchemaModal: React.FC<PrismaSchemaModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'api' | 'cli'>('schema');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentContent = activeTab === 'schema' ? PRISMA_SCHEMA : NEXTJS_API_SAMPLE;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#161618] border border-gray-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                Prisma ORM & Next.js Architecture
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  v5.x / PostgreSQL
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Relational schema models, Next.js server handlers, and migration workflow
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700/60 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Code'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-800 bg-[#121214] px-5 gap-4">
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'schema'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            schema.prisma
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'api'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Server className="w-4 h-4" />
            Next.js API Handler
          </button>
          <button
            onClick={() => setActiveTab('cli')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'cli'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            CLI & Migrations
          </button>
        </div>

        {/* Content Viewer */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {activeTab === 'cli' ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#101012] border border-gray-800 text-gray-200 font-mono space-y-3">
                <div className="text-gray-500 text-[11px]">// 1. Generate Prisma Client after schema changes</div>
                <div className="text-emerald-400">$ npx prisma generate</div>

                <div className="text-gray-500 text-[11px]">// 2. Create and run PostgreSQL migration</div>
                <div className="text-emerald-400">$ npx prisma migrate dev --name init_personal_plans</div>

                <div className="text-gray-500 text-[11px]">// 3. Seed database with initial plans, tasks & milestones</div>
                <div className="text-emerald-400">$ npx prisma db seed</div>

                <div className="text-gray-500 text-[11px]">// 4. Launch visual GUI database browser</div>
                <div className="text-emerald-400">$ npx prisma studio</div>
              </div>

              <div className="p-4 rounded-xl bg-[#121214] border border-gray-800 text-gray-300">
                <h4 className="font-semibold text-white mb-1">Architecture Implementation Notes</h4>
                <p className="text-[11px] leading-relaxed text-gray-400">
                  In this prototype, the client state layer mirrors the exact Prisma relational entities (<code className="bg-gray-800 px-1 py-0.5 rounded text-indigo-300 font-mono">User</code>, <code className="bg-gray-800 px-1 py-0.5 rounded text-indigo-300 font-mono">Plan</code>, <code className="bg-gray-800 px-1 py-0.5 rounded text-indigo-300 font-mono">Task</code>, <code className="bg-gray-800 px-1 py-0.5 rounded text-indigo-300 font-mono">Milestone</code>, and <code className="bg-gray-800 px-1 py-0.5 rounded text-indigo-300 font-mono">ActivityLog</code>) with cascade deletions, foreign key references, and indexed queries.
                </p>
              </div>
            </div>
          ) : (
            <pre className="p-4 rounded-xl bg-[#101012] border border-gray-800 text-gray-300 font-mono text-xs overflow-x-auto leading-relaxed">
              <code>{currentContent}</code>
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#121214] border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <span>Target Database: PostgreSQL 15+</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium transition-colors border border-gray-700/60 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
