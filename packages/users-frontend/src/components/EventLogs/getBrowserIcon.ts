import Bowser from 'bowser';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faChrome, faFirefox, faSafari, faEdge, faOpera } from '@fortawesome/free-brands-svg-icons';

// Add icons to the library
library.add(faChrome, faFirefox, faSafari, faEdge, faOpera);
dom.watch();

export function getBrowserIcon(userAgent: string): string {
  const browser = Bowser.getParser(userAgent);
  const browserName = browser.getBrowserName();

  switch (browserName) {
    case 'Chrome':
      return 'fab fa-chrome';
    case 'Firefox':
      return 'fab fa-firefox';
    case 'Safari':
      return 'fab fa-safari';
    case 'Microsoft Edge':
      return 'fab fa-edge';
    case 'Opera':
      return 'fab fa-opera';
    default:
      return 'fas fa-question-circle'; // Default icon for unknown browsers
  }
}
