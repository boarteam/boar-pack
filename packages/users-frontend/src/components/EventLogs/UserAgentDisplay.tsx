import React from 'react';
import Bowser from 'bowser';
import { getBrowserIcon } from './getBrowserIcon';

type UserAgentProps = {
  userAgent: string;
};

const UserAgentDisplay: React.FC<UserAgentProps> = ({ userAgent }) => {
  const browserIconClass = getBrowserIcon(userAgent);
  const browser = Bowser.getParser(userAgent).getBrowser();

  return (
    <span>
      <i className={browserIconClass} style={{ fontSize: '14px', marginRight: '4px' }}/>
      <span>{`${browser.name} ${browser.version}`}</span>
    </span>
  );
};

export default UserAgentDisplay;
