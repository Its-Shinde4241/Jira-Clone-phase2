import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { sortByNewest } from 'shared/utils/javascript';

import { supabase } from 'config/supabaseClient';
import Create from './Create';
import Comment from './Comment';
import { Comments, Title } from './Styles';

const propTypes = {
  issue: PropTypes.object.isRequired,
  fetchIssue: PropTypes.func.isRequired,
};

const ProjectBoardIssueDetailsComments = ({ issue, fetchIssue }) => {
  const [IssueComments, setIssueComments] = useState([]);

  const fetchIssueComments = useCallback(async () => {
    const { data: AllComments, error: errorFetchingcomments } = await supabase
      .from('comments')
      .select()
      .eq('issueId', issue.id);

    if (!AllComments || errorFetchingcomments) {
      console.log('error in fetching issue comments', errorFetchingcomments);
    }

    if (AllComments) {
      setIssueComments(AllComments);
    }
  }, [issue.id]);

  useEffect(() => {
    fetchIssueComments();

    const subscription = supabase
      .channel('issue-comments-channel')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT | DELETE | UPDATE
          schema: 'public',
          table: 'comments',
        },
        payload => {
          const relatedIssueId = payload.new?.issueId || payload.old?.issueId;
          if (relatedIssueId === issue.id) {
            fetchIssue();
            fetchIssueComments();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchIssue, fetchIssueComments, issue.id]);

  return (
    <Comments>
      <Title>Comments</Title>
      <Create issueId={issue.id} fetchIssue={fetchIssue} />

      {sortByNewest(IssueComments, 'createdAt').map(comment => (
        <Comment
          key={comment.id}
          comment={comment}
          fetchIssue={fetchIssue}
          fetchIssueComments={fetchIssueComments}
        />
      ))}
    </Comments>
  );
};

ProjectBoardIssueDetailsComments.propTypes = propTypes;

export default ProjectBoardIssueDetailsComments;
