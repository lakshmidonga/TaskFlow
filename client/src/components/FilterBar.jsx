import React from 'react';
import { Search, Filter, AlertTriangle, LayoutGrid, List, ArrowUpDown } from 'lucide-react';

export const FilterBar = ({
  search,
  setSearch,
  status,
  setStatus,
  priority,
  setPriority,
  assignee,
  setAssignee,
  isOverdueOnly,
  setIsOverdueOnly,
  sort,
  setSort,
  viewMode,
  setViewMode,
  users = [],
}) => {
  return (
    <div className="filter-bar">
      <div className="search-box-wrapper">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search tasks by title or keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-controls-group">
        {/* Status Filter */}
        <select
          className="filter-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by Status"
        >
          <option value="all">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        {/* Priority Filter */}
        <select
          className="filter-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          aria-label="Filter by Priority"
        >
          <option value="all">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Assignee Filter */}
        <select
          className="filter-select"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          aria-label="Filter by Assignee"
        >
          <option value="all">All Assignees</option>
          <option value="me">Assigned to Me</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>

        {/* Overdue Only Filter Toggle */}
        <button
          onClick={() => setIsOverdueOnly(!isOverdueOnly)}
          className={`filter-toggle-btn ${isOverdueOnly ? 'active' : ''}`}
          title="Toggle Overdue Tasks Only"
        >
          <AlertTriangle size={14} />
          <span>Overdue Only</span>
        </button>

        {/* Sorting Dropdown */}
        <select
          className="filter-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort Tasks"
        >
          <option value="due_asc">Earliest Due</option>
          <option value="due_desc">Latest Due</option>
          <option value="priority_desc">Highest Priority</option>
          <option value="created_desc">Newest Created</option>
        </select>

        {/* View Toggle */}
        <div className="view-toggle-group">
          <button
            className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
            title="Kanban Board View"
            aria-label="Kanban view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List Table View"
            aria-label="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
