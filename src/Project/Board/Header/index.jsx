import React from 'react';

import { Button } from 'shared/components';

import { Header, BoardName } from './Styles';

const ProjectBoardHeader = () => (
  <Header>
    <BoardName>Kanban board</BoardName>
    <a
      href="https://github.com/Its-Shinde4241/Jira-Clone-phase2"
      target="_blank"
      rel="noreferrer noopener"
    >
      <Button icon="github">Github Repo</Button>
    </a>
  </Header>
);

export default ProjectBoardHeader;
