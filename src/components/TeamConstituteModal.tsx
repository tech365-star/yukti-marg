import React, { useState } from 'react';
import { Challenge, StudentMember, UniversityTeam, User } from '../types';
import { UNIVERSITIES } from '../data/mockData';
import { X, Users, Plus, Trash2, GraduationCap, CheckCircle2 } from 'lucide-react';

interface TeamConstituteModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
  currentUser: User | null;
  onTeamUpdated: (updatedChallenge: Challenge) => void;
}

export const TeamConstituteModal: React.FC<TeamConstituteModalProps> = ({
  isOpen,
  onClose,
  challenge,
  currentUser,
  onTeamUpdated,
}) => {
  const defaultUni = UNIVERSITIES[0];
  const [universityName, setUniversityName] = useState(
    challenge.assignedUniversity?.name || currentUser?.organization || defaultUni.name
  );
  const [facultyMentor, setFacultyMentor] = useState(
    challenge.team?.facultyMentor || currentUser?.name || 'Prof. Dr. Rajesh K. Verma'
  );
  const [mentorDesignation, setMentorDesignation] = useState(
    challenge.team?.mentorDesignation || 'Professor & Principal Investigator'
  );
  const [mentorDepartment, setMentorDepartment] = useState(
    challenge.team?.mentorDepartment || currentUser?.department || 'Department of Mechanical Engineering'
  );
  const [incubationCenter, setIncubationCenter] = useState(
    challenge.team?.incubationCenter || 'Technology Business Incubator (TBI)'
  );

  const [students, setStudents] = useState<StudentMember[]>(
    challenge.team?.studentMembers || [
      { name: 'Amitabh Soren', rollNo: 'BE/MECH/22/045', discipline: 'Mechanical Eng.', yearOrSemester: '7th Semester' },
      { name: 'Pooja Kumari', rollNo: 'BE/EEE/22/112', discipline: 'Electrical & Electronics', yearOrSemester: '7th Semester' },
    ]
  );

  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentDiscipline, setNewStudentDiscipline] = useState('');
  const [newStudentYear, setNewStudentYear] = useState('7th Semester');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddStudent = () => {
    if (!newStudentName.trim() || !newStudentDiscipline.trim()) return;
    setStudents((prev) => [
      ...prev,
      {
        name: newStudentName.trim(),
        rollNo: newStudentRoll.trim() || 'N/A',
        discipline: newStudentDiscipline.trim(),
        yearOrSemester: newStudentYear,
      },
    ]);
    setNewStudentName('');
    setNewStudentRoll('');
    setNewStudentDiscipline('');
  };

  const handleRemoveStudent = (index: number) => {
    setStudents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const teamData: UniversityTeam = {
        universityName,
        facultyMentor,
        mentorDesignation,
        mentorDepartment,
        incubationCenter,
        studentMembers: students,
        constitutedDate: new Date().toISOString().split('T')[0],
      };

      const res = await fetch(`/api/challenges/${challenge.id}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team: teamData }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onTeamUpdated(data.challenge);
        onClose();
      }
    } catch (err) {
      console.error('Failed to constitute team:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-amber-500">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold">Constitute Multidisciplinary Project Team</h3>
              <p className="text-xs text-slate-300">NEP 2020 Student & Faculty Innovation Cell</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* University selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Higher Education Institution (HEI)
            </label>
            <select
              value={universityName}
              onChange={(e) => setUniversityName(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-amber-500"
            >
              {UNIVERSITIES.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mentor details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-purple-50/50 p-3.5 rounded-lg border border-purple-200">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Faculty Mentor / Principal Investigator *
              </label>
              <input
                type="text"
                value={facultyMentor}
                onChange={(e) => setFacultyMentor(e.target.value)}
                required
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Department / Discipline *
              </label>
              <input
                type="text"
                value={mentorDepartment}
                onChange={(e) => setMentorDepartment(e.target.value)}
                required
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Designation
              </label>
              <input
                type="text"
                value={mentorDesignation}
                onChange={(e) => setMentorDesignation(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Incubation Centre / FabLab
              </label>
              <input
                type="text"
                value={incubationCenter}
                onChange={(e) => setIncubationCenter(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
              />
            </div>
          </div>

          {/* Student Researchers list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-700" />
                Multidisciplinary Student Innovators ({students.length})
              </label>
              <span className="text-[11px] text-slate-500">
                Experiential Learning Credits under NEP 2020
              </span>
            </div>

            {/* List */}
            <div className="space-y-2 mb-3">
              {students.map((st, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 mr-2">{st.name}</span>
                    <span className="text-slate-500 text-[11px] mr-2">({st.rollNo})</span>
                    <span className="bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded text-[10px] font-semibold mr-1.5">
                      {st.discipline}
                    </span>
                    <span className="text-slate-400 text-[10px]">{st.yearOrSemester}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStudent(idx)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new student row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-100/70 p-2.5 rounded border border-slate-200">
              <input
                type="text"
                placeholder="Student Name"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="text-xs px-2 py-1.5 border border-slate-300 rounded bg-white"
              />
              <input
                type="text"
                placeholder="Roll / Enrollment No"
                value={newStudentRoll}
                onChange={(e) => setNewStudentRoll(e.target.value)}
                className="text-xs px-2 py-1.5 border border-slate-300 rounded bg-white"
              />
              <input
                type="text"
                placeholder="Academic Discipline"
                value={newStudentDiscipline}
                onChange={(e) => setNewStudentDiscipline(e.target.value)}
                className="text-xs px-2 py-1.5 border border-slate-300 rounded bg-white"
              />
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Semester (e.g. 7th Sem)"
                  value={newStudentYear}
                  onChange={(e) => setNewStudentYear(e.target.value)}
                  className="text-xs px-2 py-1.5 border border-slate-300 rounded bg-white flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddStudent}
                  className="bg-purple-700 hover:bg-purple-800 text-white px-2.5 py-1.5 rounded text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || students.length === 0}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold disabled:bg-slate-300 cursor-pointer"
            >
              {isSubmitting ? 'Constituenting...' : 'Save & Assign Project Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
