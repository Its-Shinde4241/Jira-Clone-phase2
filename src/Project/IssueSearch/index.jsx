import React, { Fragment, useEffect, useState } from 'react';
// import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { sortByNewest } from 'shared/utils/javascript';
import { IssueTypeIcon } from 'shared/components';

import { supabase } from 'config/supabaseClient';
import NoResultsSVG from './NoResultsSvg';
import {
  IssueSearch,
  SearchInputCont,
  SearchInputDebounced,
  SearchIcon,
  SearchSpinner,
  Issue,
  IssueData,
  IssueTitle,
  IssueTypeId,
  SectionTitle,
  NoResults,
  NoResultsTitle,
  NoResultsTip,
} from './Styles';

const propTypes = {};

const ProjectIssueSearch = () => {
  const [totalIssues, setIssues] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchTermEmpty, setIsSearchTermEmpty] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all issues on mount (for recent issues)
  useEffect(() => {
    const fetchAllIssues = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('issues').select('*');

      if (error) {
        console.error('Failed to fetch total issues:', error);
      } else {
        setIssues(data || []);
      }
      setIsLoading(false);
    };

    fetchAllIssues();
  }, []);

  const handleSearchChange = async value => {
    const searchTerm = value.trim();
    setIsSearchTermEmpty(!searchTerm);

    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .ilike('title', `%${searchTerm}%`); // Search only by title, add more fields if needed

    if (error) {
      console.error('Search failed:', error);
    } else {
      setSearchResults(data || []);
    }

    setIsLoading(false);
  };

  const recentIssues = sortByNewest(totalIssues, 'createdAt').slice(0, 10);

  return (
    <IssueSearch>
      <SearchInputCont>
        <SearchInputDebounced
          autoFocus
          placeholder="Search issues by summary, description..."
          onChange={handleSearchChange}
        />
        <SearchIcon type="search" size={22} />
        {isLoading && <SearchSpinner />}
      </SearchInputCont>

      {isSearchTermEmpty && recentIssues.length > 0 && (
        <Fragment>
          <SectionTitle>Recent Issues</SectionTitle>
          {recentIssues.map(renderIssue)}
        </Fragment>
      )}

      {!isSearchTermEmpty && searchResults.length > 0 && (
        <Fragment>
          <SectionTitle>Matching Issues</SectionTitle>
          {searchResults.map(renderIssue)}
        </Fragment>
      )}

      {!isSearchTermEmpty && !isLoading && searchResults.length === 0 && (
        <NoResults>
          <NoResultsSVG />
          <NoResultsTitle>We couldn&apos;t find anything matching your search</NoResultsTitle>
          <NoResultsTip>Try again with a different term.</NoResultsTip>
        </NoResults>
      )}
    </IssueSearch>
  );
};

const renderIssue = issue => (
  <Link key={issue.id} to={`/project/board/issues/${issue.id}`}>
    <Issue>
      <IssueTypeIcon type={issue.type} size={25} />
      <IssueData>
        <IssueTitle>{issue.title}</IssueTitle>
        <IssueTypeId>{`${issue.type}-${issue.id}`}</IssueTypeId>
      </IssueData>
    </Issue>
  </Link>
);

ProjectIssueSearch.propTypes = propTypes;

export default ProjectIssueSearch;
