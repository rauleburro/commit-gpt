# Commit GPT

The "Commit GPT" extension generates commit messages based on code changes (diffs) using the OpenAI API. It helps you write clear, concise, and professional messages directly from Visual Studio Code.

## Features

- **Automatic Commit Message Generation**: Uses AI to analyze code diffs and create appropriate messages.
- **Interactive Interface**: Displays a popup with the generated message and options to confirm or cancel the commit.
- **Git Integration**: Automatically runs the `git commit` command upon confirming a message.

## Requirements

- A project with Git version control.
- OpenAI API Key:
  - Sign up at [OpenAI](https://platform.openai.com/signup).
  - Generate an API key from [OpenAI API Keys](https://platform.openai.com/account/api-keys).
  - Configure the key in the extension settings in VS Code (`chatgpt.apiKey`).

## Extension Settings

This extension contributes the following settings:

- `chatgpt.apiKey`: API key to interact with OpenAI.

## Known Issues

- Message generation may fail if there are no changes in the staging area (`git add`).
- Ensure Git is correctly configured on your system.

## Release Notes

### 1.0.0

- Initial release with support for:
  - Commit message generation based on diffs.
  - Interactive interface to confirm or cancel the commit.

---

## Following extension guidelines

This extension adheres to the [best practices guidelines](https://code.visualstudio.com/api/references/extension-guidelines) for Visual Studio Code.

## Working with Markdown

You can write and edit this README using Visual Studio Code. Access the preview (`Shift+Ctrl+V` or `Shift+Cmd+V` on macOS) to verify formatting.

---

**Enjoy a smoother and more professional commit experience with Commit GPT!**
