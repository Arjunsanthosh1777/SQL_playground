import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { useDatabase } from '../context/DatabaseContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { useHistory } from '../context/HistoryContext.tsx';
import { Challenge, VerificationResult } from '../types/index.ts';
import {
  Trophy,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Filter,
  Eye,
  X,
  AlertCircle,
  Database,
  Layers,
} from 'lucide-react';

import { clientSqlEngine } from '../services/sqlEngine.ts';

export const ChallengesPage: React.FC = () => {
  const { switchDataset, setEditorSql, setActivePage } = useDatabase();
  const { theme } = useTheme();
  const { completedChallenges, markChallengeComplete } = useHistory();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);

  // Modal challenge state
  const [userQuery, setUserQuery] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [solutionRevealed, setSolutionRevealed] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/challenges')
      .then(async res => {
        const ct = res.headers.get('content-type');
        if (res.ok && ct && ct.includes('application/json')) {
          const data = await res.json();
          if (data.success && data.challenges) {
            setChallenges(data.challenges);
            return;
          }
        }
        setChallenges(clientSqlEngine.getChallenges());
      })
      .catch(() => {
        setChallenges(clientSqlEngine.getChallenges());
      });
  }, []);

  const openChallenge = (challenge: Challenge) => {
    setActiveChallenge(challenge);
    setUserQuery(challenge.starterSql);
    setVerificationResult(null);
    setRevealedHints(0);
    setSolutionRevealed(false);
    switchDataset(challenge.datasetId);
  };

  const handleVerify = async () => {
    if (!activeChallenge || !userQuery.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      let data: VerificationResult;
      try {
        const res = await fetch('/api/verify-challenge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challengeId: activeChallenge.id,
            sql: userQuery,
          }),
        });
        const ct = res.headers.get('content-type');
        if (res.ok && ct && ct.includes('application/json')) {
          data = await res.json();
        } else {
          data = await clientSqlEngine.verifyChallenge(activeChallenge.id, userQuery);
        }
      } catch {
        data = await clientSqlEngine.verifyChallenge(activeChallenge.id, userQuery);
      }

      setVerificationResult(data);

      if (data.passed) {
        markChallengeComplete(activeChallenge.id);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: unknown) {
      setVerificationResult({
        success: false,
        passed: false,
        message: err instanceof Error ? err.message : 'Evaluation error occurred.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Filtered challenges
  const filteredChallenges = challenges.filter(c => {
    if (selectedDifficulty !== 'all' && c.difficulty !== selectedDifficulty) return false;
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    return true;
  });

  const categories = ['all', 'SELECT', 'WHERE', 'ORDER BY', 'GROUP BY', 'JOIN', 'SUBQUERY', 'INSERT', 'UPDATE', 'DELETE'];

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header / Intro */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <span>Interactive SQL Challenges</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Master SQL through hands-on problem solving across real relational datasets with automated query grading.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500">Completed:</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {completedChallenges.length} / {challenges.length}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            {['all', 'beginner', 'intermediate', 'advanced'].map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-md font-mono transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChallenges.map(challenge => {
            const isCompleted = completedChallenges.includes(challenge.id);
            const difficultyBadge =
              challenge.difficulty === 'beginner'
                ? 'text-emerald-700 dark:text-emerald-400'
                : challenge.difficulty === 'intermediate'
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-indigo-700 dark:text-indigo-400';

            return (
              <div
                key={challenge.id}
                onClick={() => openChallenge(challenge)}
                className="group p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className={`font-semibold capitalize font-mono ${difficultyBadge}`}>
                      {challenge.difficulty}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400">
                      <span>{challenge.category}</span>
                      <span>·</span>
                      <span className="capitalize">{challenge.datasetId.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {challenge.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {challenge.description}
                  </p>
                </div>

                {/* Footer Status */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                      Ready to solve
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>Solve</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Challenge Practice Modal */}
      {activeChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 md:p-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-semibold uppercase font-mono text-indigo-600 dark:text-indigo-400">
                      {activeChallenge.difficulty}
                    </span>
                    <span>·</span>
                    <span>{activeChallenge.category}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      <span>{activeChallenge.datasetId}</span>
                    </span>
                  </div>
                  <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
                    {activeChallenge.title}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setActiveChallenge(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Instructions Box */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                <span className="font-semibold block text-slate-900 dark:text-white mb-1">
                  Challenge Prompt:
                </span>
                <p className="leading-relaxed">{activeChallenge.instructions}</p>
              </div>

              {/* CodeMirror Practice Editor */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Write your SQL solution:</span>
                  <button
                    onClick={() => setUserQuery(activeChallenge.starterSql)}
                    className="flex items-center gap-1 hover:text-indigo-600 transition-colors text-[11px]"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset starter code</span>
                  </button>
                </div>
                <div className="h-44 text-sm font-mono">
                  <CodeMirror
                    value={userQuery}
                    height="100%"
                    theme={theme === 'dark' ? oneDark : 'light'}
                    extensions={[sql()]}
                    onChange={(val) => setUserQuery(val)}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm transition-all disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isVerifying ? 'Evaluating Query...' : 'Verify Solution'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditorSql(userQuery);
                      setActivePage('editor');
                      setActiveChallenge(null);
                    }}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span>Open in Full Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Hint Reveal */}
                  {activeChallenge.hints.length > 0 && (
                    <button
                      onClick={() => setRevealedHints(prev => Math.min(activeChallenge.hints.length, prev + 1))}
                      disabled={revealedHints >= activeChallenge.hints.length}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs transition-colors disabled:opacity-50"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>
                        {revealedHints === 0
                          ? 'Get a Hint'
                          : `Hint ${revealedHints}/${activeChallenge.hints.length}`}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Hints Box */}
              {revealedHints > 0 && (
                <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/40 text-xs space-y-1.5 text-amber-900 dark:text-amber-200">
                  <span className="font-semibold block text-amber-800 dark:text-amber-300">
                    Helpful Hints:
                  </span>
                  {activeChallenge.hints.slice(0, revealedHints).map((hint, idx) => (
                    <p key={idx} className="flex items-start gap-1.5">
                      <span className="font-mono text-amber-600 dark:text-amber-400">#{idx + 1}:</span>
                      <span>{hint}</span>
                    </p>
                  ))}
                </div>
              )}

              {/* Verification Feedback Banner */}
              {verificationResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    verificationResult.passed
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {verificationResult.passed ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span>Challenge Passed!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        <span>Query Did Not Match Expected Output</span>
                      </>
                    )}
                  </div>
                  <p className="leading-relaxed">{verificationResult.message}</p>

                  {/* Output Preview Comparison if available */}
                  {verificationResult.userResult && verificationResult.expectedResult && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 block mb-1">
                          YOUR OUTPUT ({verificationResult.userResult.rowCount} rows)
                        </span>
                        <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 truncate">
                          Columns: {verificationResult.userResult.columns.join(', ')}
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 block mb-1">
                          EXPECTED OUTPUT ({verificationResult.expectedResult.rowCount} rows)
                        </span>
                        <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 truncate">
                          Columns: {verificationResult.expectedResult.columns.join(', ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
