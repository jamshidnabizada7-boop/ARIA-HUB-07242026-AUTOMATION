import React from 'react';
import { CVData, TemplateType } from '../types';
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';

interface CVPreviewProps {
  data: CVData;
  template: TemplateType;
}

export function CVPreview({ data, template }: CVPreviewProps) {
  // If all fields are empty, show a placeholder overlay
  const isEmpty = !data.personal.fullName && data.education.length === 0 && data.experience.length === 0 && data.skills.length === 0;

  if (template === 'professional') {
    return (
      <div className="w-full aspect-[1/1.414] bg-white text-slate-900 shadow-2xl overflow-hidden relative text-[11px] leading-relaxed">
        {isEmpty && (
          <div className="absolute inset-0 bg-slate-100/80 flex items-center justify-center z-50 print:hidden">
            <span className="text-slate-400 font-medium text-base">Fill out the form to preview your CV</span>
          </div>
        )}
        <div className="flex h-full">
          {/* Left Column - Dark Blue */}
          <div className="w-1/3 bg-[#0f172a] text-white p-6 flex flex-col">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight mb-1 leading-tight">{data.personal.fullName || 'Your Name'}</h1>
              <div className="w-10 h-1 bg-blue-500 mt-2 rounded"></div>
            </div>

            <div className="space-y-3 mb-8 text-slate-300">
              {data.personal.email && <div className="flex items-center"><Mail className="w-3 h-3 mr-2" /> {data.personal.email}</div>}
              {data.personal.phone && <div className="flex items-center"><Phone className="w-3 h-3 mr-2" /> {data.personal.phone}</div>}
              {data.personal.location && <div className="flex items-center"><MapPin className="w-3 h-3 mr-2" /> {data.personal.location}</div>}
              {data.personal.linkedIn && <div className="flex items-center"><Linkedin className="w-3 h-3 mr-2" /> {data.personal.linkedIn}</div>}
              {data.personal.website && <div className="flex items-center"><Globe className="w-3 h-3 mr-2" /> {data.personal.website}</div>}
            </div>

            {data.skills.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold tracking-wider uppercase mb-3 text-blue-400">Skills</h2>
                <div className="space-y-2 text-slate-300">
                  {data.skills.map(s => (
                    <div key={s.id}>
                      <div className="flex justify-between mb-1">
                        <span>{s.name}</span>
                        <span className="text-[9px] uppercase">{s.level}</span>
                      </div>
                      <div className="w-full bg-slate-700 h-1 rounded">
                        <div className="bg-blue-500 h-1 rounded" style={{ width: s.level === 'Expert' ? '100%' : s.level === 'Intermediate' ? '66%' : '33%' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - White */}
          <div className="w-2/3 p-6 flex flex-col">
            {data.personal.summary && (
              <div className="mb-6">
                <h2 className="text-sm font-bold text-slate-900 border-b-2 border-slate-200 pb-1 mb-2 uppercase tracking-wider">Profile</h2>
                <p className="text-slate-600 text-[11px] leading-relaxed">{data.personal.summary}</p>
              </div>
            )}

            {data.experience.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-bold text-slate-900 border-b-2 border-slate-200 pb-1 mb-3 uppercase tracking-wider">Experience</h2>
                <div className="space-y-4">
                  {data.experience.map(exp => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold text-slate-800">{exp.role}</h3>
                        <span className="text-slate-500 text-[9px] font-medium bg-slate-100 px-1.5 py-0.5 rounded">{exp.startDate} - {exp.endDate}</span>
                      </div>
                      <div className="text-blue-600 font-medium text-[10px] mb-1">{exp.company} {exp.location && `• ${exp.location}`}</div>
                      <p className="text-slate-600 whitespace-pre-wrap">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.education.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-slate-900 border-b-2 border-slate-200 pb-1 mb-3 uppercase tracking-wider">Education</h2>
                <div className="space-y-4">
                  {data.education.map(ed => (
                    <div key={ed.id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold text-slate-800">{ed.degree}</h3>
                        <span className="text-slate-500 text-[9px] font-medium bg-slate-100 px-1.5 py-0.5 rounded">{ed.startDate} - {ed.endDate}</span>
                      </div>
                      <div className="text-slate-700 font-medium text-[10px] mb-1">{ed.institution} {ed.location && `• ${ed.location}`}</div>
                      <p className="text-slate-600 whitespace-pre-wrap">{ed.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Scholar Template
  return (
    <div className="w-full aspect-[1/1.414] bg-white text-slate-900 shadow-2xl overflow-hidden relative font-serif text-[11px] leading-relaxed p-10 print:p-0">
      {isEmpty && (
        <div className="absolute inset-0 bg-slate-100/80 flex items-center justify-center z-50 print:hidden font-sans">
          <span className="text-slate-400 font-medium text-base">Fill out the form to preview your CV</span>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h1 className="text-3xl font-normal mb-2 text-slate-900">{data.personal.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-slate-600 text-[10px]">
          {data.personal.location && <span>{data.personal.location}</span>}
          {data.personal.phone && <span>• {data.personal.phone}</span>}
          {data.personal.email && <span>• {data.personal.email}</span>}
          {data.personal.website && <span>• {data.personal.website}</span>}
        </div>
      </div>

      <div className="space-y-5">
        {data.personal.summary && (
          <div>
            <h2 className="text-[13px] font-semibold text-slate-800 border-b border-slate-300 mb-2 uppercase tracking-widest">Summary</h2>
            <p className="text-slate-700">{data.personal.summary}</p>
          </div>
        )}

        {data.education.length > 0 && (
          <div>
            <h2 className="text-[13px] font-semibold text-slate-800 border-b border-slate-300 mb-2 uppercase tracking-widest">Education</h2>
            <div className="space-y-3">
              {data.education.map(ed => (
                <div key={ed.id}>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{ed.institution} {ed.location && `, ${ed.location}`}</span>
                    <span className="font-normal text-slate-600">{ed.startDate} – {ed.endDate}</span>
                  </div>
                  <div className="italic text-slate-700 mb-1">{ed.degree}</div>
                  <p className="text-slate-700 whitespace-pre-wrap">{ed.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.experience.length > 0 && (
          <div>
            <h2 className="text-[13px] font-semibold text-slate-800 border-b border-slate-300 mb-2 uppercase tracking-widest">Professional Experience</h2>
            <div className="space-y-3">
              {data.experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{exp.role}</span>
                    <span className="font-normal text-slate-600">{exp.startDate} – {exp.endDate}</span>
                  </div>
                  <div className="italic text-slate-700 mb-1">{exp.company} {exp.location && `, ${exp.location}`}</div>
                  <p className="text-slate-700 whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.skills.length > 0 && (
          <div>
            <h2 className="text-[13px] font-semibold text-slate-800 border-b border-slate-300 mb-2 uppercase tracking-widest">Skills & Competencies</h2>
            <div className="text-slate-700">
              {data.skills.map(s => `${s.name} (${s.level})`).join(' • ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
