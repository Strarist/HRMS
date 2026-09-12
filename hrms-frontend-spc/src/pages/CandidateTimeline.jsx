import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Calendar, Clock, User, CheckCircle, XCircle,
  AlertCircle, Video, Users, Star, MessageSquare, FileText, Send, Loader, SkipForward, UserPlus
} from 'lucide-react';
import api from '../api/axios';
import toast from '../utils/toast';
import InterviewScheduleModal from '../components/InterviewScheduleModal';
import InterviewFeedbackModal from '../components/InterviewFeedbackModal';
import HRCallModal from '../components/HRCallModal';
import { config } from '../config/api.config';

const CandidateTimeline = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  
  const [candidate, setCandidate] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showHRCallModal, setShowHRCallModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [skippedStages, setSkippedStages] = useState(new Set()); // Track manually skipped stages
  const [processingOnboarding, setProcessingOnboarding] = useState(false);

  useEffect(() => {
    fetchCandidateData();
  }, [candidateId]);

  const [showAllApplications, setShowAllApplications] = useState(false);
  const [candidateHistory, setCandidateHistory] = useState(null);

  const fetchCandidateData = async () => {
    try {
      setLoading(true);
      const [candidateRes, timelineRes, historyRes] = await Promise.all([
        api.get(`/candidates/${candidateId}`),
        api.get(`/candidates/${candidateId}/timeline`),
        api.get(`/candidates/${candidateId}/history`).catch(() => null) // Optional, don't fail if not available
      ]);
      
      setCandidate(candidateRes.data.data);
      // Backend returns: { timeline, interviews, notifications, hrCall, stage, status }
      const timelineData = timelineRes.data.data;
      setTimeline({
        timeline: timelineData.timeline || [],
        interviews: timelineData.interviews || [],
        notifications: timelineData.notifications || {},
        hrCall: timelineData.hrCall || {},
        stage: timelineData.stage,
        status: timelineData.status
      });
      
      if (historyRes?.data?.success) {
        setCandidateHistory(historyRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to load candidate data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (type, notes = '') => {
    try {
      setSendingNotification(true);
      // Use current origin to ensure correct URL in all environments
      const currentUrl = window.location.origin;
      await api.post(`/candidates/${candidateId}/notification`, {
        type,
        notes,
        frontendUrl: currentUrl
      });
      toast.success('Notification sent successfully');
      fetchCandidateData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setSendingNotification(false);
    }
  };

  // Shared helper to prepare and send candidate to onboarding
  const triggerOnboarding = async ({
    confirmMessage,
    notes,
    skipStageName
  } = {}) => {
    if (processingOnboarding) {
      return;
    }

    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }

    try {
      setProcessingOnboarding(true);

      if (!candidate) {
        throw new Error('Candidate data not loaded');
      }

      const validStages = ['offer-accepted', 'interview-completed', 'offer-extended', 'shortlisted'];
      const fallbackStage = 'offer-accepted';

      // If we need to record a skipped stage, move candidate to fallback stage while logging skip
      if (skipStageName) {
        await api.post(`/candidates/${candidateId}/move-to-stage`, {
          targetStage: fallbackStage,
          skipIntermediate: true,
          reason: notes || `Skipped ${skipStageName} stage to move candidate to onboarding`,
          skippedStage: skipStageName
        });

        setSkippedStages(prev => new Set([...prev, skipStageName]));
      }

      // Ensure candidate is in a valid stage before sending to onboarding
      const currentStage = skipStageName ? fallbackStage : candidate.stage;
      if (!validStages.includes(currentStage)) {
        await api.post(`/candidates/${candidateId}/move-to-stage`, {
          targetStage: fallbackStage,
          skipIntermediate: true,
          reason: 'Auto-stage change to prepare candidate for onboarding'
        });
      }

      await api.post(`/candidates/${candidateId}/send-to-onboarding`, {
        notes: notes || 'Candidate sent to onboarding from candidate timeline'
      });

      toast.success('Candidate moved to onboarding');
      await fetchCandidateData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to move candidate to onboarding');
      console.error('Onboarding trigger error:', error);
    } finally {
      setProcessingOnboarding(false);
    }
  };

  // Helper function to check if a stage was skipped
  const isStageSkipped = (stageName) => {
    // First check manually tracked skipped stages
    if (skippedStages.has(stageName)) {
      return true;
    }

    // Then check timeline activities for explicit skipped stage information
    const isSkipped = timeline.timeline?.some(activity => {
      // First check if this activity explicitly marks this stage as skipped
      if (activity.skippedStage === stageName) {
        return true;
      }

      // Fallback to string matching for backward compatibility
      const action = (activity.action || '').toLowerCase();
      const description = (activity.description || '').toLowerCase();
      const reason = (activity.reason || '').toLowerCase();

      // Check for skip indicators
      const hasSkipIndicator = action.includes('skip') || description.includes('skip') || reason.includes('skip');

      // Only use string matching for backward compatibility - be very specific
      // Check if the description explicitly mentions skipping this specific stage
      const explicitlyMentionsThisStage = description.includes(`skipped ${stageName}`) ||
                                          reason.includes(`skipped ${stageName}`);

      let hasStageMatch = false;

      if (explicitlyMentionsThisStage) {
        hasStageMatch = true;
      } else {
        // Fallback to keyword matching but be more restrictive
        const stageKeywords = stageName.toLowerCase().split(' ');
        hasStageMatch = stageKeywords.every(keyword =>
          description.includes(keyword) || reason.includes(keyword)
        );
      }

      const result = hasSkipIndicator && hasStageMatch;

      return result;
    });

    return isSkipped;
  };

  // Helper function to check if a stage is accessible (completed OR previous stage was skipped)
  const isStageAccessible = (stageName, previousStageName = null) => {
    // If this stage itself is skipped, it's not accessible
    if (isStageSkipped(stageName)) {
      return false;
    }

    // If there's no previous stage requirement, stage is accessible
    if (!previousStageName) {
      return true;
    }

    // Stage is accessible if previous stage is either completed OR skipped
    return isPreviousStageCompleted(stageName) || isStageSkipped(previousStageName);
  };

  // Helper function to check if previous stage conditions are met
  const isPreviousStageCompleted = (currentStageName) => {
    switch (currentStageName) {
      case 'Interview Scheduling':
        return timeline.notifications?.interviewEmail?.sent || timeline.notifications?.interviewCall?.completed;
      case 'HR Call':
        // If Interview Scheduling was skipped, HR Call is accessible without interviews
        if (isStageSkipped('Interview Scheduling')) {
          return true;
        }
        // Otherwise, require at least one interview to exist
        return timeline.interviews?.length > 0;
      case 'Onboarding':
        return timeline.hrCall?.status === 'completed';
      default:
        return true;
    }
  };

  const getStageIcon = (stage) => {
    const icons = {
      'applied': User,
      'screening': FileText,
      'shortlisted': CheckCircle,
      'interview-scheduled': Calendar,
      'interview-completed': Video,
      'offer-extended': Mail,
      'offer-accepted': CheckCircle,
      'rejected': XCircle
    };
    return icons[stage] || AlertCircle;
  };

  const getStageColor = (stage) => {
    const colors = {
      'applied': 'bg-blue-500',
      'screening': 'bg-yellow-500',
      'shortlisted': 'bg-purple-500',
      'interview-scheduled': 'bg-indigo-500',
      'interview-completed': 'bg-cyan-500',
      'offer-extended': 'bg-green-500',
      'offer-accepted': 'bg-emerald-500',
      'rejected': 'bg-red-500'
    };
    return colors[stage] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-12 h-12 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Candidate not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="btn-outline p-2">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {candidate.firstName} {candidate.lastName}
            </h1>
            <p className="text-gray-400 mt-1">Hiring Journey Timeline</p>
          </div>
        </div>
      </div>

      {/* Candidate Info Card */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Email</p>
            <p className="text-white font-medium">{candidate.email}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Phone</p>
            <p className="text-white font-medium">{candidate.phone}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Applied For</p>
            <p className="text-white font-medium">{candidate.appliedFor?.title || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* All Applications History */}
      {candidateHistory && candidateHistory.applications && candidateHistory.applications.length > 1 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">All Applications History</h2>
            <button
              onClick={() => setShowAllApplications(!showAllApplications)}
              className="btn-outline btn-sm"
            >
              {showAllApplications ? 'Hide' : 'Show'} All Applications
            </button>
          </div>
          {showAllApplications && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Total Applications: {candidateHistory.totalApplications}
              </p>
              <div className="space-y-3">
                {candidateHistory.applications.map((app, index) => (
                  <div key={app.id || index} className="bg-dark-800 rounded-lg p-4 border border-dark-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">{app.jobTitle || 'N/A'}</h3>
                        <p className="text-sm text-gray-400">
                          Applied: {new Date(app.appliedDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-400">
                          Stage: <span className="capitalize">{app.stage}</span> | Status: <span className="capitalize">{app.status}</span>
                        </p>
                        {app.interviews && app.interviews.length > 0 && (
                          <p className="text-sm text-gray-400 mt-1">
                            Interviews: {app.interviews.length}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/candidates/${app.id}/timeline`)}
                        className="btn-outline btn-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timeline Stepper */}
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-6">Hiring Process</h2>
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-dark-800"></div>
          
          <div className="space-y-8">
            {/* Step 1: Notification */}
            <TimelineStep
              icon={Mail}
              title="Interview Notification"
              color="bg-blue-500"
              completed={timeline.notifications?.interviewEmail?.sent || timeline.notifications?.interviewCall?.completed}
              skipped={isStageSkipped('Interview Notification')}
            >
              <div className="space-y-3">
                {!timeline.notifications?.interviewEmail?.sent && !timeline.notifications?.interviewCall?.completed && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-3">
                    <p className="text-sm text-blue-400 flex items-center">
                      <AlertCircle size={16} className="mr-2" />
                      Start by sending an email or marking the call as done to proceed with interview scheduling
                    </p>
                  </div>
                )}
                {!isStageSkipped('Interview Notification') && (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleSendNotification('interviewEmail')}
                      disabled={sendingNotification || timeline.notifications?.interviewEmail?.sent}
                      className={`btn-sm ${timeline.notifications?.interviewEmail?.sent ? 'btn-success' : 'btn-primary'}`}
                    >
                      <Mail size={16} className="mr-2" />
                      {timeline.notifications?.interviewEmail?.sent ? 'Email Sent' : 'Send Email'}
                    </button>
                    <button
                      onClick={() => {
                        const notes = prompt('Add call notes:');
                        if (notes !== null) handleSendNotification('interviewCall', notes);
                      }}
                      disabled={sendingNotification || timeline.notifications?.interviewCall?.completed}
                      className={`btn-sm ${timeline.notifications?.interviewCall?.completed ? 'btn-success' : 'btn-outline'}`}
                    >
                      <Phone size={16} className="mr-2" />
                      {timeline.notifications?.interviewCall?.completed ? 'Call Done' : 'Mark Call Done'}
                    </button>
                  </div>
                )}
                {timeline.notifications?.interviewEmail?.sent && timeline.notifications.interviewEmail.sentAt && (
                  <p className="text-sm text-gray-400">
                    Email sent on {new Date(timeline.notifications.interviewEmail.sentAt).toLocaleString()}
                  </p>
                )}
                {timeline.notifications?.interviewCall?.completed && timeline.notifications.interviewCall.completedAt && (
                  <p className="text-sm text-gray-400">
                    Call completed on {new Date(timeline.notifications.interviewCall.completedAt).toLocaleString()}
                    {timeline.notifications.interviewCall.notes && ` - ${timeline.notifications.interviewCall.notes}`}
                  </p>
                )}
                {!isStageSkipped('Interview Notification') && (
                  <button
                    onClick={async () => {
                      if (!window.confirm('Skip Interview Notification stage and move to Interview Scheduling? This will make this stage inaccessible.')) {
                        return;
                      }
                    try {
                      const response = await api.post(`/candidates/${candidateId}/move-to-stage`, {
                        targetStage: 'interview-scheduled',
                        skipIntermediate: true,
                        reason: 'Skipped Interview Notification stage',
                        skippedStage: 'Interview Notification' // Explicitly specify which stage is skipped
                      });
                      // Mark this specific stage as skipped immediately
                      setSkippedStages(prev => new Set([...prev, 'Interview Notification']));

                      toast.success('Interview Notification skipped - you can now schedule interviews');
                      await fetchCandidateData(); // Wait for data to be fetched
                    } catch (error) {
                      toast.error(error.response?.data?.message || 'Failed to skip stage');
                    }
                    }}
                    className="btn-outline btn-sm mt-2"
                  >
                    <SkipForward size={16} className="mr-2" />
                    Skip This Stage
                  </button>
                )}
              </div>
            </TimelineStep>

            {/* Step 2: Interview Scheduling */}
            <TimelineStep
              icon={Calendar}
              title="Interview Scheduling"
              color="bg-indigo-500"
              completed={timeline.interviews?.length > 0}
              skipped={isStageSkipped('Interview Scheduling')}
            >
              <div className="space-y-3">
                {!isStageAccessible('Interview Scheduling', 'Interview Notification') && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3">
                    <p className="text-sm text-yellow-400 flex items-center">
                      <AlertCircle size={16} className="mr-2" />
                      {isStageSkipped('Interview Notification')
                        ? 'Previous stage was skipped - you can now schedule interviews'
                        : 'Please send interview notification email before scheduling interviews'
                      }
                    </p>
                  </div>
                )}
                {!isStageSkipped('Interview Scheduling') && (
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    disabled={!isStageAccessible('Interview Scheduling', 'Interview Notification')}
                    className={`btn-sm ${
                      isStageAccessible('Interview Scheduling', 'Interview Notification')
                        ? 'btn-primary'
                        : 'btn-outline opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <Calendar size={16} className="mr-2" />
                    Schedule Interview
                  </button>
                )}
                
                {timeline.interviews?.map((interview, idx) => (
                  <div key={interview._id} className="card bg-dark-800/50 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-white">{interview.interviewType}</span>
                          <span className={`badge ${
                            interview.status === 'completed' ? 'badge-success' :
                            interview.status === 'scheduled' ? 'badge-info' : 'badge-warning'
                          }`}>
                            {interview.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <p><Calendar size={14} className="inline mr-2" />
                            {new Date(interview.scheduledDate).toLocaleDateString()} at {interview.scheduledTime}
                          </p>
                          <p><Video size={14} className="inline mr-2" />{interview.meetingPlatform}</p>
                          {interview.meetingLink && (
                            <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" 
                               className="text-primary-500 hover:underline">
                              Join Meeting
                            </a>
                          )}
                        </div>
                        {interview.feedback && (
                          <div className="mt-2 p-2 bg-dark-700 rounded">
                            <p className="text-sm text-gray-300">{interview.feedback}</p>
                            {interview.rating && (
                              <div className="flex items-center mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={14} 
                                    className={i < interview.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'} 
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {(interview.status === 'scheduled' || (interview.status === 'completed' && !interview.feedback)) && (
                        <button
                          onClick={() => {
                            setSelectedInterview(interview);
                            setShowFeedbackModal(true);
                          }}
                          className={`btn-sm ${
                            interview.status === 'completed' && !interview.feedback
                              ? 'btn-primary animate-pulse'
                              : 'btn-outline'
                          }`}
                        >
                          {interview.status === 'completed' && !interview.feedback ? (
                            <>
                              <AlertCircle size={14} className="mr-1" />
                              Add Feedback (Required)
                            </>
                          ) : (
                            'Add Feedback'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {!isStageSkipped('Interview Scheduling') && (
                  <button
                    onClick={async () => {
                      if (!window.confirm('Skip Interview Scheduling stage and move to HR Call? This will make this stage inaccessible.')) {
                        return;
                      }
                      try {
                        await api.post(`/candidates/${candidateId}/move-to-stage`, {
                          targetStage: 'interview-completed',
                          skipIntermediate: true,
                          reason: 'Skipped Interview Scheduling stage',
                          skippedStage: 'Interview Scheduling'
                        });

                        // Mark this specific stage as skipped immediately
                        setSkippedStages(prev => new Set([...prev, 'Interview Scheduling']));

                        toast.success('Interview Scheduling skipped - you can now conduct HR Call');
                        fetchCandidateData();
                      } catch (error) {
                        toast.error(error.response?.data?.message || 'Failed to skip stage');
                      }
                    }}
                    className="btn-outline btn-sm mt-2"
                  >
                    <SkipForward size={16} className="mr-2" />
                    Skip This Stage
                  </button>
                )}
              </div>
            </TimelineStep>

            {/* Step 3: HR Call */}
            <TimelineStep
              icon={Phone}
              title="HR Call / Final Discussion"
              color="bg-purple-500"
              completed={timeline.hrCall?.status === 'completed'}
              skipped={isStageSkipped('HR Call')}
            >
              <div className="space-y-3">
                {(() => {
                  const hasCompletedInterview = timeline.interviews?.some(
                    interview => interview.status === 'completed' && interview.feedback && interview.rating
                  );
                  const isPreviousStageAccessible = isStageAccessible('HR Call', 'Interview Scheduling');
                  const interviewSchedulingSkipped = isStageSkipped('Interview Scheduling');



                  return (
                    <>
                      {!hasCompletedInterview && !interviewSchedulingSkipped && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3">
                          <p className="text-sm text-yellow-400 flex items-center">
                            <AlertCircle size={16} className="mr-2" />
                            Complete at least one interview with feedback before conducting HR call
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
                {!isStageSkipped('HR Call') && (() => {
                  const hrCallAccessible = isStageAccessible('HR Call', 'Interview Scheduling');

                  return (
                    <button
                      onClick={() => setShowHRCallModal(true)}
                      disabled={!hrCallAccessible}
                      className={`btn-sm ${
                        hrCallAccessible
                          ? 'btn-primary'
                          : 'btn-outline opacity-50 cursor-not-allowed'
                      }`}
                      title={!hrCallAccessible ? 'Complete interview with feedback first, or skip interview scheduling' : 'Conduct HR Call'}
                    >
                      <Phone size={16} className="mr-2" />
                      {timeline.hrCall?.status === 'completed' ? 'Update HR Call' : 'Conduct HR Call'}
                    </button>
                  );
                })()}
                
                {timeline.hrCall && timeline.hrCall.status !== 'pending' && (
                  <div className="card bg-dark-800/50 p-4">
                    <p className="text-sm text-gray-400">
                      Status: <span className="text-white capitalize">{timeline.hrCall.status}</span>
                    </p>
                    {timeline.hrCall.summary && (
                      <p className="text-sm text-gray-300 mt-2">{timeline.hrCall.summary}</p>
                    )}
                    {timeline.hrCall.decision && timeline.hrCall.decision !== 'pending' && (
                      <p className="text-sm mt-2">
                        Decision: <span className={`font-semibold ${
                          timeline.hrCall.decision === 'move-to-onboarding' ? 'text-green-400' :
                          timeline.hrCall.decision === 'reject' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {timeline.hrCall.decision.replace(/-/g, ' ').toUpperCase()}
                        </span>
                      </p>
                    )}
                  </div>
                )}
                {!isStageSkipped('HR Call') && (
                  <button
                    onClick={() => triggerOnboarding({
                      confirmMessage: 'Skip HR Call stage and move to Onboarding? This will make this stage inaccessible.',
                      notes: 'Skipped HR Call stage - moved candidate to onboarding',
                      skipStageName: 'HR Call'
                    })}
                    disabled={processingOnboarding}
                    className="btn-outline btn-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SkipForward size={16} className="mr-2" />
                    Skip This Stage
                  </button>
                )}
              </div>
            </TimelineStep>

            {/* Step 4: Onboarding/Rejection */}
            <TimelineStep
              icon={candidate.status === 'rejected' ? XCircle : CheckCircle}
              title={candidate.status === 'rejected' ? 'Rejected' : 'Onboarding'}
              color={candidate.status === 'rejected' ? 'bg-red-500' : 'bg-green-500'}
              completed={candidate.stage === 'joined' || candidate.status === 'rejected'}
            >
              {candidate.stage === 'joined' && (
                <p className="text-green-400">Candidate has been moved to onboarding</p>
              )}
              {candidate.status === 'rejected' && (
                <p className="text-red-400">Candidate was rejected</p>
              )}
              {candidate.stage !== 'joined' && candidate.status !== 'rejected' && (
                <button
                  onClick={() => triggerOnboarding({
                    confirmMessage: 'Move candidate directly to onboarding?',
                    notes: 'Direct move to onboarding from candidate timeline'
                  })}
                  disabled={processingOnboarding}
                  className="btn-success btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus size={16} className="mr-2" />
                  {processingOnboarding ? 'Processing...' : 'Move to Onboarding'}
                </button>
              )}
            </TimelineStep>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-6">Activity Log</h2>
        <div className="space-y-4">
          {timeline.timeline?.map((activity, idx) => (
            <div key={idx} className="flex items-start space-x-4 pb-4 border-b border-dark-800 last:border-0">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="font-semibold text-white">{activity.action}</p>
                <p className="text-sm text-gray-400">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.timestamp).toLocaleString()}
                  {activity.performedBy && ` • by ${activity.performedBy.firstName} ${activity.performedBy.lastName}`}
                </p>
              </div>
            </div>
          ))}
          {(!timeline.timeline || timeline.timeline.length === 0) && (
            <p className="text-gray-400 text-center py-4">No activity recorded yet</p>
          )}
        </div>
      </div>

      {/* Modals */}
      {showScheduleModal && (
        <InterviewScheduleModal
          candidateId={candidateId}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            setShowScheduleModal(false);
            fetchCandidateData();
          }}
        />
      )}

      {showFeedbackModal && selectedInterview && (
        <InterviewFeedbackModal
          candidateId={candidateId}
          interview={selectedInterview}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedInterview(null);
          }}
          onSuccess={() => {
            setShowFeedbackModal(false);
            setSelectedInterview(null);
            fetchCandidateData();
          }}
        />
      )}

      {showHRCallModal && (
        <HRCallModal
          candidateId={candidateId}
          hrCall={timeline.hrCall}
          onClose={() => setShowHRCallModal(false)}
          onSuccess={() => {
            setShowHRCallModal(false);
            fetchCandidateData();
          }}
        />
      )}
    </div>
  );
};

// Timeline Step Component
const TimelineStep = ({ icon: Icon, title, color, completed, skipped, children }) => {
  return (
    <div className={`relative flex items-start space-x-4 ${skipped ? 'opacity-60 pointer-events-none select-none' : ''}`}>
      <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${
        skipped ? 'bg-gray-500' :
        completed ? color :
        'bg-gray-700 opacity-50'
      }`}>
        {skipped ? (
          <SkipForward size={20} className="text-white" />
        ) : (
          <Icon size={24} className="text-white" />
        )}
      </div>
      <div className="flex-1 pb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-lg font-semibold ${skipped ? 'text-gray-500' : 'text-white'}`}>
            {title}
            {skipped && <span className="ml-2 text-xs bg-gray-600 px-2 py-1 rounded">Skipped</span>}
          </h3>
        </div>
        {skipped ? (
          <div className="text-sm text-gray-500 italic">
            This stage was skipped and is no longer accessible.
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default CandidateTimeline;
