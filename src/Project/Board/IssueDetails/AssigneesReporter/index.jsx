import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Avatar, Select, Icon } from 'shared/components';

import { supabase } from 'config/supabaseClient';
import { SectionTitle } from '../Styles';
import { User, Username } from './Styles';

const propTypes = {
  issue: PropTypes.object.isRequired,
  updateIssue: PropTypes.func.isRequired,
  projectUsers: PropTypes.array.isRequired,
  fetchProject: PropTypes.func.isRequired,
};

const ProjectBoardIssueDetailsAssigneesReporter = ({
  issue,
  updateIssue,
  projectUsers,
  fetchProject,
}) => {
  const [Assignees, setAsignees] = useState([]);

  const fetchAsignees = async () => {
    const { data, error } = await supabase
      .from('issues')
      .select('user_ids')
      .eq('id', issue.id)
      .single();
    if (!data || error) {
      console.log('Error while fetching asignee in issue_detail component ', error);
    } else {
      // console.log(data.user_ids);
      setAsignees(data?.user_ids);
    }
  };

  useEffect(() => {
    fetchAsignees();

    const subscription = supabase
      .channel('issue-assignees')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT | DELETE | UPDATE
          schema: 'public',
          table: 'issues',
          filter: `id=eq.${issue.id}`,
        },
        () => {
          fetchAsignees(); // Refresh the list on any change
          fetchProject();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchAsignees, fetchProject, issue.id]);

  const getUserById = userId => projectUsers.find(user => user.id === userId);

  const userOptions = projectUsers.map(user => ({ value: user.id, label: user.name }));

  return (
    <Fragment>
      <SectionTitle>Assignees</SectionTitle>
      <Select
        isMulti
        variant="empty"
        dropdownWidth={343}
        placeholder="Unassigned"
        name="assignees"
        value={Assignees}
        options={userOptions}
        onChange={async userIds => {
          // Update the user_ids array in the issues table
          const { error } = await supabase
            .from('issues')
            .update({ user_ids: userIds })
            .eq('id', issue.id);

          if (error) {
            console.error('Error updating assignees:', error);
            return;
          }

          setAsignees(userIds); // Update local state
          fetchProject(); // Optionally refresh the project data
        }}
        renderValue={({ value: userId, removeOptionValue }) =>
          renderUser(getUserById(userId), true, removeOptionValue)
        }
        renderOption={({ value: userId }) => renderUser(getUserById(userId), false)}
      />

      <SectionTitle>Reporter</SectionTitle>
      <Select
        variant="empty"
        dropdownWidth={343}
        withClearValue={false}
        name="reporter"
        value={issue.reporterId}
        options={userOptions}
        onChange={userId => updateIssue({ reporterId: userId })}
        renderValue={({ value: userId }) => renderUser(getUserById(userId), true)}
        renderOption={({ value: userId }) => renderUser(getUserById(userId))}
      />
    </Fragment>
  );
};

const renderUser = (user, isSelectValue, removeOptionValue) => {
  if (!user) return null;
  return (
    <User
      key={user.id}
      isSelectValue={isSelectValue}
      withBottomMargin={!!removeOptionValue}
      onClick={() => removeOptionValue && removeOptionValue()}
    >
      <Avatar avatarUrl={user.avatarUrl} name={user.name} size={24} />
      <Username>{user.name}</Username>
      {removeOptionValue && <Icon type="close" top={1} />}
    </User>
  );
};

ProjectBoardIssueDetailsAssigneesReporter.propTypes = propTypes;

export default ProjectBoardIssueDetailsAssigneesReporter;
