import React, { useEffect, useState } from 'react';
import { Route, Redirect, useRouteMatch, useHistory } from 'react-router-dom';

import { createQueryParamModalHelpers } from 'shared/utils/queryParamModal';
import { PageLoader, Modal } from 'shared/components';

import { supabase } from 'config/supabaseClient';
import NavbarLeft from './NavbarLeft';
import Sidebar from './Sidebar';
import Board from './Board';
import IssueSearch from './IssueSearch';
import IssueCreate from './IssueCreate';
import ProjectSettings from './ProjectSettings';
import { ProjectPage } from './Styles';
import { getProjectWithUsersAndIssues } from './LoadProject';
import { useAuthGuard } from 'shared/hooks/useAuthGuard';

const Project = () => {
  useAuthGuard();

  const match = useRouteMatch();
  const history = useHistory();

  const issueSearchModalHelpers = createQueryParamModalHelpers('issue-search');
  const issueCreateModalHelpers = createQueryParamModalHelpers('issue-create');

  // const [projectdada, setprojectdata] = useState({ name: "not set", category: "not set", description: "none" });
  const [totalIssues, setTotalIssues] = useState([]);

  const fetchAllIssues = async () => {
    const { data: allIssues, error: selectIssuesError } = await supabase.from('issues').select();

    if (selectIssuesError || !allIssues) {
      console.error('Failed to fetch issues', selectIssuesError);
      return;
    }
    setTotalIssues(allIssues);
  };

  // const updateLocalProjectIssues = async (issueId, updatedFields) => {
  //   const { error } = await supabase.from("issues").update(updatedFields).eq("id", issueId)
  //   if (error) {
  //     console.log("Error in updating back issues after drag drop ", error)
  //   }
  // }
  const [projectdada, setprojectdata] = useState(null);

  const fetchData = async () => {
    const prData = await getProjectWithUsersAndIssues();
    setprojectdata(prData);
  };

  const setIssues = data => {
    setTotalIssues(data);
  };

  useEffect(() => {
    fetchData();
    fetchAllIssues();

    const channel = supabase
      .channel('realtime-issues')
      .on(
        'postgres_changes',
        {
          event: '*', // You can also specify 'UPDATE' only
          schema: 'public',
          table: 'issues',
        },
        payload => {
          // Merge changes into totalIssues
          setTotalIssues(prevIssues => {
            const index = prevIssues.findIndex(issue => issue.id === payload.new.id);
            if (index !== -1) {
              // Update existing issue
              const updated = [...prevIssues];
              updated[index] = payload.new;
              return updated;
            }
            // Add new issue
            return [...prevIssues, payload.new];
          });
        },
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (projectdada == null) {
    return <PageLoader />;
  }

  return (
    <ProjectPage>
      <NavbarLeft
        issueSearchModalOpen={issueSearchModalHelpers.open}
        issueCreateModalOpen={issueCreateModalHelpers.open}
      />

      <Sidebar project={projectdada} fetchData={fetchData} />

      {issueSearchModalHelpers.isOpen() && (
        <Modal
          isOpen
          testid="modal:issue-search"
          variant="aside"
          width={600}
          onClose={issueSearchModalHelpers.close}
          renderContent={() => <IssueSearch />}
        />
      )}

      {issueCreateModalHelpers.isOpen() && (
        <Modal
          isOpen
          testid="modal:issue-create"
          width={800}
          withCloseIcon={false}
          onClose={issueCreateModalHelpers.close}
          renderContent={modal => (
            <IssueCreate
              project={projectdada}
              fetchProject={fetchData}
              onCreate={() => history.push(`${match.url}/board`)}
              modalClose={modal.close}
            />
          )}
        />
      )}

      <Route
        path={`${match.path}/board`}
        render={() => (
          <Board
            project={projectdada}
            fetchProject={fetchData}
            // updateLocalProjectIssues={updateLocalProjectIssues}
            totalIssues={totalIssues}
            setIssues={setIssues}
          />
        )}
      />

      <Route
        path={`${match.path}/settings`}
        render={() => <ProjectSettings project={projectdada} fetchProject={fetchData} />}
      />

      {match.isExact && <Redirect to={`${match.url}/board`} />}
    </ProjectPage>
  );
};

export default Project;
