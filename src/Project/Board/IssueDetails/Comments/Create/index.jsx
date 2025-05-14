import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';

import useCurrentUser from 'shared/hooks/currentUser';
import toast from 'shared/utils/toast';

import { supabase } from 'config/supabaseClient';
import BodyForm from '../BodyForm';
import ProTip from './ProTip';
import { Create, UserAvatar, Right, FakeTextarea } from './Styles';

const propTypes = {
  issueId: PropTypes.number.isRequired,
  fetchIssue: PropTypes.func.isRequired,
};

const ProjectBoardIssueDetailsCommentsCreate = ({ issueId, fetchIssue }) => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isCreating, setCreating] = useState(false);
  const [body, setBody] = useState('');

  const { currentUser } = useCurrentUser();
  const fetchUser = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', currentUser.email)
      .single(); // ensure you get one object instead of an array

    if (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }

    return data;
  };

  const handleCommentCreate = async () => {
    try {
      setCreating(true);

      const user = await fetchUser(); // wait for user to be fetched
      if (!user) {
        toast.error('User not found');
        setCreating(false);
        return;
      }

      await supabase.from('comments').insert([
        {
          body,
          issueId,
          userId: user.id,
        },
      ]);

      await fetchIssue();
      setFormOpen(false);
      setCreating(false);
      setBody('');
    } catch (error) {
      toast.error(error.message || 'Error creating comment');
      setCreating(false);
    }
  };

  return (
    <Create>
      {currentUser && <UserAvatar name={currentUser.name} avatarUrl={currentUser.avatarUrl} />}
      <Right>
        {isFormOpen ? (
          <BodyForm
            value={body}
            onChange={setBody}
            isWorking={isCreating}
            onSubmit={handleCommentCreate}
            onCancel={() => setFormOpen(false)}
          />
        ) : (
          <Fragment>
            <FakeTextarea onClick={() => setFormOpen(true)}>Add a comment...</FakeTextarea>
            <ProTip setFormOpen={setFormOpen} />
          </Fragment>
        )}
      </Right>
    </Create>
  );
};

ProjectBoardIssueDetailsCommentsCreate.propTypes = propTypes;

export default ProjectBoardIssueDetailsCommentsCreate;
