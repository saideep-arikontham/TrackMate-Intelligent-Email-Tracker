import React, { useState } from 'react';
import { ArrowLeft, Plus, MoreHorizontal, Calendar, MapPin, DollarSign, Edit, Trash2 } from 'lucide-react';

const JobTracker = ({ jobs, onJobsChange, onBack }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [draggedJob, setDraggedJob] = useState(null);

  const statusColumns = [
    { id: 'applied', title: 'Applied', color: 'bg-gray-100 dark:bg-gray-700' },
    { id: 'screening', title: 'Screening', color: 'bg-blue-100 dark:bg-blue-900' },
    { id: 'interview', title: 'Interview', color: 'bg-yellow-100 dark:bg-yellow-900' },
    { id: 'offer', title: 'Offer', color: 'bg-green-100 dark:bg-green-900' },
    { id: 'rejected', title: 'Rejected', color: 'bg-red-100 dark:bg-red-900' }
  ];

  const handleDragStart = (e, job) => {
    setDraggedJob(job);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedJob && draggedJob.status !== newStatus) {
      const updatedJobs = jobs.map(job =>
        job.id === draggedJob.id ? { ...job, status: newStatus } : job
      );
      onJobsChange(updatedJobs);
    }
    setDraggedJob(null);
  };

  const handleAddJob = (jobData) => {
    const newJob = {
      id: Date.now().toString(),
      ...jobData,
      applicationDate: new Date().toISOString().split('T')[0]
    };
    onJobsChange([...jobs, newJob]);
    setShowAddForm(false);
  };

  const handleEditJob = (jobData) => {
    const updatedJobs = jobs.map(job =>
      job.id === editingJob.id ? { ...job, ...jobData } : job
    );
    onJobsChange(updatedJobs);
    setEditingJob(null);
  };

  const handleDeleteJob = (jobId) => {
    const updatedJobs = jobs.filter(job => job.id !== jobId);
    onJobsChange(updatedJobs);
  };

  const JobForm = ({ job, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      companyName: job?.companyName || '',
      positionTitle: job?.positionTitle || '',
      status: job?.status || 'applied',
      location: job?.location || '',
      salaryRange: job?.salaryRange || '',
      notes: job?.notes || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {job ? 'Edit Job Application' : 'Add New Job Application'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company Name
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Position Title
              </label>
              <input
                type="text"
                required
                value={formData.positionTitle}
                onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {statusColumns.map(column => (
                  <option key={column.id} value={column.id}>
                    {column.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Salary Range
              </label>
              <input
                type="text"
                value={formData.salaryRange}
                onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                placeholder="e.g. $100k - $120k"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {job ? 'Update' : 'Add'} Job
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const JobCard = ({ job }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, job)}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600 cursor-move hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
          {job.companyName}
        </h4>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setEditingJob(job)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Edit className="h-3 w-3" />
          </button>
          <button
            onClick={() => handleDeleteJob(job.id)}
            className="p-1 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
        {job.positionTitle}
      </p>
      
      <div className="space-y-2">
        {job.location && (
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <MapPin className="h-3 w-3" />
            <span>{job.location}</span>
          </div>
        )}
        
        {job.salaryRange && (
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <DollarSign className="h-3 w-3" />
            <span>{job.salaryRange}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="h-3 w-3" />
          <span>{new Date(job.applicationDate).toLocaleDateString()}</span>
        </div>
      </div>
      
      {job.notes && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
          {job.notes}
        </p>
      )}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Job</span>
        </button>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Job Application Tracker
      </h2>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statusColumns.map((column) => (
          <div
            key={column.id}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {column.title}
              </h3>
              <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                {jobs.filter(job => job.status === column.id).length}
              </span>
            </div>
            
            <div className="space-y-3">
              {jobs
                .filter(job => job.status === column.id)
                .map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              
              {jobs.filter(job => job.status === column.id).length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No applications</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Forms */}
      {showAddForm && (
        <JobForm
          onSubmit={handleAddJob}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingJob && (
        <JobForm
          job={editingJob}
          onSubmit={handleEditJob}
          onCancel={() => setEditingJob(null)}
        />
      )}
    </div>
  );
};

export default JobTracker;