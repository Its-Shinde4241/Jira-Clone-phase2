import React, { Fragment, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { PageError, CopyLinkButton, Button, AboutTooltip } from 'shared/components';

import { supabase } from 'config/supabaseClient';
import Loader from './Loader';
import Type from './Type';
import Delete from './Delete';
import Title from './Title';
import Description from './Description';
import Comments from './Comments';
import Status from './Status';
import AssigneesReporter from './AssigneesReporter';
import Priority from './Priority';
import EstimateTracking from './EstimateTracking';
import Dates from './Dates';
import { TopActions, TopActionsRight, Content, Left, Right } from './Styles';

const propTypes = {
  issueId: PropTypes.string.isRequired,
  projectUsers: PropTypes.array.isRequired,
  modalClose: PropTypes.func.isRequired,
  setIssues: PropTypes.func.isRequired,
  totalIssues: PropTypes.array.isRequired,
  fetchProject: PropTypes.func.isRequired,
};

const ProjectBoardIssueDetails = ({
  issueId,
  projectUsers,
  modalClose,
  // updateLocalProjectIssues,
  setIssues,
  totalIssues,
  fetchProject,
}) => {
  const [FetchedIssue, setFetchedIssue] = useState(null);
  const [Error, setError] = useState(null);

  const fetchIssue = useCallback(async () => {
    const { data: issueData, error } = await supabase
      .from('issues')
      .select()
      .eq('id', issueId)
      .single();

    if (error) {
      setError(error);
      console.log('Error in fetching particular issue from issue id', error);
    }

    if (issueData) {
      setFetchedIssue(issueData);
    }
  });

  useEffect(() => {
    fetchIssue();

    const subscription = supabase
      .channel('realtime-single-issue')
      .on(
        'postgres_changes',
        {
          event: '*', // 'UPDATE', 'DELETE'
          schema: 'public',
          table: 'issues',
          filter: `id=eq.${issueId}`,
        },
        payload => {
          if (payload.eventType === 'DELETE') {
            // If the issue is deleted, close the modal (or show a message)
            modalClose();
          } else {
            fetchIssue(); // Refresh the issue
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchIssue, issueId, modalClose]);

  if (!FetchedIssue) return <Loader />;
  if (Error && Error.message) return <PageError />;

  const issue = FetchedIssue;

  const updateIssue = async updatedFields => {
    const { error: updateIssueError } = await supabase
      .from('issues')
      .update(updatedFields)
      .eq('id', issueId);

    if (updateIssueError) {
      console.log('Error in updating issue', updateIssueError);
    }

    const updatedIssues = totalIssues.map(iss => {
      if (iss.id === issueId) {
        return {
          ...iss,
          ...updatedFields,
        };
      }
      return iss;
    });

    setIssues(updatedIssues);
    // await updateLocalProjectIssues(issueId, updatedFields);
  };

  return (
    <Fragment>
      <TopActions>
        <Type issue={issue} updateIssue={updateIssue} />
        <TopActionsRight>
          <AboutTooltip
            renderLink={linkProps => (
              <Button icon="feedback" variant="empty" {...linkProps}>
                Give feedback
              </Button>
            )}
          />
          <CopyLinkButton variant="empty" />
          <Delete
            issue={issue}
            modalClose={modalClose}
            totalIssues={totalIssues}
            setIssues={setIssues}
          />
          <Button icon="close" iconSize={24} variant="empty" onClick={modalClose} />
        </TopActionsRight>
      </TopActions>
      <Content>
        <Left>
          <Title issue={issue} updateIssue={updateIssue} />
          <Description issue={issue} updateIssue={updateIssue} />
          <Comments issue={issue} fetchIssue={fetchIssue} />
        </Left>
        <Right>
          <Status issue={issue} updateIssue={updateIssue} />
          <AssigneesReporter
            issue={issue}
            updateIssue={updateIssue}
            projectUsers={projectUsers}
            fetchProject={fetchProject}
          />
          <Priority issue={issue} updateIssue={updateIssue} />
          <EstimateTracking issue={issue} updateIssue={updateIssue} />
          <Dates issue={issue} />
        </Right>
      </Content>
    </Fragment>
  );
};

ProjectBoardIssueDetails.propTypes = propTypes;

export default ProjectBoardIssueDetails;
