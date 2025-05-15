import React, { Fragment, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import toast from 'shared/utils/toast';
import { formatDateTimeConversational } from 'shared/utils/dateTime';
import { ConfirmModal } from 'shared/components';

import { supabase } from 'config/supabaseClient';
import BodyForm from '../BodyForm';
import {
  Comment,
  UserAvatar,
  Content,
  Username,
  CreatedAt,
  Body,
  EditLink,
  DeleteLink,
} from './Styles';

const propTypes = {
  comment: PropTypes.object.isRequired,
  fetchIssue: PropTypes.func.isRequired,
  fetchIssueComments: PropTypes.func.isRequired,
};

const ProjectBoardIssueDetailsComment = ({ comment, fetchIssue, fetchIssueComments }) => {
  const [commentOwner, setCommentOwner] = useState({});
  const [isFormOpen, setFormOpen] = useState(false);
  const [isUpdating, setUpdating] = useState(false);
  const [body, setBody] = useState(comment.body);

  // const fetchcommentOwner = useCallback(async () => {
  //   const userid = comment.userId;
  //   const { data: Owner, error: UserFetchError } = await supabase
  //     .from('users')
  //     .select()
  //     .eq('id', userid)
  //     .single();

  //   if (UserFetchError) {
  //     console.log('Error in fetching comment owner', UserFetchError);
  //     return;
  //   }

  //   if (Owner) {
  //     setCommentOwner(Owner);
  //   }
  // }, [comment.userId]);

  useEffect(() => {
    let isMounted = true;

    const fetchcommentOwner = async () => {
      const userid = comment.userId;
      const { data: Owner, error: UserFetchError } = await supabase
        .from('users')
        .select()
        .eq('id', userid)
        .single();

      if (UserFetchError) {
        console.log('Error in fetching comment owner', UserFetchError);
        return;
      }

      if (Owner && isMounted) {
        setCommentOwner(Owner);
      }
    };

    fetchcommentOwner();

    return () => {
      isMounted = false;
    };
  }, [comment.userId]);


  if (!commentOwner) {
    console.log('error while finding comment owner');
  }

  const handleCommentUpdate = async () => {
    try {
      setUpdating(true);
      await supabase
        .from('comments')
        .update({ body })
        .eq('id', comment.id);
      await fetchIssue();
      setUpdating(false);
      setFormOpen(false);
      toast.success('Comment updated successfully');
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <Comment data-testid="issue-comment">
      <UserAvatar name={commentOwner.name} avatarUrl={commentOwner.avatarUrl} />
      <Content>
        <Username>{commentOwner.name}</Username>
        <CreatedAt>{formatDateTimeConversational(comment.createdAt)}</CreatedAt>

        {isFormOpen ? (
          <BodyForm
            value={body}
            onChange={setBody}
            isWorking={isUpdating}
            onSubmit={handleCommentUpdate}
            onCancel={() => setFormOpen(false)}
          />
        ) : (
          <Fragment>
            <Body>{comment.body}</Body>
            <EditLink onClick={() => setFormOpen(true)}>Edit</EditLink>
            <ConfirmModal
              title="Are you sure you want to delete this comment?"
              message="Once you delete, it's gone for good."
              confirmText="Delete comment"
              onConfirm={async modal => {
                try {
                  await supabase
                    .from('comments')
                    .delete()
                    .eq('id', comment.id);
                  await fetchIssueComments();
                  toast.success('comment deleted successfully');
                } catch (error) {
                  toast.error(error);
                }
              }}
              renderLink={modal => <DeleteLink onClick={modal.open}>Delete</DeleteLink>}
            />
          </Fragment>
        )}
      </Content>
    </Comment>
  );
};

ProjectBoardIssueDetailsComment.propTypes = propTypes;

export default ProjectBoardIssueDetailsComment;
