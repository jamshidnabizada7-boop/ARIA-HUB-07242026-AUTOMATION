import React from 'react';
import { CVData, Education, Experience, Skill } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2 } from 'lucide-react';

interface CVFormProps {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
}

export function CVForm({ data, setData }: CVFormProps) {
  const updatePersonal = (field: keyof CVData['personal'], value: string) => {
    setData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }));
  };

  const addEducation = () => {
    setData(prev => ({
      ...prev,
      education: [...prev.education, { id: uuidv4(), degree: '', institution: '', location: '', startDate: '', endDate: '', description: '' }]
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(ed => ed.id === id ? { ...ed, [field]: value } : ed)
    }));
  };

  const removeEducation = (id: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.filter(ed => ed.id !== id)
    }));
  };

  const addExperience = () => {
    setData(prev => ({
      ...prev,
      experience: [...prev.experience, { id: uuidv4(), role: '', company: '', location: '', startDate: '', endDate: '', description: '' }]
    }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };

  const removeExperience = (id: string) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addSkill = () => {
    setData(prev => ({
      ...prev,
      skills: [...prev.skills, { id: uuidv4(), name: '', level: 'Intermediate' }]
    }));
  };

  const updateSkill = (id: string, field: keyof Skill, value: string) => {
    setData(prev => ({
      ...prev,
      skills: prev.skills.map(skill => skill.id === id ? { ...skill, [field]: value } : skill)
    }));
  };

  const removeSkill = (id: string) => {
    setData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }));
  };

  return (
    <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
      {/* Personal Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 border-b pb-2">Personal Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Full Name" value={data.personal.fullName} onChange={e => updatePersonal('fullName', e.target.value)} className="form-input" />
          <input type="email" placeholder="Email" value={data.personal.email} onChange={e => updatePersonal('email', e.target.value)} className="form-input" />
          <input type="tel" placeholder="Phone" value={data.personal.phone} onChange={e => updatePersonal('phone', e.target.value)} className="form-input" />
          <input type="text" placeholder="Location" value={data.personal.location} onChange={e => updatePersonal('location', e.target.value)} className="form-input" />
          <input type="url" placeholder="LinkedIn URL" value={data.personal.linkedIn} onChange={e => updatePersonal('linkedIn', e.target.value)} className="form-input" />
          <input type="url" placeholder="Website / Portfolio" value={data.personal.website} onChange={e => updatePersonal('website', e.target.value)} className="form-input" />
        </div>
        <textarea placeholder="Professional Summary" value={data.personal.summary} onChange={e => updatePersonal('summary', e.target.value)} className="form-input w-full h-24" />
      </div>

      {/* Experience */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Experience</h3>
          <button onClick={addExperience} className="text-sm text-blue-600 dark:text-blue-400 flex items-center hover:underline"><Plus className="w-4 h-4 mr-1"/> Add</button>
        </div>
        {data.experience.map(exp => (
          <div key={exp.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-3 relative group">
            <button onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="Job Title" value={exp.role} onChange={e => updateExperience(exp.id, 'role', e.target.value)} className="form-input" />
              <input type="text" placeholder="Company" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} className="form-input" />
              <input type="text" placeholder="Location" value={exp.location} onChange={e => updateExperience(exp.id, 'location', e.target.value)} className="form-input" />
              <div className="flex space-x-2">
                <input type="text" placeholder="Start Date" value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} className="form-input w-1/2" />
                <input type="text" placeholder="End Date" value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} className="form-input w-1/2" />
              </div>
            </div>
            <textarea placeholder="Description / Achievements" value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} className="form-input w-full h-20" />
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Education</h3>
          <button onClick={addEducation} className="text-sm text-blue-600 dark:text-blue-400 flex items-center hover:underline"><Plus className="w-4 h-4 mr-1"/> Add</button>
        </div>
        {data.education.map(ed => (
          <div key={ed.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-3 relative group">
            <button onClick={() => removeEducation(ed.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="Degree / Major" value={ed.degree} onChange={e => updateEducation(ed.id, 'degree', e.target.value)} className="form-input" />
              <input type="text" placeholder="Institution" value={ed.institution} onChange={e => updateEducation(ed.id, 'institution', e.target.value)} className="form-input" />
              <input type="text" placeholder="Location" value={ed.location} onChange={e => updateEducation(ed.id, 'location', e.target.value)} className="form-input" />
              <div className="flex space-x-2">
                <input type="text" placeholder="Start Year" value={ed.startDate} onChange={e => updateEducation(ed.id, 'startDate', e.target.value)} className="form-input w-1/2" />
                <input type="text" placeholder="End Year" value={ed.endDate} onChange={e => updateEducation(ed.id, 'endDate', e.target.value)} className="form-input w-1/2" />
              </div>
            </div>
            <textarea placeholder="Additional Info (Thesis, Honors, etc.)" value={ed.description} onChange={e => updateEducation(ed.id, 'description', e.target.value)} className="form-input w-full h-16" />
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Skills</h3>
          <button onClick={addSkill} className="text-sm text-blue-600 dark:text-blue-400 flex items-center hover:underline"><Plus className="w-4 h-4 mr-1"/> Add</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.skills.map(skill => (
            <div key={skill.id} className="flex space-x-2 items-center">
              <input type="text" placeholder="Skill Name" value={skill.name} onChange={e => updateSkill(skill.id, 'name', e.target.value)} className="form-input flex-1" />
              <select value={skill.level} onChange={e => updateSkill(skill.id, 'level', e.target.value)} className="form-input w-32">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Expert</option>
              </select>
              <button onClick={() => removeSkill(skill.id)} className="text-slate-400 hover:text-red-500 p-2"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .form-input {
          @apply w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155;
        }
      `}} />
    </div>
  );
}
