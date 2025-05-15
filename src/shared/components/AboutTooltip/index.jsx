import React from 'react';

import Button from 'shared/components/Button';
import Tooltip from 'shared/components/Tooltip';

import feedbackImage from './assets/feedback.png';
import { FeedbackDropdown, FeedbackImageCont, FeedbackImage, FeedbackParagraph } from './Styles';

const AboutTooltip = tooltipProps => (
  <Tooltip
    width={300}
    {...tooltipProps}
    renderContent={() => (
      <FeedbackDropdown>
        <FeedbackImageCont>
          <FeedbackImage src={feedbackImage} alt="Give feedback" />
        </FeedbackImageCont>

        <FeedbackParagraph>
          This simplified Jira clone is built with React on the front-end and supabase serverless
          back-end.
        </FeedbackParagraph>

        <FeedbackParagraph>
          {'Read more on my website or reach out via '}
          <a href="mailto:shindeshubham4241@gmail.com">
            <strong>shinde shubham</strong>
          </a>
        </FeedbackParagraph>

        {/* <a href="https://github.com/Its-Shinde4241/Jira-Clone-phase2" target="_blank" rel="noreferrer noopener">
          <Button variant="primary">Visit Website</Button>
        </a> */}

        <a href="https://github.com/Its-Shinde4241/Jira-Clone-phase2" target="_blank" rel="noreferrer noopener">
          <Button style={{ marginLeft: 10 }} icon="github">
            Github Repo
          </Button>
        </a>
      </FeedbackDropdown>
    )}
  />
);

export default AboutTooltip;
