import React, { useEffect, useState } from 'react';
import { RoleTaxonomyItem, Question } from '../types';
import { fetchRolesTaxonomy, fetchRandomQuestion } from '../api';
import { Brain, Code, Database, Layers, Server, Users, ChevronRight, Zap, RefreshCw, Award, BookOpen } from 'lucide-react';

interface RoleSkillBrowserProps {
  onSelectQuestion: (question: Question) => void;
}

export const RoleSkillBrowser: React.FC<RoleSkillBrowserProps> = ({ onSelectQuestion }) => {
  const [roles, setRoles] = useState<RoleTaxonomyItem[]>([]);
  const [selectedRoleTitle, setSelectedRoleTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRandomLoading, setIsRandomLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadRoles() {
      try {
        const data = await fetchRolesTaxonomy();
        setRoles(data);
        if (data.length > 0) {
          setSelectedRoleTitle(data[0].role_title);
        }
      } catch (err) {
        console.error('Failed to load roles taxonomy:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRoles();
  }, []);

  const activeRole = roles.find(r => r.role_title === selectedRoleTitle) || roles[0];

  const handleRandomForRole = async () => {
    if (!activeRole) return;
    setIsRandomLoading(true);
    try {
      const q = await fetchRandomQuestion({ role: activeRole.role_title });
      onSelectQuestion(q);
    } catch (e) {
      console.error('Failed to get random question:', e);
    } finally {
      setIsRandomLoading(false);
    }
  };

  const getRoleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain': return Brain;
      case 'Code': return Code;
      case 'Database': return Database;
      case 'Layers': return Layers;
      case 'Server': return Server;
      case 'Users': return Users;
      default: return BookOpen;
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <div className="text-sm font-bold text-slate-800">Loading Role & Skills Architecture...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role Selector Header Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        {roles.map((r) => {
          const Icon = getRoleIcon(r.icon);
          const isSelected = r.role_title === selectedRoleTitle;
          return (
            <button
              key={r.role_title}
              type="button"
              onClick={() => setSelectedRoleTitle(r.role_title)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold border transition whitespace-nowrap ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{r.role_title}</span>
            </button>
          );
        })}
      </div>

      {activeRole && (
        <div className="space-y-6">
          {/* Active Role Banner */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {activeRole.domain.toUpperCase()} DOMAIN
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {activeRole.skills.length} Core Skill Modules
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                {activeRole.role_title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {activeRole.description}
              </p>
            </div>

            {/* Random Question Action Button */}
            <button
              type="button"
              onClick={handleRandomForRole}
              disabled={isRandomLoading}
              className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-200" />
              <span>{isRandomLoading ? 'Selecting...' : '🎲 Surprise Me (Random Question)'}</span>
            </button>
          </div>

          {/* Skills & Questions Grid */}
          <div className="space-y-5">
            {activeRole.skills.map((skill, sIdx) => (
              <div
                key={sIdx}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4"
              >
                {/* Skill Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-xs">
                      {sIdx + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {skill.skill_name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {skill.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {skill.questions?.length || skill.question_ids.length} Question(s)
                  </span>
                </div>

                {/* Questions under this skill */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(skill.questions || []).map((q) => (
                    <div
                      key={q.question_id}
                      onClick={() => onSelectQuestion(q)}
                      className="group bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-400/70 rounded-2xl p-4 transition duration-200 cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-100/70 text-indigo-700">
                            {q.question_id}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                            {q.difficulty || 'Mid-Level'}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                          {q.question_text}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">
                          {q.expected_concepts.length} concepts to cover
                        </span>
                        <span className="font-bold text-indigo-600 flex items-center space-x-1 group-hover:translate-x-1 transition">
                          <span>Practice</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
