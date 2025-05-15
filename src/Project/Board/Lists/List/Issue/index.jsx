import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouteMatch } from 'react-router-dom';
import { Draggable } from 'react-beautiful-dnd';

import { IssueTypeIcon, IssuePriorityIcon } from 'shared/components';

import { supabase } from 'config/supabaseClient';
import { IssueLink, Issue, Title, Bottom, Assignees, AssigneeAvatar } from './Styles';

const propTypes = {
  projectUsers: PropTypes.array.isRequired,
  issue: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

const ProjectBoardListIssue = ({ projectUsers, issue, index }) => {
  const match = useRouteMatch();
  const [IssueUsers, setIssueUsers] = useState([]);
  
  useEffect(() => {
    let isMounted = true;

    const fetchIssueAndUser = async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('user_ids')
        .eq('id', issue.id)
        .single();

      if (isMounted) {
        if (data) {
          setIssueUsers(data?.user_ids);
        }
        if (error) {
          console.log('error in fetching userids from issues.user_Ids', error);
        }
      }
    };

    fetchIssueAndUser();

    return () => {
      isMounted = false; // Cleanup: component is unmounting
    };
  }, [issue]);


  const assignees = IssueUsers.map(userID => projectUsers.find(user => user.id === userID));

  return (
    <Draggable draggableId={issue.id.toString()} index={index}>
      {(provided, snapshot) => (
        <IssueLink
          to={`${match.url}/issues/${issue.id}`}
          ref={provided.innerRef}
          data-testid="list-issue"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Issue isBeingDragged={snapshot.isDragging && !snapshot.isDropAnimating}>
            <Title>{issue.title}</Title>
            <Bottom>
              <div>
                <IssueTypeIcon type={issue.type} />
                <IssuePriorityIcon priority={issue.priority} top={-1} left={4} />
              </div>
              <Assignees>
                {assignees.map(user => (
                  <AssigneeAvatar
                    key={user.id}
                    size={24}
                    avatarUrl={user.avatarUrl}
                    name={user.name}
                  />
                ))}
              </Assignees>
            </Bottom>
          </Issue>
        </IssueLink>
      )}
    </Draggable>
  );
};

ProjectBoardListIssue.propTypes = propTypes;

export default ProjectBoardListIssue;
