import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { describe, expect, it } from 'vitest';
import { QuestionMarkHint } from './QuestionMarkHint';

const messages = {
  'greeting.hint.title': 'About greetings',
  'greeting.hint.message': 'Hello, {name}!',
};

function renderHint() {
  return render(
    <IntlProvider locale="en" messages={messages}>
      <QuestionMarkHint intlPrefix="greeting" values={{ name: 'World' }} />
    </IntlProvider>,
  );
}

describe('QuestionMarkHint', () => {
  it('renders the question-mark icon', () => {
    const { container } = renderHint();
    expect(container.querySelector('.anticon-question-circle')).toBeTruthy();
  });

  it('shows the localized title and message on click', async () => {
    const user = userEvent.setup();
    const { container } = renderHint();

    await user.click(container.querySelector('.anticon-question-circle')!);

    expect(await screen.findByText('About greetings')).toBeInTheDocument();
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });
});
