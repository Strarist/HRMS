import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Award,
  Target,
  Brain
} from 'lucide-react';

const AIInsights = ({ analysis, compact = false }) => {
  if (!analysis || !analysis.isAnalyzed) {
    return null;
  }

  const { 
    matchScore, 
    skillsMatch, 
    experienceMatch, 
    keyHighlights, 
    weaknesses, 
    overallFit 
  } = analysis;
  

  // Get fit badge styling
  const getFitBadge = (fit) => {
    const badges = {
      excellent: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Excellent Fit' },
      good: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Good Fit' },
      average: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Average Fit' },
      poor: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Poor Fit' }
    };
    return badges[fit] || badges.average;
  };

  const fitBadge = getFitBadge(overallFit);

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Compact view for applicant cards
  if (compact) {
    return (
      <div className="mt-3 pt-3 border-t border-dark-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Brain size={16} className="text-primary-500" />
            <span className="text-xs font-medium text-gray-400">AI Match Score</span>
          </div>
          <span className={`text-lg font-bold ${getScoreColor(matchScore)}`}>
            {matchScore}%
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-dark-800 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              matchScore >= 80 ? 'bg-green-500' :
              matchScore >= 60 ? 'bg-blue-500' :
              matchScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${matchScore}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className={`px-2 py-1 rounded ${fitBadge.bg} ${fitBadge.text} font-medium`}>
            {fitBadge.label}
          </span>
          <span className="text-gray-500">
            {skillsMatch?.matchPercentage || 0}% skills match
          </span>
        </div>

        {/* Quick highlights */}
        {keyHighlights && keyHighlights.length > 0 && (
          <div className="mt-2 space-y-1">
            {keyHighlights.slice(0, 2).map((highlight, idx) => (
              <div key={idx} className="flex items-start space-x-1 text-xs text-gray-400">
                <CheckCircle size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{highlight}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full detailed view
  return (
    <div className="space-y-4">
      {/* Header with score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-600/20 rounded-lg">
            <Sparkles size={24} className="text-primary-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Analysis</h3>
            <p className="text-sm text-gray-400">Powered by intelligent matching</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${getScoreColor(matchScore)}`}>
            {matchScore}%
          </div>
          <div className={`px-3 py-1 rounded-lg ${fitBadge.bg} ${fitBadge.text} text-sm font-medium mt-1`}>
            {fitBadge.label}
          </div>
        </div>
      </div>

      {/* Match Score Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Overall Match</span>
          <span className={`font-semibold ${getScoreColor(matchScore)}`}>{matchScore}%</span>
        </div>
        <div className="w-full bg-dark-800 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all ${
              matchScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
              matchScore >= 60 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
              matchScore >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
              'bg-gradient-to-r from-red-500 to-pink-500'
            }`}
            style={{ width: `${matchScore}%` }}
          />
        </div>
      </div>

      {/* Skills Match */}
      {skillsMatch && (
        <div className="card bg-dark-800/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Target size={18} className="text-blue-400" />
              <h4 className="font-semibold text-white">Skills Analysis</h4>
            </div>
            <span className={`font-bold ${getScoreColor(skillsMatch.matchPercentage)}`}>
              {skillsMatch.matchPercentage}%
            </span>
          </div>

          {skillsMatch.matched && skillsMatch.matched.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2 flex items-center">
                <CheckCircle size={14} className="mr-1 text-green-500" />
                Matched Skills ({skillsMatch.matched.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {skillsMatch.matched.map((skill, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {skillsMatch.missing && skillsMatch.missing.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2 flex items-center">
                <XCircle size={14} className="mr-1 text-red-500" />
                Missing Skills ({skillsMatch.missing.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {skillsMatch.missing.map((skill, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {skillsMatch.additional && skillsMatch.additional.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2 flex items-center">
                <Award size={14} className="mr-1 text-purple-500" />
                Additional Skills ({skillsMatch.additional.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {skillsMatch.additional.slice(0, 5).map((skill, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {skillsMatch.additional.length > 5 && (
                  <span className="px-2 py-1 bg-dark-700 text-gray-400 rounded text-xs">
                    +{skillsMatch.additional.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Experience Match */}
      {experienceMatch && (
        <div className="card bg-dark-800/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp size={18} className="text-cyan-400" />
              <h4 className="font-semibold text-white">Experience Match</h4>
            </div>
            <span className={`font-bold ${getScoreColor(experienceMatch.score)}`}>
              {experienceMatch.score}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Candidate</p>
              <p className="text-white font-medium">{experienceMatch.candidateYears} years</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Required</p>
              <p className="text-white font-medium">{experienceMatch.requiredYears} years</p>
            </div>
          </div>
          <div className="mt-2">
            {experienceMatch.isMatch ? (
              <span className="text-xs text-green-400 flex items-center">
                <CheckCircle size={14} className="mr-1" />
                Experience requirement met
              </span>
            ) : (
              <span className="text-xs text-yellow-400 flex items-center">
                <AlertTriangle size={14} className="mr-1" />
                Experience requirement not fully met
              </span>
            )}
          </div>
        </div>
      )}

      {/* Key Highlights */}
      {keyHighlights && keyHighlights.length > 0 && (
        <div className="card bg-dark-800/50">
          <h4 className="font-semibold text-white mb-3 flex items-center">
            <CheckCircle size={18} className="mr-2 text-green-500" />
            Key Strengths
          </h4>
          <ul className="space-y-2">
            {keyHighlights.map((highlight, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-sm text-gray-300">
                <span className="text-green-500 mt-1">✓</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {weaknesses && weaknesses.length > 0 && (
        <div className="card bg-dark-800/50">
          <h4 className="font-semibold text-white mb-3 flex items-center">
            <AlertTriangle size={18} className="mr-2 text-yellow-500" />
            Areas of Concern
          </h4>
          <ul className="space-y-2">
            {weaknesses.map((weakness, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-sm text-gray-300">
                <span className="text-yellow-500 mt-1">⚠</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
