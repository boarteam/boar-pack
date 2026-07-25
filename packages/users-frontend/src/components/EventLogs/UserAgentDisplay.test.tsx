import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserAgentDisplay from './UserAgentDisplay';
import { getBrowserIcon } from './getBrowserIcon';

const CHROME_MAC_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const FIREFOX_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0';
const SAFARI_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15';
const EDGE_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
const OPERA_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0';
const CURL_UA = 'curl/8.4.0';

describe('UserAgentDisplay', () => {
  it('renders the parsed browser name and version for Chrome on Mac', () => {
    render(<UserAgentDisplay userAgent={CHROME_MAC_UA} />);
    expect(screen.getByText('Chrome 120.0.0.0')).toBeInTheDocument();
  });

  it('renders the brand icon class for the detected browser', () => {
    const { container } = render(<UserAgentDisplay userAgent={CHROME_MAC_UA} />);
    const icon = container.querySelector('i');
    expect(icon).not.toBeNull();
    expect(icon!.className).toBe('fab fa-chrome');
  });

  it('renders the fallback icon and parsed name for a non-browser agent', () => {
    const { container } = render(<UserAgentDisplay userAgent={CURL_UA} />);
    const icon = container.querySelector('i');
    expect(icon!.className).toBe('fas fa-question-circle');
  });
});

describe('getBrowserIcon', () => {
  it.each([
    ['Chrome', CHROME_MAC_UA, 'fab fa-chrome'],
    ['Firefox', FIREFOX_UA, 'fab fa-firefox'],
    ['Safari', SAFARI_UA, 'fab fa-safari'],
    ['Microsoft Edge', EDGE_UA, 'fab fa-edge'],
    ['Opera', OPERA_UA, 'fab fa-opera'],
  ])('returns the %s brand icon', (_name, ua, expected) => {
    expect(getBrowserIcon(ua)).toBe(expected);
  });

  it('falls back to the question-circle icon for unknown agents', () => {
    expect(getBrowserIcon(CURL_UA)).toBe('fas fa-question-circle');
  });
});
