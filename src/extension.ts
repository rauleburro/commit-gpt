import * as vscode from "vscode";
import { OpenAI } from "openai";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

async function getGitDiff(): Promise<string> {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : undefined;

    if (!workspaceFolder) {
      vscode.window.showErrorMessage(
        "No hay una carpeta abierta en el área de trabajo."
      );
      return "";
    }

    const { stdout } = await execPromise(
      'git diff --staged -- . ":(exclude)package-lock.json"',
      {
        cwd: workspaceFolder,
      }
    );
    console.log("stdout:", stdout);
    return stdout;
  } catch (error) {
    vscode.window.showErrorMessage("Error al obtener los diffs: " + error);
    return "";
  }
}

async function generateCommitMessage(
  diff: string,
  apiKey: string
): Promise<string> {
  const openai = new OpenAI({
    apiKey,
  });

  const messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> = [
    {
      role: "system",
      content:
        "Eres un asistente que genera mensajes de commit claros y concisos utilizando los estandares de github, no solo dices que se hizo sino que intentas identificar los cambios y los archivos afectados, y si es posible, los archivos que se han modificado, para que el mensaje sea claro y conciso. El mensaje debe simpre estar en ingles. ",
    },
    {
      role: "user",
      content: `Genera un mensaje de commit para el siguiente diff:\n\n${diff}`,
    },
  ];

  const model = "gpt-4o";

  const response = await openai.chat.completions.create({
    model: model,
    messages: messages,
    max_tokens: 10000,
  });

  if (!response.choices || response.choices.length === 0) {
    return "No se pudo generar un mensaje.";
  }

  return (
    response.choices[0].message?.content?.trim() ||
    "No se pudo generar un mensaje."
  );
}

async function makeGitCommit(message: string): Promise<void> {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : undefined;

    if (!workspaceFolder) {
      vscode.window.showErrorMessage(
        "No hay una carpeta abierta en el área de trabajo."
      );
      return;
    }

    await execPromise(`git commit -m "${message}"`, { cwd: workspaceFolder });
    vscode.window.showInformationMessage("Commit realizado con éxito.");
  } catch (error) {
    vscode.window.showErrorMessage("Error al realizar el commit: " + error);
  }
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.generateCommit",
    async () => {
      const apiKey = vscode.workspace
        .getConfiguration()
        .get<string>("chatgpt.apiKey");
      if (!apiKey) {
        vscode.window.showErrorMessage("API Key de OpenAI no configurada.");
        return;
      }

      const diff = await getGitDiff();
      if (!diff) {
        return;
      }

      const commitMessage = await generateCommitMessage(diff, apiKey);
      if (commitMessage) {
        // Mostrar popup con botones
        vscode.window
          .showInformationMessage(
            `Mensaje generado: "${commitMessage}"`,
            { modal: true },
            "Commit"
          )
          .then(async (selection) => {
            if (selection === "Commit") {
              await makeGitCommit(commitMessage);
            } else {
              vscode.window.showInformationMessage("Commit cancelado.");
            }
          });
      } else {
        vscode.window.showErrorMessage(
          "No se pudo generar el mensaje de commit."
        );
      }

      // Opcional: copiar el mensaje al portapapeles
      await vscode.env.clipboard.writeText(commitMessage);
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
