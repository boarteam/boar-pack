#!/bin/bash

# Load nvm and set up node environment
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use node 22 as specified in .zshrc
nvm use 22 > /dev/null 2>&1

# Add yarn to PATH
export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"

# If CLAUDE_ENV_FILE is set, persist the environment changes
if [ -n "$CLAUDE_ENV_FILE" ]; then
    echo "export PATH=\"$PATH\"" >> "$CLAUDE_ENV_FILE"
    echo "export NVM_DIR=\"$NVM_DIR\"" >> "$CLAUDE_ENV_FILE"
    echo "export NODE_VERSION=\"$(node --version 2>/dev/null)\"" >> "$CLAUDE_ENV_FILE"
fi

exit 0
