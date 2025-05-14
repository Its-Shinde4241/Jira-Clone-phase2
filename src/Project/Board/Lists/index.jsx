import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-beautiful-dnd';

import useCurrentUser from 'shared/hooks/currentUser';
import { moveItemWithinArray, insertItemIntoArray } from 'shared/utils/javascript';
import { IssueStatus } from 'shared/constants/issues';

import { supabase } from 'config/supabaseClient';
import List from './List';
import { Lists } from './Styles';

const propTypes = {
  project: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  // updateLocalProjectIssues: PropTypes.func.isRequired,
  totalIssues: PropTypes.array.isRequired,
  setIssues: PropTypes.func.isRequired,
};

const ProjectBoardLists = ({ project, filters, totalIssues, setIssues }) => {
  const { currentUser } = useCurrentUser();
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: user, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', currentUser?.email)
        .single();

      if (user) setCurrentUserId(user.id);
      if (error) console.error('Failed to fetch current user', error);
    };

    if (currentUser?.email) {
      fetchUser();
    }
  }, [currentUser]);

  const handleIssueDrop = async ({ draggableId, destination, source }) => {
    if (!isPositionChanged(source, destination)) return;

    const issueId = Number(draggableId);

    // Calculate the new position
    const newStatus = destination.droppableId;
    const newListPosition = calculateIssueListPosition(totalIssues, destination, source, issueId);

    // Update the local state immediately for a smoother UI experience
    const updatedIssues = totalIssues.map(issue =>
      issue.id === issueId ? { ...issue, status: newStatus, listPosition: newListPosition } : issue,
    );
    setIssues(updatedIssues);

    // Update in the database
    const { error } = await supabase
      .from('issues')
      .update({
        status: newStatus,
        listPosition: newListPosition,
      })
      .eq('id', issueId);

    if (error) {
      console.error('Error in updating issues in board:', error);
      // If there's an error, revert the local state by refetching
    }
    // fetchAllIssues();

    // Update the parent component's state
    // await updateLocalProjectIssues(issueId, {
    //   status: newStatus,
    //   listPosition: newListPosition
    // });
  };

  return (
    <DragDropContext onDragEnd={handleIssueDrop}>
      <Lists>
        {Object.values(IssueStatus).map(status => (
          <List
            key={status}
            status={status}
            project={project}
            filters={filters}
            currentUserId={currentUserId}
            totalIssues={totalIssues}
          />
        ))}
      </Lists>
    </DragDropContext>
  );
};

const isPositionChanged = (destination, source) => {
  if (!destination) return false;
  const isSameList = destination.droppableId === source.droppableId;
  const isSamePosition = destination.index === source.index;
  return !isSameList || !isSamePosition;
};

const calculateIssueListPosition = (...args) => {
  const { prevIssue, nextIssue } = getAfterDropPrevNextIssue(...args);
  let position;

  if (!prevIssue && !nextIssue) {
    position = 1;
  } else if (!prevIssue) {
    position = nextIssue.listPosition - 1;
  } else if (!nextIssue) {
    position = prevIssue.listPosition + 1;
  } else {
    position = prevIssue.listPosition + (nextIssue.listPosition - prevIssue.listPosition) / 2;
  }
  return position;
};

const getAfterDropPrevNextIssue = (allIssues, destination, source, droppedIssueId) => {
  const beforeDropDestinationIssues = getSortedListIssues(allIssues, destination.droppableId);
  const droppedIssue = allIssues.find(issue => issue.id === droppedIssueId);
  const isSameList = destination.droppableId === source.droppableId;

  const afterDropDestinationIssues = isSameList
    ? moveItemWithinArray(beforeDropDestinationIssues, droppedIssue, destination.index)
    : insertItemIntoArray(beforeDropDestinationIssues, droppedIssue, destination.index);

  return {
    prevIssue: afterDropDestinationIssues[destination.index - 1],
    nextIssue: afterDropDestinationIssues[destination.index + 1],
  };
};

const getSortedListIssues = (issues, status) =>
  issues.filter(issue => issue.status === status).sort((a, b) => a.listPosition - b.listPosition);

ProjectBoardLists.propTypes = propTypes;

export default ProjectBoardLists;
