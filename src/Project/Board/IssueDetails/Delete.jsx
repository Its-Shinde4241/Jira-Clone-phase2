import React from 'react';
import PropTypes from 'prop-types';

// import api from 'shared/utils/api';
import toast from 'shared/utils/toast';
import { Button, ConfirmModal } from 'shared/components';
import { supabase } from 'config/supabaseClient';

const propTypes = {
  issue: PropTypes.object.isRequired,
  totalIssues: PropTypes.array.isRequired,
  setIssues: PropTypes.func.isRequired,
  modalClose: PropTypes.func.isRequired,
};

const ProjectBoardIssueDetailsDelete = ({ issue, modalClose, totalIssues, setIssues }) => {
  const handleIssueDelete = async () => {
    try {
      // await fetchProject();
      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', issue.id);
      if (error) {
        console.log('Error in deleting issue in ', error);
      }
      const updatedIssues = totalIssues.filter(iss => iss.id !== issue.id);
      setIssues(updatedIssues);

      modalClose();
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <ConfirmModal
      title="Are you sure you want to delete this issue?"
      message="Once you delete, it's gone for good."
      confirmText="Delete issue"
      onConfirm={handleIssueDelete}
      renderLink={modal => (
        <Button icon="trash" iconSize={19} variant="empty" onClick={modal.open} />
      )}
    />
  );
};

ProjectBoardIssueDetailsDelete.propTypes = propTypes;

export default ProjectBoardIssueDetailsDelete;
