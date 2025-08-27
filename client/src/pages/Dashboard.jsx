import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import styles from "./Dashboard.module.scss";

export default function Dashboard() {
  
  // ========== STATE MANAGEMENT ==========
  
  // Reviews data from API
  const [reviews, setReviews] = useState([]);
  
  // Toggle states for public display
  const [publicDisplay, setPublicDisplay] = useState(() => ({}));
  
  // Filter states
  const [search, setSearch] = useState("");
  const [filterProperty, setFilterProperty] = useState("");
  const [filterRating, setFilterRating] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterChannel, setFilterChannel] = useState("");
  const [sortBy, setSortBy] = useState("submittedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [dateRange, setDateRange] = useState("all");

  // UI State
  const [viewMode, setViewMode] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bulkSelectAll, setBulkSelectAll] = useState(false);
  const [selectedReviews, setSelectedReviews] = useState(new Set());
  const [error, setError] = useState(null);
  
  // ========== DATA FETCHING ==========
  
  /**
   * Fetch reviews data from API
   */
useEffect(() => {
  const fetchReviews = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/reviews/hostaway");
      const data = await response.json();

      setReviews(data.reviews);

      // initialize publicDisplay state from backend
      const initialDisplay = {};
      data.reviews.forEach(r => {
        initialDisplay[r.id] = r.publicDisplay || false;
      });
      setPublicDisplay(initialDisplay);

    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to fetch reviews.");
    }
  };

  fetchReviews();
}, []);

  // ========== REVIEW MANAGEMENT FUNCTIONS ==========
  
  /**
   * Toggle public display status for a single review and send to server
   * @param {string} id - Review ID
   */
  const togglePublicDisplay = async (id) => {
    const newDisplayStatus = !publicDisplay[id];
    setPublicDisplay((prev) => ({ ...prev, [id]: newDisplayStatus }));
    
    try {
      await fetch(`http://localhost:5000/api/reviews/hostaway/${id}/public`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicDisplay: newDisplayStatus }),
      });
    } catch (err) {
      console.error("Error updating public display status:", err);
      setError("Failed to update public display status.");
    }
  };

  // ========== BULK ACTIONS FUNCTIONS ==========
  
  /**
   * Toggle selection of all filtered reviews
   */
  const toggleSelectAll = () => {
    if (bulkSelectAll) {
      setSelectedReviews(new Set());
    } else {
      setSelectedReviews(new Set(filteredReviews.map(r => r.id)));
    }
    setBulkSelectAll(!bulkSelectAll);
  };

  /**
   * Toggle selection of a single review
   * @param {string} id - Review ID
   */
  const toggleSelectReview = (id) => {
    const newSelected = new Set(selectedReviews);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedReviews(newSelected);
    setBulkSelectAll(newSelected.size === filteredReviews.length);
  };

  /**
   * Bulk show/hide selected reviews publicly and send to server
   * @param {boolean} display - True to show, false to hide
   */
  const bulkPublicDisplay = async (display) => {
    const updates = {};
    selectedReviews.forEach(id => {
      updates[id] = display;
    });
    setPublicDisplay(prev => ({ ...prev, ...updates }));

    try {
      await Promise.all(
        Array.from(selectedReviews).map(id =>
          fetch(`http://localhost:5000/api/reviews/hostaway/${id}/public`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ publicDisplay: display }),
          })
        )
      );
    } catch (err) {
      console.error("Error updating bulk public display status:", err);
      setError("Failed to update bulk public display status.");
    }
  };

  // ========== DATA PROCESSING ==========
  
  // Get unique values for filter dropdowns
  const properties = [...new Set(reviews.map(r => r.property))];
  
  // Extract unique category keys from all reviews' ratingsByCategory objects
  const categories = [...new Set(
    reviews.flatMap(r => Object.keys(r.ratingsByCategory || {}))
  )];
  
  const channels = [...new Set(reviews.map(r => r.channel).filter(Boolean))];

  /**
   * Filter and sort reviews based on current filter criteria
   * @returns {Array} Filtered and sorted reviews
   */
  const getFilteredReviews = () => {
    let filtered = reviews.filter(r => {
      // Search filter - matches property, reviewer, or text
      const searchMatch = !search || 
        r.property.toLowerCase().includes(search.toLowerCase()) ||
        r.reviewer.toLowerCase().includes(search.toLowerCase()) ||
        r.text.toLowerCase().includes(search.toLowerCase());

      // Property filter
      const propertyMatch = !filterProperty || r.property === filterProperty;

      // Rating filter
      const ratingMatch = !filterRating || 
        (filterRating === "high" && r.ratingOverall >= 8) ||
        (filterRating === "medium" && r.ratingOverall >= 5 && r.ratingOverall < 8) ||
        (filterRating === "low" && r.ratingOverall < 5);

      // Category filter - check if the review has ratings for this category
      const categoryMatch = !filterCategory || 
        (r.ratingsByCategory && r.ratingsByCategory[filterCategory] !== undefined);

      // Channel filter
      const channelMatch = !filterChannel || r.channel === filterChannel;

      // Date range filter
      const reviewDate = new Date(r.submittedAt);
      const now = new Date();
      let dateMatch = true;
      
      if (dateRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateMatch = reviewDate > weekAgo;
      } else if (dateRange === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateMatch = reviewDate > monthAgo;
      } else if (dateRange === "quarter") {
        const quarterAgo = new Date();
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        dateMatch = reviewDate > quarterAgo;
      }

      return searchMatch && propertyMatch && ratingMatch && categoryMatch && channelMatch && dateMatch;
    });

    // Sort reviews based on selected criteria
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === "submittedAt") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  };

  // Get filtered reviews based on current criteria
  const filteredReviews = getFilteredReviews();

  /**
   * Calculate performance metrics for each property
   * @returns {Array} Property performance data
   */
  const getPropertyPerformance = () => {
    const propertyStats = {};
    
    reviews.forEach(r => {
      if (!propertyStats[r.property]) {
        propertyStats[r.property] = {
          property: r.property,
          total: 0,
          count: 0,
          ratings: [],
          publicDisplay: 0,
          issues: []
        };
      }
      
      const stats = propertyStats[r.property];
      stats.total += r.ratingOverall || 0;
      stats.count += 1;
      stats.ratings.push(r.ratingOverall || 0);
      if (publicDisplay[r.id]) stats.publicDisplay += 1;
      
      // Track potential issues (low ratings)
      if (r.ratingOverall < 7) {
        stats.issues.push({
          category: r.ratingsByCategory ? Object.keys(r.ratingsByCategory)[0] : 'General',
          text: r.text.substring(0, 50) + "...",
          rating: r.ratingOverall
        });
      }
    });
    
    // Calculate derived metrics
    return Object.values(propertyStats).map(stats => ({
      ...stats,
      avgRating: stats.count > 0 ? (stats.total / stats.count).toFixed(1) : 0,
      publicRate: ((stats.publicDisplay / stats.count) * 100).toFixed(1),
      issueCount: stats.issues.length
    }));
  };

  // Prepare chart data for rating trends
  const chartData = Object.values(
    filteredReviews.reduce((acc, r) => {
      const month = new Date(r.submittedAt).toLocaleString("default", {
        year: "numeric",
        month: "short",
      });
      if (!acc[month]) acc[month] = { month, total: 0, count: 0, positive: 0, negative: 0 };
      acc[month].total += r.ratingOverall || 0;
      acc[month].count += 1;
      if (r.ratingOverall >= 8) acc[month].positive += 1;
      if (r.ratingOverall < 6) acc[month].negative += 1;
      return acc;
    }, {})
  ).map((m) => ({
    month: m.month,
    avg: m.count > 0 ? parseFloat((m.total / m.count).toFixed(1)) : 0,
    positive: m.positive,
    negative: m.negative,
    total: m.count
  }));

  // Prepare rating distribution data for pie chart
  const ratingDistribution = [
    { rating: "1-2", count: filteredReviews.filter(r => r.ratingOverall >= 1 && r.ratingOverall <= 2).length, fill: "#ef4444" },
    { rating: "3-4", count: filteredReviews.filter(r => r.ratingOverall >= 3 && r.ratingOverall <= 4).length, fill: "#f97316" },
    { rating: "5-6", count: filteredReviews.filter(r => r.ratingOverall >= 5 && r.ratingOverall <= 6).length, fill: "#eab308" },
    { rating: "7-8", count: filteredReviews.filter(r => r.ratingOverall >= 7 && r.ratingOverall <= 8).length, fill: "#22c55e" },
    { rating: "9-10", count: filteredReviews.filter(r => r.ratingOverall >= 9 && r.ratingOverall <= 10).length, fill: "#16a34a" },
  ];

  // Get property performance data
  const propertyPerformance = getPropertyPerformance();

  // ========== UI HELPER FUNCTIONS ==========
  
  /**
   * Clear all active filters and selections
   */
  const clearAllFilters = () => {
    setSearch("");
    setFilterProperty("");
    setFilterRating("");
    setFilterCategory("");
    setFilterChannel("");
    setDateRange("all");
    setSortBy("submittedAt");
    setSortOrder("desc");
    setSelectedReviews(new Set());
    setBulkSelectAll(false);
  };

  // Check if any filters are active
  const hasActiveFilters = search || filterProperty || filterRating || filterCategory || filterChannel || dateRange !== "all";

  /**
   * Identify issues and alerts based on review data
   * @returns {Array} List of issues requiring attention
   */
  const getIssuesAndAlerts = () => {
    const issues = [];
    
    // Low rating properties
    propertyPerformance.forEach(prop => {
      if (parseFloat(prop.avgRating) < 7) {
        issues.push({
          type: "warning",
          property: prop.property,
          message: `Low average rating (${prop.avgRating}⭐)`,
          priority: "high"
        });
      }
      if (prop.issueCount > 2) {
        issues.push({
          type: "alert",
          property: prop.property,
          message: `${prop.issueCount} reviews mention issues`,
          priority: "medium"
        });
      }
    });

    return issues;
  };

  // Get current issues
  const issues = getIssuesAndAlerts();

  // ========== RENDER COMPONENT ==========
  return (
    <div className={styles.dashboard}>
      {/* Sidebar with filters and search */}
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarHeaderContent}>
            <h2 className={`${styles.sidebarTitle} ${!sidebarOpen && styles.hidden}`}>Filters & Search</h2>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={styles.toggleButton}
            >
              {sidebarOpen ? "←" : "→"}
            </button>
          </div>
        </div>

        {sidebarOpen && (
          <div className={styles.sidebarContent}>
            {/* Active Filters Indicator */}
            {hasActiveFilters && (
              <div className={styles.activeFiltersCard}>
                <div className={styles.activeFiltersHeader}>
                  <span className={styles.activeFiltersLabel}>Filters Active</span>
                  <button
                    onClick={clearAllFilters}
                    className={styles.clearFiltersButton}
                  >
                    Clear All
                  </button>
                </div>
                <p className={styles.activeFiltersCount}>
                  Showing {filteredReviews.length} of {reviews.length} reviews
                </p>
              </div>
            )}

            {/* Quick Insights */}
            {issues.length > 0 && (
              <div className={styles.issuesCard}>
                <h4 className={styles.issuesTitle}>⚠️ Issues Detected</h4>
                <div className={styles.issuesList}>
                  {issues.slice(0, 3).map((issue, idx) => (
                    <p key={idx} className={styles.issueItem}>
                      <strong>{issue.property}:</strong> {issue.message}
                    </p>
                  ))}
                  {issues.length > 3 && (
                    <p className={styles.moreIssues}>+{issues.length - 3} more issues</p>
                  )}
                </div>
              </div>
            )}

            {/* Search */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>🔍 Search</label>
              <input
                type="text"
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.input}
              />
            </div>

            {/* Property Filter */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>🏠 Property</label>
              <select
                value={filterProperty}
                onChange={(e) => setFilterProperty(e.target.value)}
                className={styles.select}
              >
                <option value="">All Properties</option>
                {properties.map(prop => (
                  <option key={prop} value={prop}>{prop}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>⭐ Rating Range</label>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className={styles.select}
              >
                <option value="">All Ratings</option>
                <option value="high">High (8-10)</option>
                <option value="medium">Medium (5-7)</option>
                <option value="low">Low (1-4)</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>📋 Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={styles.select}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Channel Filter */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>📺 Channel</label>
              <select
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value)}
                className={styles.select}
              >
                <option value="">All Channels</option>
                {channels.map(channel => (
                  <option key={channel} value={channel}>{channel}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>📅 Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={styles.select}
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className={styles.sortSection}>
              <h3 className={styles.sortTitle}>📊 Sort Options</h3>
              
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.select}
                >
                  <option value="submittedAt">Date</option>
                  <option value="ratingOverall">Rating</option>
                  <option value="property">Property</option>
                  <option value="reviewer">Reviewer</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className={styles.select}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.headerTitle}>reviews Dashboard</h1>
            <p className={styles.headerSubtitle}>Monitor property performance and manage review visibility</p>
            {hasActiveFilters && (
              <div className={styles.headerBadge}>
                <span className={styles.filterBadge}>
                  Filtered Results: {filteredReviews.length}/{reviews.length}
                </span>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className={styles.tabsContainer}>
            <button
              onClick={() => setViewMode("overview")}
              className={`${styles.tab} ${viewMode === "overview" ? styles.tabActive : ''}`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setViewMode("reviews")}
              className={`${styles.tab} ${viewMode === "reviews" ? styles.tabActive : ''}`}
            >
              📝 Review Management
            </button>
            <button
              onClick={() => setViewMode("analytics")}
              className={`${styles.tab} ${viewMode === "analytics" ? styles.tabActive : ''}`}
            >
              📈 Analytics
            </button>
          </div>

          {/* Content based on selected view mode */}
          <div className={styles.contentWrapper}>
            {viewMode === "overview" && (
              <div className={styles.overviewContent}>
                {/* KPI Cards */}
                <div className={styles.kpiGrid}>
                  <div className={`${styles.kpiCard} ${styles.kpiCardBlue}`}>
                    <div className={styles.kpiCardContent}>
                      <div className={styles.kpiIcon}>
                        <span>⭐</span>
                      </div>
                      <div className={styles.kpiDetails}>
                        <p className={styles.kpiLabel}>Avg Rating</p>
                        <p className={styles.kpiValue}>
                          {filteredReviews.length > 0 
                            ? (filteredReviews.reduce((acc, r) => acc + (r.ratingOverall || 0), 0) / filteredReviews.length).toFixed(1)
                            : "0.0"}
                        </p>
                        <p className={styles.kpiSubtext}>
                          {filteredReviews.filter(r => r.ratingOverall >= 8).length} high ratings
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`${styles.kpiCard} ${styles.kpiCardGreen}`}>
                    <div className={styles.kpiCardContent}>
                      <div className={styles.kpiIcon}>
                        <span>📝</span>
                      </div>
                      <div className={styles.kpiDetails}>
                        <p className={styles.kpiLabel}>Total Reviews</p>
                        <p className={styles.kpiValue}>{filteredReviews.length}</p>
                        <p className={styles.kpiSubtext}>
                          {Math.round((filteredReviews.length / reviews.length) * 100)}% of all reviews
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`${styles.kpiCard} ${styles.kpiCardOrange}`}>
                    <div className={styles.kpiCardContent}>
                      <div className={styles.kpiIcon}>
                        <span>🌐</span>
                      </div>
                      <div className={styles.kpiDetails}>
                        <p className={styles.kpiLabel}>Public Display</p>
                        <p className={styles.kpiValue}>
                          {filteredReviews.filter(r => publicDisplay[r.id]).length}
                        </p>
                        <p className={styles.kpiSubtext}>
                          {filteredReviews.length > 0 ? Math.round((filteredReviews.filter(r => publicDisplay[r.id]).length / filteredReviews.length) * 100) : 0}% public rate
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Row */}
                <div className={styles.chartsGrid}>
                  <div className={styles.chartContainer}>
                    <h3 className={styles.chartTitle}>Rating Trends {hasActiveFilters && "(Filtered)"}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className={styles.chartContainer}>
                    <h3 className={styles.chartTitle}>Rating Distribution {hasActiveFilters && "(Filtered)"}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={ratingDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ rating, count }) => count > 0 ? `${rating}: ${count}` : ''}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {ratingDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Issues Alert */}
                {issues.length > 0 && (
                  <div className={styles.alertCard}>
                    <h3 className={styles.alertTitle}>⚠️ Action Required</h3>
                    <div className={styles.alertGrid}>
                      {issues.map((issue, idx) => (
                        <div key={idx} className={styles.alertItem}>
                          <div className={styles.alertItemHeader}>
                            <h4 className={styles.alertItemTitle}>{issue.property}</h4>
                            <span className={`${styles.priorityBadge} ${styles[`priority${issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}`]}`}>
                              {issue.priority}
                            </span>
                          </div>
                          <p className={styles.alertItemMessage}>{issue.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {viewMode === "analytics" && (
              <div className={styles.analyticsContent}>
                {/* Property Performance Table */}
                <div className={styles.tableContainer}>
                  <div className={styles.tableHeader}>
                    <h3 className={styles.tableTitle}>Property Performance Overview</h3>
                    <p className={styles.tableSubtitle}>Compare performance across all properties</p>
                  </div>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead className={styles.tableHead}>
                        <tr>
                          <th className={styles.tableHeadCell}>Property</th>
                          <th className={styles.tableHeadCell}>Reviews</th>
                          <th className={styles.tableHeadCell}>Avg Rating</th>
                          <th className={styles.tableHeadCell}>Issues</th>
                          <th className={styles.tableHeadCell}>Public Display</th>
                          <th className={styles.tableHeadCell}>Status</th>
                        </tr>
                      </thead>
                      <tbody className={styles.tableBody}>
                        {propertyPerformance.map((prop, index) => (
                          <tr key={index} className={styles.tableRow}>
                            <td className={styles.tableCell}>{prop.property}</td>
                            <td className={styles.tableCell}>{prop.count}</td>
                            <td className={styles.tableCell}>
                              <div className={styles.ratingCell}>
                                <span className={`${styles.ratingValue} ${
                                  parseFloat(prop.avgRating) >= 8 ? styles.ratingHigh :
                                  parseFloat(prop.avgRating) >= 7 ? styles.ratingMedium : styles.ratingLow
                                }`}>
                                  {prop.avgRating}
                                </span>
                                <span className={styles.ratingIcon}>⭐</span>
                              </div>
                            </td>
                            <td className={styles.tableCell}>
                              {prop.issueCount > 0 ? (
                                <span className={styles.issueBadge}>
                                  {prop.issueCount} issues
                                </span>
                              ) : (
                                <span className={styles.noIssues}>None</span>
                              )}
                            </td>
                            <td className={styles.tableCell}>
                              <span className={`${styles.rateBadge} ${
                                parseFloat(prop.publicRate) >= 60 ? styles.rateHigh :
                                parseFloat(prop.publicRate) >= 30 ? styles.rateMedium :
                                styles.rateLow
                              }`}>
                                {prop.publicRate}%
                              </span>
                            </td>
                            <td className={styles.tableCell}>
                              {parseFloat(prop.avgRating) >= 8 && prop.issueCount === 0 ? (
                                <span className={`${styles.statusBadge} ${styles.statusExcellent}`}>
                                  Excellent
                                </span>
                              ) : parseFloat(prop.avgRating) >= 7 ? (
                                <span className={`${styles.statusBadge} ${styles.statusGood}`}>
                                  Good
                                </span>
                              ) : (
                                <span className={`${styles.statusBadge} ${styles.statusAttention}`}>
                                  Needs Attention
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Channel Performance */}
                <div className={styles.chartsGrid}>
                  <div className={styles.chartContainer}>
                    <h3 className={styles.chartTitle}>Performance by Channel</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={channels.map(channel => {
                        const channelReviews = reviews.filter(r => r.channel === channel);
                        const avgRating = channelReviews.reduce((acc, r) => acc + (r.ratingOverall || 0), 0) / channelReviews.length;
                        return {
                          channel,
                          avgRating: parseFloat(avgRating.toFixed(1)),
                          count: channelReviews.length
                        };
                      })}>
                        <XAxis dataKey="channel" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Bar dataKey="avgRating" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className={styles.chartContainer}>
                    <h3 className={styles.chartTitle}>Review Volume by Month</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {viewMode === "reviews" && (
              <div className={styles.reviewsContent}>
                {/* Bulk Actions */}
                {selectedReviews.size > 0 && (
                  <div className={styles.bulkActionsCard}>
                    <div className={styles.bulkActionsContent}>
                      <div className={styles.bulkActionsInfo}>
                        <h4 className={styles.bulkActionsTitle}>
                          {selectedReviews.size} review{selectedReviews.size !== 1 ? 's' : ''} selected
                        </h4>
                        <p className={styles.bulkActionsSubtitle}>Choose bulk actions to apply</p>
                      </div>
                      <div className={styles.bulkActionButtons}>
                        <button
                          onClick={() => bulkPublicDisplay(true)}
                          className={`${styles.button} ${styles.buttonPrimary}`}
                        >
                          Show Public
                        </button>
                        <button
                          onClick={() => bulkPublicDisplay(false)}
                          className={`${styles.button} ${styles.buttonSecondary}`}
                        >
                          Hide Public
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Results Summary */}
                <div className={styles.resultsSummaryCard}>
                  <div className={styles.resultsSummaryContent}>
                    <p className={styles.resultsSummaryText}>
                      Showing <strong>{filteredReviews.length}</strong> of <strong>{reviews.length}</strong> reviews
                      {hasActiveFilters && " (filtered)"}
                    </p>
                    {filteredReviews.length > 0 && (
                      <div className={styles.selectAllWrapper}>
                        <label className={styles.selectAllLabel}>
                          <input
                            type="checkbox"
                            checked={bulkSelectAll}
                            onChange={toggleSelectAll}
                            className={styles.checkbox}
                          />
                          <span className={styles.selectAllText}>Select All</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reviews Grid */}
                <div className={styles.reviewsGrid}>
                  {filteredReviews.map((review) => (
                    <div key={review.id} className={styles.reviewCard}>
                      <div className={styles.reviewCardHeader}>
                        <div className={styles.reviewCardLeft}>
                          <input
                            type="checkbox"
                            checked={selectedReviews.has(review.id)}
                            onChange={() => toggleSelectReview(review.id)}
                            className={styles.checkbox}
                          />
                          <div className={styles.reviewInfo}>
                            <h4 className={styles.reviewProperty}>{review.property}</h4>
                            <p className={styles.reviewAuthor}>{review.reviewer}</p>
                          </div>
                        </div>
                        <div className={styles.reviewCardRight}>
                          <div className={styles.reviewRating}>
                            <span className={`${styles.ratingValue} ${
                              review.ratingOverall >= 8 ? styles.ratingHigh :
                              review.ratingOverall >= 6 ? styles.ratingMedium : styles.ratingLow
                            }`}>
                              {review.ratingOverall || "N/A"}
                            </span>
                            <span className={styles.ratingIcon}>⭐</span>
                          </div>
                          <p className={styles.reviewDate}>
                            {new Date(review.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <blockquote className={styles.reviewText}>
                        "{review.text}"
                      </blockquote>

                      <div className={styles.reviewCardFooter}>
                        <div className={styles.reviewTags}>
                          {review.ratingsByCategory && Object.keys(review.ratingsByCategory).length > 0 && (
                            <span className={`${styles.tag} ${styles.tagCategory}`}>
                              {Object.keys(review.ratingsByCategory)[0].replace(/_/g, " ")}
                            </span>
                          )}
                          {review.channel && (
                            <span className={`${styles.tag} ${styles.tagChannel}`}>
                              {review.channel}
                            </span>
                          )}
                          {review.ratingOverall < 7 && (
                            <span className={`${styles.tag} ${styles.tagWarning}`}>
                              ⚠️ Needs Attention
                            </span>
                          )}
                        </div>
                        
                        <div className={styles.reviewActions}>
                          <label className={styles.actionLabel}>
                            <input
                              type="checkbox"
                              checked={publicDisplay[review.id] || false}
                              onChange={() => togglePublicDisplay(review.id)}
                              className={styles.checkbox}
                            />
                            <span className={styles.actionText}>Public Display</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredReviews.length === 0 && (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyStateIcon}>📭</div>
                      <h3 className={styles.emptyStateTitle}>No reviews found</h3>
                      <p className={styles.emptyStateText}>Try adjusting your filters to see more results.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}